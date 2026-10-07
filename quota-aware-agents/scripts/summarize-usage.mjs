#!/usr/bin/env node
// Read-only local telemetry adapter for internal schemas; never export bodies or credentials.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { tokenKeys as keys, valid, id, timestamp, canonical, inside, rolloutPath } from './telemetry-utils.mjs';

const help=`node summarize-usage.mjs --thread ID [--thread ID ...] --cutoff ISO --out DIRECTORY [--since ISO] [--codex-home DIRECTORY] [--db FILE] [--ledger]
Since is exclusive; cutoff inclusive. Both need a full ISO timestamp with explicit timezone.
Default DB: <CODEX_HOME or homedir/.codex>/state_5.sqlite; no fallback. Node node:sqlite readOnly support required.
Only explicit roots and their current DB spawn descendants are read. Shared descendants count once.
Ledger is off by default. Output directory must not exist, overlap sources/Codex home, or contain '..' traversal.
Internal SQLite/rollout schemas are not a stable public API. This is telemetry, not billing or quota.`;
const usage=raw=>Object.fromEntries(keys.map(k=>[k,valid(raw?.[k])?raw[k]:null]));
const aggregate=()=>({calls:0,total:Object.fromEntries(keys.map(k=>[k,null])),coverage:Object.fromEntries(keys.map(k=>[k,{known:0,missing:0,invalid:0}]))});
function add(a,raw) {
 a.calls++;
 for(const k of keys) {
  if(valid(raw?.[k])) {a.coverage[k].known++;a.total[k]=(a.total[k]??0)+raw[k];if(!Number.isSafeInteger(a.total[k]))throw new Error('Token totals exceed safe integer range');}
  else a.coverage[k][raw?.[k]==null?'missing':'invalid']++;
 }
}
function args() {
 if(process.argv.length===3&&process.argv[2]==='--help')return null;
 const o={ledger:false,requested_roots:[]},seen=new Set(),allowed=new Set(['--thread','--since','--cutoff','--out','--codex-home','--db']);
 for(let i=2;i<process.argv.length;i++) {
  const k=process.argv[i];if(seen.has(k)&&k!=='--thread')throw new Error(`Duplicate argument: ${k}`);seen.add(k);
  if(k==='--ledger'){o.ledger=true;continue;}if(!allowed.has(k))throw new Error(`Unknown argument: ${k}`);
  const v=process.argv[++i];if(!v||v.startsWith('--'))throw new Error(`Missing value: ${k}`);
  if(k==='--thread'){if(!id(v))throw new Error('Invalid thread ID');o.requested_roots.push(v);}else o[k.slice(2)]=v;
 }
 if(!o.requested_roots.length)throw new Error('Required argument: --thread');
 for(const k of ['cutoff','out'])if(!o[k])throw new Error(`Required argument: --${k}`);
 o.cutoffMs=timestamp(o.cutoff);if(o.cutoffMs===null)throw new Error('Invalid cutoff: use a full ISO timestamp with explicit timezone');
 o.sinceMs=o.since===undefined?null:timestamp(o.since);if(o.since!==undefined&&o.sinceMs===null)throw new Error('Invalid since: use a full ISO timestamp with explicit timezone');
 if(o.sinceMs!==null&&o.sinceMs>=o.cutoffMs)throw new Error('Invalid range: since must precede cutoff');
 if(o.out.split(/[\\/]/).includes('..'))throw new Error('Output path traversal is forbidden');
 o.roots=[...new Set(o.requested_roots)];o.thread=o.roots.length===1?o.roots[0]:null;
 o.home=path.resolve(o['codex-home']||process.env.CODEX_HOME||path.join(os.homedir(),'.codex'));
 o.db=path.resolve(o.db||path.join(o.home,'state_5.sqlite'));o.out=path.resolve(o.out);return o;
}
function tree(o) {
 if(!fs.existsSync(o.db))throw new Error('Selected database missing; specify --db explicitly. No fallback attempted');
 const db=new DatabaseSync(o.db,{readOnly:true});
 try {
  const cols=table=>new Set(db.prepare(`PRAGMA table_info(${table})`).all().map(c=>c.name));
  const tc=cols('threads'),ec=cols('thread_spawn_edges');
  if(!['id','rollout_path'].every(k=>tc.has(k))||!['parent_thread_id','child_thread_id'].every(k=>ec.has(k)))throw new Error('Unsupported schema: threads(id,rollout_path) and thread_spawn_edges(parent_thread_id,child_thread_id) required; no fallback');
  const optional=['agent_path','created_at_ms','created_at','source','thread_source'].filter(k=>tc.has(k));
  const roots=o.roots.map(()=>'(?)').join(',');
  for(const root of o.roots)if(!db.prepare('SELECT id FROM threads WHERE id=?').get(root))throw new Error('Root thread missing from selected database');
  const rows=db.prepare(`WITH RECURSIVE tree(id) AS (VALUES ${roots} UNION SELECT e.child_thread_id FROM thread_spawn_edges e JOIN tree x ON e.parent_thread_id=x.id) SELECT x.id AS tree_id,${['id','rollout_path',...optional].map(k=>'t.'+k).join(',')} FROM tree x LEFT JOIN threads t ON t.id=x.id`).all(...o.roots);
  const included=[],excluded=[],missing=[];
  for(const t of rows) {
   if(!t.id){missing.push(t.tree_id);continue;}
   t.created_ms=valid(t.created_at_ms)?t.created_at_ms:(valid(t.created_at)&&Number.isSafeInteger(t.created_at*1000)?t.created_at*1000:null);
   if(t.created_ms!==null&&t.created_ms>o.cutoffMs)excluded.push(t.id);else included.push(t);
  }
  const selected=new Set(included.map(t=>t.id));
  // Query only parents in the bounded selection, never an account-wide approval inventory.
  const edges=[];const children=db.prepare('SELECT parent_thread_id,child_thread_id FROM thread_spawn_edges WHERE parent_thread_id=?');
  for(const parent of selected)edges.push(...children.all(parent).filter(e=>selected.has(e.child_thread_id)));
  return {threads:included,excluded,missing,edges};
 }finally{db.close();}
}
function exists(file){try{fs.lstatSync(file);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
function outputCheck(o,t) {
 if(exists(o.out))throw new Error('Output directory already exists');
 const out=canonical(o.out),home=canonical(o.home);
 const inputs=[o.db,...t.threads.map(x=>id(x.rollout_path)).filter(Boolean)].map(x=>canonical(rolloutPath(x)));
 if(inside(home,out)||inside(out,home)||inputs.some(x=>inside(out,x)||inside(x,out)))throw new Error('Output overlaps input/Codex home');
 return out;
}
function sourceEvidence(source,threadSource) {
 const roles=[];let parent=null,invalid=false;
 if(threadSource!=null) {const r=({user:'main',subagent:'worker',guardian_review:'guardian'})[threadSource];if(r)roles.push(r);else invalid=true;}
 if(source!=null) {
  let s=source;
  if(typeof s==='string'&&s.startsWith('{')) {try{s=JSON.parse(s);}catch{invalid=true;}}
  if(['cli','vscode','exec','app_server'].includes(s))roles.push('main');
  else if(s&&typeof s==='object') {
   const sub=s.subagent;
   if(sub?.thread_spawn) {roles.push('worker');parent=id(sub.thread_spawn.parent_thread_id);if(!parent)invalid=true;}
   else if(sub?.other==='guardian'||sub?.other?.type==='guardian') {roles.push('guardian');parent=id(sub?.other?.parent_thread_id);}
   else invalid=true;
  } else if(typeof s==='string'&&!['cli','vscode','exec','app_server'].includes(s))invalid=true;
 }
 return {roles,parent,invalid};
}
function classify(thread,session,edges,warn) {
 const db=sourceEvidence(thread.source,thread.thread_source),sm=sourceEvidence(session?.source,session?.thread_source);
 const roles=[...db.roles,...sm.roles],parents=[db.parent,sm.parent].filter(Boolean);
 const incoming=edges.filter(e=>e.child_thread_id===thread.id).map(e=>e.parent_thread_id);
 if(new Set(roles).size>1||new Set(parents).size>1||(parents.length&&incoming.length&&parents.some(p=>!incoming.includes(p)))||(roles.includes('main')&&incoming.length)) {warn('conflicting_thread_source');return 'unknown';}
 if(db.invalid||sm.invalid) {warn('unsupported_thread_source');return 'unknown';}
 if(!roles.length) {warn('unknown_thread_source');return 'unknown';}return roles[0];
}
function collect(o,t) {
 const candidates=[],files=[],checks=[],seen=new Map(),grand=aggregate(),full=aggregate();let cacheWrites=0;
 const states=new Map();
 for(const thread of t.threads) {
  const file=id(thread.rollout_path)?rolloutPath(thread.rollout_path):null;
  const state={period:aggregate(),full:aggregate(),cumulative:null,cumulativeMs:null,legacy:null,legacyMs:null,issues:new Map()},context=new Map();states.set(thread.id,state);
  const f={thread_id:thread.id,agent:id(thread.agent_path),source_file:file,source:'unknown',duplicates:0,foreign:0,after_cutoff:0,before_or_at_since:0};state.file=f;
  const warn=(type,sample={},severity='warning')=>{if(!state.issues.has(type))state.issues.set(type,{type,severity,thread_id:thread.id,count:0,samples:[]});const x=state.issues.get(type);x.count++;if(x.samples.length<3)x.samples.push(sample);};state.warn=warn;
  if(thread.created_ms===null)warn('unknown_thread_creation_time');let session=null;
  if(!file||!fs.existsSync(file))warn('missing_file');
  else {
   let raw;
   try {const before=fs.statSync(file);raw=fs.readFileSync(file,'utf8');const after=fs.statSync(file);f.source_bytes=Buffer.byteLength(raw);f.source_sha256=crypto.createHash('sha256').update(raw).digest('hex');if(before.size!==after.size||before.mtimeMs!==after.mtimeMs)warn('source_changed_during_read',{before_bytes:before.size,after_bytes:after.size});}catch{warn('read_failed');}
   if(raw!==undefined) {
    const lines=raw.split(/\r?\n/);let lastBad=false;
    for(let n=0;n<lines.length;n++) {
     if(!lines[n].trim())continue;let row;try{row=JSON.parse(lines[n]);}catch{warn('malformed_json',{line:n+1});if(n===lines.length-1)lastBad=true;continue;}
     const p=row.payload;
     if(row.type==='session_meta') {if(p?.id===thread.id){if(session)warn('duplicate_session_metadata');session=p;}else warn('session_identity_mismatch');continue;}
     if(!['turn_context','token_usage_record'].includes(row.type)&&!(row.type==='event_msg'&&p?.type==='token_count'))continue;
     const ms=timestamp(row.timestamp);if(ms===null){warn('invalid_timestamp',{line:n+1});continue;}if(ms>o.cutoffMs){f.after_cutoff++;continue;}
     if(row.type==='turn_context') {if(id(p?.turn_id)) {
      const c={model:id(p.model),effort:id(p.effort)||id(p.reasoning_effort),tier:id(p.service_tier)||id(p.serviceTier),ms};
      const old=context.get(p.turn_id);
      const conflict=old?.conflict||(old&&['model','effort','tier'].some(k=>old[k]&&c[k]&&old[k]!==c[k]));
      if(conflict)warn('conflicting_turn_context',{line:n+1,turn_id:p.turn_id});
      context.set(p.turn_id,{...c,conflict:!!conflict});
     }continue;}
     if(row.type==='event_msg') {if(p?.info?.total_token_usage&&(state.legacyMs===null||ms>=state.legacyMs)){state.legacy=usage(p.info.total_token_usage);state.legacyMs=ms;}continue;}
     if(p?.thread_id!==thread.id){f.foreign++;continue;}if(p.thread_token_usage&&(state.cumulativeMs===null||ms>=state.cumulativeMs)){state.cumulative=usage(p.thread_token_usage);state.cumulativeMs=ms;}
     if(o.sinceMs!==null&&ms<=o.sinceMs)f.before_or_at_since++;
     const response=id(p.response_id),turn=id(p.turn_id),candidate=turn?context.get(turn):null,ctx=candidate&&candidate.ms<=ms?candidate:null,u=usage(p.usage);
     const model=ctx&&!ctx.conflict?ctx.model:null,effort=ctx&&!ctx.conflict?ctx.effort:null,tier=ctx&&!ctx.conflict?ctx.tier:null;
     candidates.push({ms,line:n+1,raw:p.usage,r:{timestamp:new Date(ms).toISOString(),thread_id:thread.id,agent:f.agent,turn_id:turn,root_turn_id:id(p.root_turn_id),response_id:response,model,effort,service_tier:tier,...u},ctx});
    }
    if(raw.length&&!raw.endsWith('\n'))warn(lastBad?'truncated_final_line':'unterminated_final_line',{},lastBad?'warning':'info');
   }
  }
  f.source=classify(thread,session,t.edges,warn);
 }
 // Global chronological dedup covers pre-since records, so replay cannot become a new interval request.
 candidates.sort((a,b)=>a.ms-b.ms||a.r.thread_id.localeCompare(b.r.thread_id)||a.line-b.line);
 const ledger=[];
 for(const c of candidates) {
  const {r,raw,ctx}=c,s=states.get(r.thread_id),warn=s.warn;r.source=s.file.source;
  if(r.response_id) {
   const fingerprint=JSON.stringify([r.thread_id,r.turn_id,keys.map(k=>raw?.[k]??null),r.model,r.effort,r.service_tier]);
   if(seen.has(r.response_id)) {s.file.duplicates++;if(seen.get(r.response_id)!==fingerprint)warn('conflicting_duplicate',{line:c.line,response_id:r.response_id});continue;}seen.set(r.response_id,fingerprint);
  }else warn('missing_response_id_not_deduplicated',{line:c.line});
  add(s.full,raw);add(full,raw);if(o.sinceMs!==null&&c.ms<=o.sinceMs)continue;
  if(!ctx)warn('missing_matching_context',{line:c.line,turn_id:r.turn_id});else if(!r.model||!r.effort)warn('unknown_model_or_effort',{line:c.line});
  if(!r.service_tier)warn('unknown_service_tier',{line:c.line},'info');
  const missing=keys.filter(k=>raw?.[k]==null),invalid=keys.filter(k=>raw?.[k]!=null&&!valid(raw[k]));
  if(missing.length)warn('missing_usage',{line:c.line,fields:missing});if(invalid.length)warn('invalid_usage',{line:c.line,fields:invalid});
  if((r.cached_input_tokens!==null&&r.input_tokens!==null&&r.cached_input_tokens>r.input_tokens)||(r.reasoning_output_tokens!==null&&r.output_tokens!==null&&r.reasoning_output_tokens>r.output_tokens)||([r.input_tokens,r.output_tokens,r.total_tokens].every(x=>x!==null)&&r.total_tokens!==r.input_tokens+r.output_tokens))warn('usage_invariant_failed',{line:c.line,response_id:r.response_id});
  if(r.cache_write_input_tokens>0)cacheWrites++;ledger.push(r);add(s.period,raw);add(grand,raw);
 }
 for(const thread of t.threads) {
  const s=states.get(thread.id),a=s.period;
  if(!a.calls)s.warn('no_request_telemetry');if(!s.cumulative)s.warn('missing_cumulative');
  const diagnostic=s.full,delta=s.cumulative?Object.fromEntries(keys.map(k=>[k,diagnostic.coverage[k].known&&!diagnostic.coverage[k].missing&&!diagnostic.coverage[k].invalid&&s.cumulative[k]!==null?diagnostic.total[k]-s.cumulative[k]:null])):null;
  if(s.cumulative&&keys.some(k=>s.cumulative[k]===null))s.warn('incomplete_cumulative');
  if(delta&&keys.some(k=>delta[k]!==null&&delta[k]!==0))s.warn('cumulative_mismatch',{scope:'selected_own_requests_through_cutoff',sum_minus_cumulative:delta});
  files.push({...s.file,usage_records:a.calls,total:a.total,field_coverage:a.coverage,last_cumulative:s.cumulative,last_legacy_cumulative:s.legacy,sum_minus_cumulative:o.sinceMs===null?delta:null,cumulative_comparison_scope:o.sinceMs===null?'selected_own_requests_through_cutoff':'full_diagnostic_only_not_interval',full_diagnostic:{scope:'selected_own_requests_through_cutoff',calls:diagnostic.calls,total:diagnostic.total,field_coverage:diagnostic.coverage,sum_minus_cumulative:delta}});checks.push(...s.issues.values());
 }
 if(t.missing.length)checks.push({type:'spawn_edges_missing_threads',severity:'warning',thread_ids:t.missing});
 const usable=keys.some(k=>grand.total[k]!==null);if(!usable)checks.push({type:'no_available_request_telemetry',severity:'warning'});
 const group=fn=>{const m=new Map();for(const r of ledger){const k=fn(r);if(!m.has(k))m.set(k,aggregate());add(m.get(k),r);}return [...m].map(([key,a])=>({key,calls:a.calls,total:a.total,field_coverage:a.coverage}));};
 return {ledger,summary:{format_version:2,status:'partial',telemetry_status:!usable?'unavailable':checks.some(x=>x.severity==='warning')?'partial':'complete',root_thread_id:o.thread,root_thread_ids:o.roots,requested_roots:o.requested_roots,since_utc:o.sinceMs===null?null:new Date(o.sinceMs).toISOString(),cutoff_utc:new Date(o.cutoffMs).toISOString(),range:{since_exclusive:true,cutoff_inclusive:true,scope:o.sinceMs===null?'through_cutoff':'interval'},collected_at_utc:new Date().toISOString(),source_database:o.db,thread_count:t.threads.length,excluded_threads_created_after_cutoff:t.excluded,edges:t.edges,
  method:'Own-thread token_usage_record usage; globally unique nonempty response_id through cutoff, then usage-time interval filtering. Missing IDs retained with warning. Matching preceding turn_context may predate since. Current DB spawn topology, not historical reconstruction.',
  accounting_note:'Null means unknown, not zero. Sums include valid available values. Cached input and reasoning output are subsets; never add them or cache writes to total_tokens. Interval totals are not compared with lifecycle cumulative counters or filled from differences. Local telemetry is not billing, quota or measured savings.',
  source_classification:{scope:'Explicit roots and DB spawn descendants only; no account-wide guardian discovery. Root selection does not imply main.',unknown_threads:files.filter(f=>f.source==='unknown').map(f=>f.thread_id)},
  billing:{status:'unknown',positive_cache_write_records:cacheWrites,cache_write_billing:cacheWrites?'unknown_for_observed_cache_writes':'not_assessed'},calls:grand.calls,grand_total:grand.total,field_coverage:grand.coverage,by_model:group(r=>r.model),by_model_effort:group(r=>JSON.stringify([r.model,r.effort])),by_service_tier:group(r=>r.service_tier),by_agent:group(r=>r.agent||r.thread_id),by_source:group(r=>r.source),full_diagnostic:{scope:'selected_own_requests_through_cutoff',calls:full.calls,total:full.total,field_coverage:full.coverage},first_timestamp:ledger[0]?.timestamp??null,last_timestamp:ledger.at(-1)?.timestamp??null,checks,files}};
}
try {
 const o=args();if(!o)console.log(help);else {
  const t=tree(o),target=outputCheck(o,t),result=collect(o,t);if(outputCheck(o,t)!==target)throw new Error('Output path changed during collection');
  fs.mkdirSync(path.dirname(o.out),{recursive:true});if(canonical(o.out)!==target)throw new Error('Output path changed during creation');fs.mkdirSync(o.out);
  const outputs=[['usage-summary.json',JSON.stringify(result.summary,null,2)+'\n'],...(o.ledger?[['usage-ledger.jsonl',result.ledger.map(r=>JSON.stringify(r)).join('\n')+(result.ledger.length?'\n':'')]]:[])],created=[];
  try {for(const [name,content]of outputs){if(fs.lstatSync(o.out).isSymbolicLink()||canonical(o.out)!==target)throw new Error('Output path changed during write');const file=path.join(o.out,name),fd=fs.openSync(file,'wx');created.push(file);try{fs.writeFileSync(fd,content);}finally{fs.closeSync(fd);}}}catch(e){if(!fs.lstatSync(o.out).isSymbolicLink()&&canonical(o.out)===target)for(const file of created)fs.unlinkSync(file);throw e;}
  console.log(JSON.stringify({output:path.join(o.out,'usage-summary.json'),status:result.summary.status,telemetry_status:result.summary.telemetry_status,threads:result.summary.thread_count,calls:result.summary.calls,total:result.summary.grand_total,checks:result.summary.checks.map(x=>x.type)}));
 }
}catch(e){const safe=/^(Duplicate argument|Unknown argument|Missing value|Required argument|Invalid |Selected database|Unsupported schema|Root thread|Output |Cannot resolve|Token totals)/.test(e.message);console.error(safe?e.message:`Usage summary failed (${e.code||e.name}); source lines and database error text are withheld.`);process.exitCode=1;}
