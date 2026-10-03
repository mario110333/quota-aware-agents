import fs from 'node:fs';
import path from 'node:path';

export const tokenKeys = ['input_tokens','cached_input_tokens','cache_write_input_tokens','output_tokens','reasoning_output_tokens','total_tokens'];
export const valid = value => Number.isSafeInteger(value) && value >= 0;
export const id = value => typeof value === 'string' && value.trim() === value && value && !/[\r\n\0]/.test(value) ? value : null;
export function timestamp(value) {
 const m = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/.exec(value);
 if (!m || +m[2]<1 || +m[2]>12 || +m[3]<1 || +m[3]>new Date(Date.UTC(+m[1],+m[2],0)).getUTCDate() || +m[4]>23 || +m[5]>59 || +m[6]>59) return null;
 if (m[7]!=='Z' && (+m[7].slice(1,3)>23 || +m[7].slice(4,6)>59)) return null;
 const n=Date.parse(value); return Number.isFinite(n)?n:null;
}
export function canonical(file) {
 let p=path.resolve(file),tail=[];
 while(!fs.existsSync(p)) {const parent=path.dirname(p);if(parent===p)throw new Error('Cannot resolve path');tail.unshift(path.basename(p));p=parent;}
 return path.resolve(fs.realpathSync.native(p),...tail);
}
export function inside(dir,file) {const r=path.relative(dir,file);return !r || (!path.isAbsolute(r)&&r!=='..'&&!r.startsWith(`..${path.sep}`));}
export const rolloutPath = file => path.resolve(file.replace(/^\\\\\?\\/,''));
