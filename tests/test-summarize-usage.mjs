import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

const here=path.dirname(fileURLToPath(import.meta.url)),script=path.resolve(here,'../quota-aware-agents/scripts/summarize-usage.mjs');
const temp=fs.mkdtempSync(path.join(here,'.usage-fixture-'));let seq=0;
const tm=n=>`2026-10-01T00:${String(n).padStart(2,'0')}:00Z`,cutoff=tm(3);
const row=(type,payload,n=0)=>({type,timestamp:tm(n),payload});
const source=parent=>({subagent:{thread_spawn:{parent_thread_id:parent}}});
const guardian={subagent:{other:'guardian'}};
const tokens=n=>({input_tokens:n/2,cached_input_tokens:0,cache_write_input_tokens:0,output_tokens:n/2,reasoning_output_tokens:0,total_tokens:n});
const ctx=(turn='t',model='gpt-6.1-sol',n=0,extra={})=>row('turn_context',{turn_id:turn,model,effort:'high',service_tier:'default',...extra},n);
const req=(thread,response,total,n=2,extra={})=>row('token_usage_record',{thread_id:thread,turn_id:'t',response_id:response,usage:tokens(total),thread_token_usage:tokens(total),...extra},n);
function fixture(threads,edges=[],{schemaSources=true}={}) {
 const dir=path.join(temp,`case-${++seq}`);fs.mkdirSync(dir);const home=path.join(dir,'home');fs.mkdirSync(home);const dbfile=path.join(home,'state.sqlite');
 const db=new DatabaseSync(dbfile);db.exec(`CREATE TABLE threads(id TEXT PRIMARY KEY,rollout_path TEXT,title TEXT,model TEXT,agent_path TEXT,created_at_ms INTEGER${schemaSources?',source TEXT,thread_source TEXT':''}); CREATE TABLE thread_spawn_edges(parent_thread_id TEXT,child_thread_id TEXT)`);
 const insert=db.prepare(`INSERT INTO threads VALUES(${Array(schemaSources?8:6).fill('?').join(',')})`);
 for(const t of threads) {
  const file=path.join(home,`${t.id}.jsonl`);const s=t.source===undefined?'vscode':t.source,ts=t.thread_source===undefined?'user':t.thread_source;
  insert.run(t.id,file,'PRIVATE_TITLE','DATABASE_MODEL_IGNORED',t.agent||null,t.created===undefined?Date.parse(tm(0)):t.created,...(schemaSources?[typeof s==='object'&&s!==null?JSON.stringify(s):s,ts]:[]));
  if(!t.missing)fs.writeFileSync(file,[row('session_meta',{id:t.id,source:s,thread_source:ts,body:'PRIVATE_BODY',credentials:'PRIVATE_SECRET'}),...(t.rows||[])].map(r=>JSON.stringify(r)).join('\n')+'\n'+(t.malformed||''));
 }
 for(const [a,b]of edges)db.prepare('INSERT INTO thread_spawn_edges VALUES(?,?)').run(a,b);db.close();
 return {dir,home,dbfile,threads};
}
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function run(f,roots=['a'],extra=[],out=path.join(f.dir,`out-${++seq}`),cutoffAt=cutoff) {
 const inputs=[f.dbfile,...f.threads.filter(t=>!t.missing).map(t=>path.join(f.home,`${t.id}.jsonl`))],before=inputs.map(hash);
 const r=spawnSync(process.execPath,[script,...roots.flatMap(x=>['--thread',x]),'--cutoff',cutoffAt,'--db',f.dbfile,'--codex-home',f.home,'--out',out,...extra],{encoding:'utf8'});
 assert.deepEqual(inputs.map(hash),before,'sources stay unchanged');
 return {...r,out,data:r.status===0?JSON.parse(fs.readFileSync(path.join(out,'usage-summary.json'),'utf8')):null,ledger:r.status===0&&fs.existsSync(path.join(out,'usage-ledger.jsonl'))?fs.readFileSync(path.join(out,'usage-ledger.jsonl'),'utf8').trim().split('\n').filter(Boolean).map(JSON.parse):null};
}
test.after(()=>{const root=fs.realpathSync(here),target=fs.realpathSync(temp);assert.ok(target.startsWith(root+path.sep)&&path.basename(target).startsWith('.usage-fixture-'));fs.rmSync(target,{recursive:true});});

