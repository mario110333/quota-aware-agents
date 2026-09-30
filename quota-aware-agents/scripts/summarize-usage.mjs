#!/usr/bin/env node
// Local read-only telemetry. Do not export conversation text, tool bodies or credentials.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const keys = ['input_tokens','cached_input_tokens','cache_write_input_tokens','output_tokens','reasoning_output_tokens','total_tokens'];
const help = 'node summarize-usage.mjs --thread ID --cutoff ISO --out DIRECTORY [--codex-home DIRECTORY] [--db FILE] [--ledger]\nCutoff needs an explicit timezone. Default DB: <CODEX_HOME or homedir/.codex>/state_5.sqlite; no fallback. Requires Node node:sqlite readOnly support. Ledger is off by default. Existing outputs are never overwritten.';
const valid = value => Number.isSafeInteger(value) && value >= 0;
function timestamp(value) {
 const m = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(value);
 if (!m || +m[2]<1 || +m[2]>12 || +m[3]<1 || +m[3]>new Date(Date.UTC(+m[1],+m[2],0)).getUTCDate() || +m[4]>23 || +m[5]>59 || +m[6]>59) return null;
 if (m[7]!=='Z' && (+m[7].slice(1,3)>23 || +m[7].slice(4,6)>59)) return null;
 const n=Date.parse(value); return Number.isFinite(n)?n:null;
}
const id = value => typeof value==='string' && value.trim() ? value : null;
const usage = raw => Object.fromEntries(keys.map(k=>[k,valid(raw?.[k])?raw[k]:null]));
const aggregate = () => ({calls:0,total:Object.fromEntries(keys.map(k=>[k,null])),coverage:Object.fromEntries(keys.map(k=>[k,{known:0,missing:0,invalid:0}]))});
function add(a,raw) {
 a.calls++;
 for(const k of keys) {
  if(valid(raw?.[k])) { a.coverage[k].known++; a.total[k]=(a.total[k]??0)+raw[k]; if(!Number.isSafeInteger(a.total[k])) throw new Error('Token totals exceed safe integer range'); }
  else a.coverage[k][raw?.[k]==null?'missing':'invalid']++;
 }
}
function canonical(file) {
 let p=path.resolve(file),tail=[];
 while(!fs.existsSync(p)) {const parent=path.dirname(p);if(parent===p)throw new Error('Cannot resolve path');tail.unshift(path.basename(p));p=parent;}
 return path.resolve(fs.realpathSync.native(p),...tail);
}
function inside(dir,file) {const r=path.relative(dir,file);return !r || (!path.isAbsolute(r)&&r!=='..'&&!r.startsWith(`..${path.sep}`));}
function args() {
 const o={ledger:false},seen=new Set(),allowed=new Set(['--thread','--cutoff','--out','--codex-home','--db']);
 if(process.argv.length===3&&process.argv[2]==='--help')return null;
 for(let i=2;i<process.argv.length;i++) {
  const k=process.argv[i];if(seen.has(k))throw new Error(`Duplicate argument: ${k}`);seen.add(k);
  if(k==='--ledger'){o.ledger=true;continue;}
  if(!allowed.has(k))throw new Error(`Unknown argument: ${k}`);
  const v=process.argv[++i];if(!v||v.startsWith('--'))throw new Error(`Missing value: ${k}`);o[k.slice(2)]=v;
 }
 for(const k of ['thread','cutoff','out'])if(!o[k])throw new Error(`Required argument: --${k}`);
 if(o.thread.trim()!==o.thread||/[\r\n\0]/.test(o.thread))throw new Error('Invalid thread ID');
 o.cutoffMs=timestamp(o.cutoff);if(o.cutoffMs===null)throw new Error('Invalid cutoff: use a full ISO timestamp with explicit timezone');
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
  const optional=['agent_path','created_at_ms','created_at'].filter(k=>tc.has(k));
  const rows=db.prepare(`WITH RECURSIVE tree(id) AS (SELECT ? UNION SELECT e.child_thread_id FROM thread_spawn_edges e JOIN tree x ON e.parent_thread_id=x.id) SELECT x.id AS tree_id,${['id','rollout_path',...optional].map(k=>'t.'+k).join(',')} FROM tree x LEFT JOIN threads t ON t.id=x.id`).all(o.thread);
  if(!rows.some(t=>t.id===o.thread))throw new Error('Root thread missing from selected database');
  const included=[],excluded=[],missing=[];
  for(const t of rows) {
   if(!t.id){missing.push(t.tree_id);continue;}
   t.created_ms=valid(t.created_at_ms)?t.created_at_ms:(valid(t.created_at)?t.created_at*1000:null);
   if(t.created_ms!==null&&t.created_ms>o.cutoffMs)excluded.push(t.id);else included.push(t);
  }
  const ids=new Set(included.map(t=>t.id));
  return {threads:included,excluded,missing,edges:db.prepare('SELECT parent_thread_id,child_thread_id FROM thread_spawn_edges').all().filter(e=>ids.has(e.parent_thread_id)&&ids.has(e.child_thread_id))};
 } finally {db.close();}
}
function outputCheck(o,t) {
 const out=canonical(o.out),home=canonical(o.home);
 const inputs=[o.db,...t.threads.map(x=>id(x.rollout_path)).filter(Boolean)].map(x=>canonical(x.replace(/^\\\\\?\\/,'')));
 if(inside(home,out)||inside(out,home)||inputs.some(x=>inside(out,x)))throw new Error('Output overlaps input/Codex home');
 for(const name of ['usage-summary.json',...(o.ledger?['usage-ledger.jsonl']:[])])if(fs.existsSync(path.join(o.out,name)))throw new Error(`Output already exists: ${name}`);
}
function collect(o,t) {
 const ledger=[],files=[],checks=[],seen=new Map(),grand=aggregate();let cacheWrites=0;
 for(const thread of t.threads) {
  const file=id(thread.rollout_path)?path.resolve(thread.rollout_path.replace(/^\\\\\?\\/,'')):null;
  const a=aggregate(),context=new Map(),issues=new Map();let cumulative=null,legacy=null;
  const f={thread_id:thread.id,agent:id(thread.agent_path),source_file:file,duplicates:0,foreign:0,after_cutoff:0};
  const warn=(type,sample={},severity='warning')=>{if(!issues.has(type))issues.set(type,{type,severity,thread_id:thread.id,count:0,samples:[]});const x=issues.get(type);x.count++;if(x.samples.length<3)x.samples.push(sample);};
  if(thread.created_ms===null)warn('unknown_thread_creation_time');
  if(!file||!fs.existsSync(file))warn('missing_file');
  else {
   let raw;
   try {
    const before=fs.statSync(file);raw=fs.readFileSync(file,'utf8');const after=fs.statSync(file);
    f.source_bytes=Buffer.byteLength(raw);f.source_sha256=crypto.createHash('sha256').update(raw).digest('hex');
    if(before.size!==after.size||before.mtimeMs!==after.mtimeMs)warn('source_changed_during_read',{before_bytes:before.size,after_bytes:after.size});
   } catch {warn('read_failed');}
   if(raw!==undefined) {
    const lines=raw.split(/\r?\n/);let lastBad=false;
    for(let n=0;n<lines.length;n++) {
     const line=lines[n];if(!line.trim())continue;let row;
     try{row=JSON.parse(line);}catch{warn('malformed_json',{line:n+1});if(n===lines.length-1)lastBad=true;continue;}
     const p=row.payload;if(!['turn_context','token_usage_record'].includes(row.type)&&!(row.type==='event_msg'&&p?.type==='token_count'))continue;
     const ms=timestamp(row.timestamp);if(ms===null){warn('invalid_timestamp',{line:n+1});continue;}if(ms>o.cutoffMs){f.after_cutoff++;continue;}
     if(row.type==='turn_context'){if(id(p?.turn_id))context.set(p.turn_id,p);continue;}
     if(row.type==='event_msg'){if(p?.info?.total_token_usage)legacy=usage(p.info.total_token_usage);continue;}
     if(p?.thread_id!==thread.id){f.foreign++;continue;}
     if(p.thread_token_usage)cumulative=usage(p.thread_token_usage);
     const response=id(p.response_id),turn=id(p.turn_id),u=usage(p.usage);
     if(response) {
      const fingerprint=JSON.stringify([thread.id,turn,u]);
      if(seen.has(response)){f.duplicates++;if(seen.get(response)!==fingerprint)warn('conflicting_duplicate',{line:n+1,response_id:response});continue;}
      seen.set(response,fingerprint);
     } else warn('missing_response_id_not_deduplicated',{line:n+1});
     const ctx=turn?context.get(turn):null,model=id(ctx?.model),effort=id(ctx?.effort)||id(ctx?.reasoning_effort),tier=id(ctx?.service_tier)||id(ctx?.serviceTier);
     if(!ctx)warn('missing_matching_context',{line:n+1,turn_id:turn});else if(!model||!effort)warn('unknown_model_or_effort',{line:n+1});
     if(!tier)warn('unknown_service_tier',{line:n+1},'info');
     const missing=keys.filter(k=>p.usage?.[k]==null),invalid=keys.filter(k=>p.usage?.[k]!=null&&!valid(p.usage[k]));
     if(missing.length)warn('missing_usage',{line:n+1,fields:missing});if(invalid.length)warn('invalid_usage',{line:n+1,fields:invalid});
     if((u.cached_input_tokens!==null&&u.input_tokens!==null&&u.cached_input_tokens>u.input_tokens)||(u.reasoning_output_tokens!==null&&u.output_tokens!==null&&u.reasoning_output_tokens>u.output_tokens)||([u.input_tokens,u.output_tokens,u.total_tokens].every(x=>x!==null)&&u.total_tokens!==u.input_tokens+u.output_tokens))warn('usage_invariant_failed',{line:n+1,response_id:response});
     if(u.cache_write_input_tokens>0)cacheWrites++;
     ledger.push({timestamp:new Date(ms).toISOString(),thread_id:thread.id,agent:f.agent,turn_id:turn,root_turn_id:id(p.root_turn_id),response_id:response,model,effort,service_tier:tier,...u});add(a,p.usage);add(grand,p.usage);
    }
    if(raw.length&&!raw.endsWith('\n'))warn(lastBad?'truncated_final_line':'unterminated_final_line',{},lastBad?'warning':'info');
   }
  }
  if(!a.calls)warn('no_request_telemetry');if(!cumulative)warn('missing_cumulative');
  const delta=cumulative?Object.fromEntries(keys.map(k=>[k,a.coverage[k].known&&!a.coverage[k].missing&&!a.coverage[k].invalid&&cumulative[k]!==null?a.total[k]-cumulative[k]:null])):null;
  if(cumulative&&keys.some(k=>cumulative[k]===null))warn('incomplete_cumulative');
  if(delta&&keys.some(k=>delta[k]!==null&&delta[k]!==0))warn('cumulative_mismatch',{sum_minus_cumulative:delta});
  files.push({...f,usage_records:a.calls,total:a.total,field_coverage:a.coverage,last_cumulative:cumulative,last_legacy_cumulative:legacy,sum_minus_cumulative:delta});checks.push(...issues.values());
 }
 if(t.missing.length)checks.push({type:'spawn_edges_missing_threads',severity:'warning',thread_ids:t.missing});
 const usable=keys.some(k=>grand.total[k]!==null);if(!usable)checks.push({type:'no_available_request_telemetry',severity:'warning'});
 const group=keyFn=>{const map=new Map();for(const r of ledger){const key=keyFn(r);if(!map.has(key))map.set(key,aggregate());add(map.get(key),r);}return [...map].map(([key,a])=>({key,calls:a.calls,total:a.total,field_coverage:a.coverage}));};
 ledger.sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
 return {ledger,summary:{format_version:1,status:'partial',telemetry_status:!usable?'unavailable':checks.some(x=>x.severity==='warning')?'partial':'complete',root_thread_id:o.thread,cutoff_utc:new Date(o.cutoffMs).toISOString(),collected_at_utc:new Date().toISOString(),source_database:o.db,thread_count:t.threads.length,excluded_threads_created_after_cutoff:t.excluded,edges:t.edges,
  method:'Own-thread token_usage_record usage, unique nonempty response_id; missing IDs retained with warning. Model/effort/tier from preceding matching turn_context, never database model settings. Current DB spawn tree filtered by available creation timestamps, not a historical topology reconstruction.',
  accounting_note:'Cached input is a subset of input; reasoning output a subset of output. These subsets and cache writes are not added to total_tokens. Null means unknown, not zero; sums include only available valid values. Local telemetry is partial evidence, not billing, quota or measured savings.',
  billing:{status:'unknown',positive_cache_write_records:cacheWrites,cache_write_billing:cacheWrites?'unknown_for_observed_cache_writes':'not_assessed'},calls:grand.calls,grand_total:grand.total,field_coverage:grand.coverage,by_model:group(r=>r.model),by_model_effort:group(r=>JSON.stringify([r.model,r.effort])),by_service_tier:group(r=>r.service_tier),by_agent:group(r=>r.agent||r.thread_id),first_timestamp:ledger[0]?.timestamp??null,last_timestamp:ledger.at(-1)?.timestamp??null,checks,files}};
}
try {
 const o=args();if(!o)console.log(help);
 else {
  const t=tree(o);outputCheck(o,t);const result=collect(o,t);outputCheck(o,t);fs.mkdirSync(o.out,{recursive:true});
  const outputs=[['usage-summary.json',JSON.stringify(result.summary,null,2)+'\n'],...(o.ledger?[['usage-ledger.jsonl',result.ledger.map(r=>JSON.stringify(r)).join('\n')+(result.ledger.length?'\n':'')]]:[])],created=[];
  try{for(const [name,content]of outputs){const file=path.join(o.out,name),fd=fs.openSync(file,'wx');created.push(file);try{fs.writeFileSync(fd,content);}finally{fs.closeSync(fd);}}}catch(e){for(const file of created)fs.unlinkSync(file);throw e;}
  console.log(JSON.stringify({output:path.join(o.out,'usage-summary.json'),status:result.summary.status,telemetry_status:result.summary.telemetry_status,threads:result.summary.thread_count,calls:result.summary.calls,total:result.summary.grand_total,checks:result.summary.checks.map(x=>x.type)}));
 }
} catch(e) {const safe=/^(Duplicate argument|Unknown argument|Missing value|Required argument|Invalid |Selected database|Unsupported schema|Root thread|Output |Cannot resolve|Token totals)/.test(e.message);console.error(safe?e.message:`Usage summary failed (${e.code||e.name}); source lines and database error text are withheld.`);process.exitCode=1;}
