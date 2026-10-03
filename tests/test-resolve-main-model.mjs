import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
const here=path.dirname(fileURLToPath(import.meta.url));
const script=path.resolve(here,'../quota-aware-agents/scripts/resolve-main-model.mjs');
const dir=fs.mkdtempSync(path.join(here,'.model-fixture-'));
const dbfile=path.join(dir,'state.sqlite'),roll=path.join(dir,'bound.jsonl'),host=path.join(dir,'host.json');
const db=new DatabaseSync(dbfile);db.exec('CREATE TABLE threads(id TEXT PRIMARY KEY,rollout_path TEXT,title TEXT,model TEXT)');db.prepare('INSERT INTO threads VALUES(?,?,?,?)').run('bound',roll,'PRIVATE_TITLE','gpt-6-astra');db.close();
const baseEnv={...process.env};delete baseEnv.CODEX_THREAD_ID;delete baseEnv.CODEX_SESSION_ID;
const row=(type,payload)=>({type,payload});
const meta=row('session_meta',{id:'bound',body:'PRIVATE_BODY',credentials:'PRIVATE_SECRET'});
const start=turn=>row('event_msg',{type:'task_started',turn_id:turn});
const ctx=(turn,model='gpt-6.1-sol',effort='high')=>row('turn_context',{turn_id:turn,model,effort});
function write(rows){fs.writeFileSync(roll,rows.map(x=>JSON.stringify(x)).join('\n')+'\n');}
function invoke(args=[],env={CODEX_THREAD_ID:'bound'}){const r=spawnSync(process.execPath,[script,'--db',dbfile,...args],{env:{...baseEnv,...env},encoding:'utf8'});return {...r,data:r.status===0&&r.stdout.startsWith('{')?JSON.parse(r.stdout):null};}
function hostFile(overrides={}){fs.writeFileSync(host,JSON.stringify({thread_id:'bound',turn_id:'t',active_turn_id:'t',model:'gpt-6.1-sol',effort:'high',body:'PRIVATE_BODY',...overrides}));return ['--host-metadata',host];}
test.after(()=>{const target=fs.realpathSync(dir),root=fs.realpathSync(here);assert.ok(target.startsWith(root+path.sep)&&path.basename(target).startsWith('.model-fixture-'));fs.rmSync(target,{recursive:true});});
test('current binding selects active Astra/Sol/other/unmapped and emits minimal metadata only',()=>{
 for(const [model,strategy,status]of [['gpt-6-astra','astra_main','known'],['gpt-6.1-sol','sol_main','known'],['gpt-6-sol','other_known','known'],['gpt-6-luna','other_known','known'],['future-model','unknown','unknown']]) {
  write([meta,start('t'),ctx('t',model)]);const before=fs.readFileSync(dbfile),r=invoke();assert.equal(r.status,0);assert.equal(r.data.model,model);assert.equal(r.data.strategy,strategy);assert.equal(r.data.status,status);
  assert.deepEqual(Object.keys(r.data).sort(),['status','model','effort','source','thread_id','turn_id','strategy','reason'].sort());assert.doesNotMatch(r.stdout,/PRIVATE/);assert.deepEqual(fs.readFileSync(dbfile),before);
 }
});
test('fresh invocation follows new active turn and refuses ended/old context',()=>{
 write([meta,start('old'),ctx('old','gpt-6-astra'),row('event_msg',{type:'task_complete',turn_id:'old'}),start('t'),ctx('t')]);assert.equal(invoke().data.model,'gpt-6.1-sol');
 write([meta,start('old'),ctx('old'),row('event_msg',{type:'task_complete',turn_id:'old'})]);assert.equal(invoke().data.status,'unknown');
 write([meta,start('old'),ctx('old'),start('new')]);assert.equal(invoke().data.model,null);assert.equal(invoke().data.turn_id,'new');
});
test('environment/assertion/session identity/context conflicts fail closed',()=>{
 write([meta,start('t'),ctx('t')]);assert.equal(invoke([],{CODEX_THREAD_ID:'bound',CODEX_SESSION_ID:'other'}).data.status,'unknown');
 assert.equal(invoke(['--thread','other']).data.status,'unknown');assert.equal(invoke(['--turn','old']).data.status,'unknown');
 write([row('session_meta',{id:'other'}),start('t'),ctx('t')]);assert.equal(invoke().data.model,null);
 write([meta,start('t'),ctx('t'),ctx('t','gpt-6-astra')]);assert.equal(invoke().data.status,'unknown');
 write([meta,start('old'),ctx('old'),ctx('old','gpt-6-astra'),row('event_msg',{type:'task_complete',turn_id:'old'}),start('t'),ctx('t')]);assert.equal(invoke().data.strategy,'sol_main');
});
test('explicit reliable host works without local database and verifies all available bindings',()=>{
 write([meta,start('t'),ctx('t')]);assert.equal(invoke(hostFile()).data.source,'host_metadata');
 assert.equal(invoke(hostFile({model:'gpt-6-astra'})).data.status,'unknown');
 assert.equal(invoke(hostFile({active_turn_id:'old'})).data.status,'unknown');assert.equal(invoke(hostFile({thread_id:'other'})).data.status,'unknown');
 const h=hostFile();const r=spawnSync(process.execPath,[script,'--db',path.join(dir,'absent.sqlite'),...h],{env:baseEnv,encoding:'utf8'});assert.equal(JSON.parse(r.stdout).status,'known');
 write([meta,start('t'),ctx('t'),row('event_msg',{type:'task_complete',turn_id:'t'})]);assert.equal(invoke(hostFile()).data.status,'unknown');
});
test('unbound, missing metadata, malformed source and unsupported schema return normal unknown',()=>{
 write([meta,start('t'),ctx('t')]);assert.equal(invoke([],{}).data.reason,'current_session_unbound');
 write([meta,start('t'),row('turn_context',{turn_id:'t',effort:'high'})]);assert.equal(invoke().data.status,'unknown');
 fs.writeFileSync(roll,'{"body":"PRIVATE_BODY"');assert.equal(invoke().status,0);assert.equal(invoke().data.status,'unknown');
 const other=path.join(dir,'unsupported.sqlite'),d=new DatabaseSync(other);d.exec('CREATE TABLE threads(title TEXT)');d.close();
 const r=spawnSync(process.execPath,[script,'--db',other],{env:{...baseEnv,CODEX_THREAD_ID:'bound'},encoding:'utf8'});assert.equal(JSON.parse(r.stdout).reason,'unsupported_local_schema');
});
test('help and invalid parameters have explicit exit behavior',()=>{
 assert.equal(invoke(['--bogus']).status,1);assert.equal(invoke(['--thread','bound','--thread','bound']).status,1);assert.equal(invoke(['--turn']).status,1);
 const r=spawnSync(process.execPath,[script,'--help'],{env:baseEnv,encoding:'utf8'});assert.equal(r.status,0);assert.match(r.stdout,/active/);
});
test('reliable active model survives missing effort with explicit null',()=>{
 write([meta,start('t'),row('turn_context',{turn_id:'t',model:'gpt-6-astra'})]);const r=invoke();assert.equal(r.data.strategy,'astra_main');assert.equal(r.data.effort,null);
 write([meta,start('t'),ctx('t')]);const h=hostFile({effort:undefined});assert.equal(invoke(h).data.status,'known');assert.equal(invoke(h).data.effort,null);
});