test('legacy single-root CLI retains outputs and historical context, ignores legacy cumulative as requests',()=>{
 const f=fixture([{id:'a',rows:[ctx('t','gpt-6-astra'),req('a','r',10),row('event_msg',{type:'token_count',info:{total_token_usage:tokens(999)}},3)]}]);
 const r=run(f);assert.equal(r.status,0,r.stderr);assert.equal(r.data.root_thread_id,'a');assert.equal(r.data.format_version,2);assert.equal(r.data.calls,1);assert.equal(r.data.grand_total.total_tokens,10);assert.equal(r.data.by_model[0].key,'gpt-6-astra');assert.equal(r.data.by_source[0].key,'main');assert.equal(r.data.files[0].last_legacy_cumulative.total_tokens,999);assert.equal(r.ledger,null);
 assert.doesNotMatch(fs.readFileSync(path.join(r.out,'usage-summary.json'),'utf8'),/PRIVATE|DATABASE_MODEL_IGNORED/);
});
test('since is exclusive/cutoff inclusive, uses preceding context and separates interval from full cumulative',()=>{
 const rows=[ctx(),req('a','r0',10,0),req('a','r1',20,1,{thread_token_usage:tokens(30)}),req('a','r2',30,2,{thread_token_usage:tokens(60)}),req('a','r3',40,3,{thread_token_usage:tokens(100)}),req('a','r4',50,4,{thread_token_usage:tokens(150)})];
 const r=run(fixture([{id:'a',rows}]),['a'],['--since',tm(1),'--ledger']);assert.equal(r.status,0,r.stderr);assert.equal(r.data.calls,2);assert.equal(r.data.grand_total.total_tokens,70);assert.equal(r.data.full_diagnostic.total.total_tokens,100);assert.equal(r.data.files[0].last_cumulative.total_tokens,100);assert.equal(r.data.files[0].sum_minus_cumulative,null);assert.equal(r.data.files[0].full_diagnostic.sum_minus_cumulative.total_tokens,0);assert.ok(!r.data.checks.some(x=>x.type==='cumulative_mismatch'));assert.deepEqual(r.ledger.map(x=>x.response_id),['r2','r3']);assert.equal(r.data.by_model[0].key,'gpt-6.1-sol');
});
test('multiple explicit roots, duplicate roots and shared descendants count once; a worker root stays worker',()=>{
 const f=fixture([{id:'a',rows:[ctx(),req('a','ra',10)]},{id:'b',rows:[ctx(),req('b','rb',20)]},{id:'w',source:source('a'),thread_source:'subagent',rows:[ctx(),req('w','rw',30),req('a','foreign',900)]}],[['a','w'],['b','w']]);
 const r=run(f,['a','b','a'],['--ledger']);assert.equal(r.status,0,r.stderr);assert.equal(r.data.thread_count,3);assert.equal(r.data.calls,3);assert.equal(r.data.grand_total.total_tokens,60);assert.deepEqual(r.data.requested_roots,['a','b','a']);assert.deepEqual(r.data.root_thread_ids,['a','b']);assert.equal(r.data.root_thread_id,null);assert.equal(r.data.files.find(x=>x.thread_id==='w').foreign,1);assert.equal(r.data.by_source.find(x=>x.key==='worker').calls,1);
 const worker=run(f,['w']);assert.equal(worker.data.by_source[0].key,'worker');assert.equal(worker.data.calls,1);
});
test('response IDs deduplicate globally; conflicting duplicates and missing IDs remain visible',()=>{
 const duplicate=req('a','same',10,2),conflict=req('a','same',20,3),missing=req('a',null,30,2);
 const f=fixture([{id:'a',rows:[ctx(),duplicate,duplicate,conflict,missing,missing]},{id:'b',rows:[ctx(),req('b','same',10)]}]);
 const r=run(f,['a','b'],['--ledger']);assert.equal(r.status,0,r.stderr);assert.equal(r.data.calls,3);assert.equal(r.data.grand_total.total_tokens,70);assert.equal(r.ledger.filter(x=>x.response_id===null).length,2);assert.ok(r.data.checks.some(x=>x.type==='conflicting_duplicate'));assert.ok(r.data.checks.some(x=>x.type==='missing_response_id_not_deduplicated'));assert.equal(r.data.files.reduce((n,x)=>n+x.duplicates,0),3);
});
test('pre-since duplicate response cannot reappear as an interval request',()=>{
 const f=fixture([{id:'a',rows:[ctx(),req('a','old',10,0),req('a','old',10,2),req('a','new',20,3,{thread_token_usage:tokens(30)})]}]);const r=run(f,['a'],['--since',tm(1)]);assert.equal(r.data.calls,1);assert.equal(r.data.grand_total.total_tokens,20);assert.equal(r.data.full_diagnostic.calls,2);
});
test('out-of-order timestamps do not attach future context or replace latest cumulative with an old counter',()=>{
 const f=fixture([{id:'a',rows:[ctx('t','gpt-6-astra',2),req('a','early',10,1),req('a','last',20,3,{thread_token_usage:tokens(60)}),req('a','middle',30,2,{thread_token_usage:tokens(40)})]}]);
 const r=run(f,['a'],['--ledger']);assert.equal(r.status,0,r.stderr);assert.equal(r.ledger.find(x=>x.response_id==='early').model,null);assert.equal(r.data.files[0].last_cumulative.total_tokens,60);assert.equal(r.data.files[0].full_diagnostic.sum_minus_cumulative.total_tokens,0);
});
test('unknown/invalid fields, source absence and source conflicts stay partial without zero fabrication',()=>{
 const f=fixture([{id:'a',source:null,thread_source:null,rows:[ctx('t',null,0,{effort:null}),req('a','r',10,2,{usage:{input_tokens:8,output_tokens:'invalid'},thread_token_usage:{input_tokens:8}})]},{id:'b',source:source('other'),thread_source:'user',rows:[ctx(),req('b','b',20)]}]);
 const r=run(f,['a','b'],['--ledger']);assert.equal(r.status,0,r.stderr);assert.equal(r.data.telemetry_status,'partial');assert.equal(r.ledger.find(x=>x.thread_id==='a').total_tokens,null);assert.equal(r.ledger.find(x=>x.thread_id==='a').model,null);assert.equal(r.data.field_coverage.output_tokens.invalid,1);assert.deepEqual(new Set(r.data.source_classification.unknown_threads),new Set(['a','b']));assert.ok(r.data.checks.some(x=>x.type==='conflicting_thread_source'));
 const old=fixture([{id:'a',source:null,thread_source:null,rows:[ctx(),req('a','r',10)]}],[],{schemaSources:false});assert.equal(run(old).data.by_source[0].key,'unknown');
});
test('guardian only appears when explicitly selected or reached through selected spawn edges',()=>{
 const f=fixture([{id:'a',rows:[ctx(),req('a','a',10)]},{id:'g',source:guardian,thread_source:'guardian_review',rows:[ctx(),req('g','g',20)]},{id:'unrelated',source:guardian,thread_source:'guardian_review',missing:true}],[['a','g']]);
 const r=run(f);assert.equal(r.data.thread_count,2);assert.equal(r.data.by_source.find(x=>x.key==='guardian').calls,1);assert.ok(!r.data.files.some(x=>x.thread_id==='unrelated'));
 const explicit=run(f,['g']);assert.equal(explicit.data.thread_count,1);assert.equal(explicit.data.by_source[0].key,'guardian');
});
test('missing rollout, malformed lines, missing descendants and post-cutoff children produce bounded partial evidence',()=>{
 const f=fixture([{id:'a',rows:[ctx(),req('a','a',10)],malformed:'{"bad"'},{id:'missing',missing:true,source:source('a'),thread_source:'subagent'},{id:'future',created:Date.parse(tm(4)),source:source('a'),thread_source:'subagent',rows:[ctx(),req('future','future',900)]}],[['a','missing'],['a','future'],['a','absent']]);
 const r=run(f);assert.equal(r.status,0,r.stderr);assert.equal(r.data.calls,1);assert.equal(r.data.telemetry_status,'partial');assert.deepEqual(r.data.excluded_threads_created_after_cutoff,['future']);assert.ok(r.data.checks.some(x=>x.type==='missing_file'));assert.ok(r.data.checks.some(x=>x.type==='spawn_edges_missing_threads'));assert.ok(r.data.checks.some(x=>x.type==='malformed_json'));
});
test('parameters/root/schema errors are failures with source text withheld',()=>{
 const f=fixture([{id:'a',rows:[ctx(),req('a','r',10)]}]);
 for(const extra of [['--unknown'],['--since','not-a-time'],['--since','2026-10-01T00:00:00'],['--since',cutoff],['--cutoff','2026-02-30T00:00:00Z'],['--ledger','--ledger'],['--since']])assert.equal(run(f,['a'],extra).status,1);
 assert.equal(run(f,['missing-root']).status,1);
 const fractional=run(f,['a'],[],undefined,cutoff.replace('Z','.000000Z'));assert.equal(fractional.status,0,fractional.stderr);assert.equal(fractional.data.calls,1);
 assert.equal(run(f,['a'],[],undefined,'2026-02-30T00:00:00Z').status,1);
 const db=new DatabaseSync(f.dbfile);db.exec('DROP TABLE thread_spawn_edges');db.close();assert.equal(run(f).status,1);
 const h=spawnSync(process.execPath,[script,'--help'],{encoding:'utf8'});assert.equal(h.status,0);
});
test('existing output, traversal, input/home overlap and junction escape refuse writes',()=>{
 const f=fixture([{id:'a',rows:[ctx(),req('a','r',10)]}]);
 const empty=path.join(f.dir,'empty');fs.mkdirSync(empty);assert.equal(run(f,['a'],[],empty).status,1);assert.deepEqual(fs.readdirSync(empty),[]);
 const first=run(f);const summary=hash(path.join(first.out,'usage-summary.json'));assert.equal(run(f,['a'],[],first.out).status,1);assert.equal(hash(path.join(first.out,'usage-summary.json')),summary);
 assert.equal(run(f,['a'],[],path.join(f.home,'child')).status,1);assert.equal(run(f,['a'],[],f.home).status,1);
 const traversal=path.join(f.dir,'nonexistent')+path.sep+'..'+path.sep+'escaped';assert.equal(run(f,['a'],[],traversal).status,1);assert.ok(!fs.existsSync(path.join(f.dir,'escaped')));
 const junction=path.join(f.dir,'alias');fs.symlinkSync(f.home,junction,process.platform==='win32'?'junction':'dir');assert.equal(run(f,['a'],[],path.join(junction,'out')).status,1);assert.ok(!fs.existsSync(path.join(f.home,'out')));
});
