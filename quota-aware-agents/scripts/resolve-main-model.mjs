#!/usr/bin/env node
// Read-only adapter for internal Codex SQLite/rollout schemas, not a stable public API.
// Only bound current-turn metadata is returned. Conversation and tool bodies stay local.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { DatabaseSync } from 'node:sqlite';
import { id, rolloutPath } from './telemetry-utils.mjs';

const help = `node resolve-main-model.mjs [--thread ID] [--turn ID] [--host-metadata FILE] [--codex-home DIRECTORY] [--db FILE]
CODEX_THREAD_ID/CODEX_SESSION_ID bind the current session; --thread/--turn assert bindings.
Host JSON requires thread_id, turn_id, active_turn_id, model, with active_turn_id = turn_id; effort is optional.
Only a matching session_meta and active task_started turn_context may identify the local model.
No default model, newest-file or historical-model fallback. Unknown metadata is normal (exit 0).
Internal SQLite/rollout schemas are not a stable public API. No configuration changes or network calls.`;
function args() {
 if(process.argv.length===3&&process.argv[2]==='--help')return null;
 const o={},seen=new Set(),allowed=new Set(['--thread','--turn','--host-metadata','--codex-home','--db']);
 for(let i=2;i<process.argv.length;i++) {
  const k=process.argv[i];if(!allowed.has(k))throw new Error(`Unknown argument: ${k}`);if(seen.has(k))throw new Error(`Duplicate argument: ${k}`);seen.add(k);
  const v=process.argv[++i];if(!v||v.startsWith('--'))throw new Error(`Missing value: ${k}`);o[k.slice(2)]=v;
 }
 for(const k of ['thread','turn'])if(o[k]&&!id(o[k]))throw new Error(`Invalid ${k} ID`);
 o.home=path.resolve(o['codex-home']||process.env.CODEX_HOME||path.join(os.homedir(),'.codex'));o.db=path.resolve(o.db||path.join(o.home,'state_5.sqlite'));return o;
}
function local(o,thread) {
 if(!fs.existsSync(o.db))return {reason:'local_database_missing'};
 let db;
 try {
  db=new DatabaseSync(o.db,{readOnly:true});const cols=new Set(db.prepare('PRAGMA table_info(threads)').all().map(x=>x.name));
  if(!['id','rollout_path'].every(x=>cols.has(x)))return {reason:'unsupported_local_schema'};
  const row=db.prepare('SELECT id,rollout_path FROM threads WHERE id=?').get(thread);
  if(!row)return {reason:'bound_thread_missing'};
  if(!id(row.rollout_path)||!fs.existsSync(rolloutPath(row.rollout_path)))return {reason:'local_rollout_missing'};
  const file=rolloutPath(row.rollout_path),before=fs.statSync(file),raw=fs.readFileSync(file,'utf8'),after=fs.statSync(file);
  if(before.size!==after.size||before.mtimeMs!==after.mtimeMs)return {reason:'local_source_changed'};
  let meta=null,active=null;const contexts=new Map();
  for(const line of raw.split(/\r?\n/)) {
   if(!line.trim())continue;let r;try{r=JSON.parse(line);}catch{return {reason:'malformed_local_rollout'};}
   const p=r.payload;
   if(r.type==='session_meta') {if(meta&&meta!==p?.id)return {reason:'session_identity_conflict',conflict:true};meta=p?.id;}
   if(r.type==='event_msg'&&p?.type==='task_started') {if(!id(p.turn_id))return {reason:'active_turn_unbound'};active=p.turn_id;}
   if(r.type==='event_msg'&&['task_complete','task_completed','task_failed','task_aborted','turn_aborted'].includes(p?.type)) {
    if(!p.turn_id||p.turn_id===active)active=null;
   }
   if(r.type==='turn_context'&&id(p?.turn_id)) {
    const c={model:id(p.model),effort:id(p.effort)||id(p.reasoning_effort)};
    const old=contexts.get(p.turn_id);
    const conflict=old?.conflict||(old&&['model','effort'].some(k=>old[k]&&c[k]&&old[k]!==c[k]));
    contexts.set(p.turn_id,{model:c.model||old?.model||null,effort:c.effort||old?.effort||null,conflict:!!conflict});
   }
  }
  if(meta!==thread)return {reason:'session_identity_mismatch',conflict:true};
  if(!active)return {reason:'no_active_turn',thread_id:thread,active_turn_id:null};
  const c=contexts.get(active);
  if(c?.conflict)return {reason:'turn_metadata_conflict',conflict:true};
  return {thread_id:thread,turn_id:active,active_turn_id:active,model:c?.model,effort:c?.effort,reason:c?.model?null:'active_turn_metadata_missing'};
 } catch {return {reason:'local_source_unreadable'};} finally {db?.close();}
}
function resolve(o) {
 const empty={status:'unknown',model:null,effort:null,source:'none',thread_id:null,turn_id:null,strategy:'unknown',reason:null};
 const unknown=(reason,extra={})=>({...empty,...extra,status:'unknown',strategy:'unknown',reason});
 const env=[process.env.CODEX_THREAD_ID,process.env.CODEX_SESSION_ID].filter(x=>x!==undefined);
 if(env.some(x=>!id(x)))return unknown('invalid_environment_binding');
 if(new Set(env).size>1)return unknown('environment_binding_conflict');
 if(o.thread&&env[0]&&o.thread!==env[0])return unknown('thread_assertion_conflict');
 let host;
 if(o['host-metadata']) {
  try{host=JSON.parse(fs.readFileSync(o['host-metadata'],'utf8'));}catch{return unknown('host_metadata_unreadable');}
  if(!['thread_id','turn_id','active_turn_id','model'].every(k=>id(host?.[k]))||host.active_turn_id!==host.turn_id||(host.effort!=null&&!id(host.effort)))return unknown('host_metadata_not_current_and_bound');
  host.effort=id(host.effort);
  if((env[0]&&host.thread_id!==env[0])||(o.thread&&host.thread_id!==o.thread)||(o.turn&&host.turn_id!==o.turn))return unknown('host_binding_conflict');
 }
 const thread=env[0]||o.thread||host?.thread_id;
 if(!thread)return unknown('current_session_unbound');
 const l=local(o,thread);
 if(l.conflict)return unknown(l.reason,{thread_id:thread});
 if(o.turn&&l.turn_id&&o.turn!==l.turn_id)return unknown('turn_assertion_conflict',{thread_id:thread});
 if(host) {
  if(('active_turn_id' in l&&l.active_turn_id!==host.turn_id)||(l.turn_id&&l.turn_id!==host.turn_id)||(l.model&&l.model!==host.model)||(l.effort&&host.effort&&l.effort!==host.effort))return unknown('host_local_metadata_conflict',{thread_id:thread});
 } else if(l.reason)return unknown(l.reason,{thread_id:thread,turn_id:l.turn_id||null});
 const current=host||l,source=host?'host_metadata':'local_rollout';
 const strategy=({'gpt-6-astra':'astra_main','gpt-6.1-sol':'sol_main','gpt-6-sol':'other_known','gpt-6-luna':'other_known'})[current.model]||'unknown';
 return {...empty,status:strategy==='unknown'?'unknown':'known',model:current.model,effort:current.effort||null,source,thread_id:thread,turn_id:current.turn_id,strategy,reason:strategy==='unknown'?'unmapped_model':null};
}
try {const o=args();console.log(o?JSON.stringify(resolve(o)):help);}catch(e){console.error(/^(Unknown argument|Duplicate argument|Missing value|Invalid )/.test(e.message)?e.message:'Model resolution failed; source data withheld.');process.exitCode=1;}
