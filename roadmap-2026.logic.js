export const roles=['SubID','OriginalDispatch','LatestDispatch','ActualDispatch'];
export const categories=['Dispatched','In Progress / Expected','Unconfirmed'];
export function viewingDay(now=new Date()){return Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());}
// Date fields are calendar dates. ISO timestamps use their written YYYY-MM-DD,
// never the viewer's timezone. Power BI Date objects use their UTC calendar parts.
export function parseDay(value){
 if(value===null||value===undefined||value==='')return {kind:'blank'};
 let y,m,d;
 if(value instanceof Date){if(!Number.isFinite(+value))return {kind:'invalid'};y=value.getUTCFullYear();m=value.getUTCMonth()+1;d=value.getUTCDate();}
 else if(typeof value==='string'){
  const match=value.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/);
  if(!match)return {kind:'invalid'};[,y,m,d]=match.map(Number);
  if(value.includes('T')&&!Number.isFinite(Date.parse(value)))return {kind:'invalid'};
 }else return {kind:'invalid'};
 const n=Date.UTC(y,m-1,d),date=new Date(n);
 return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d?{kind:'date',day:n}:{kind:'invalid'};
}
function resolve(values){const valid=new Set();let invalid=false;for(const value of values){const p=parseDay(value);if(p.kind==='invalid')invalid=true;if(p.kind==='date')valid.add(p.day);}
 return invalid||valid.size>1?{kind:'issue'}:valid.size?{kind:'date',day:[...valid][0]}:{kind:'blank'};}
export function mapTable(table){const columns=table?.columns||[],indices={};for(const role of roles){const a=columns.map((c,i)=>c.roles?.[role]?i:-1).filter(i=>i>=0);if(a.length>1)throw Error('Map only one column to '+role);if(a.length)indices[role]=a[0];}
 return {missing:indices.SubID===undefined,rows:(table?.rows||[]).map(r=>Object.fromEntries(roles.map(k=>[k,indices[k]===undefined?null:r[indices[k]]])))};
}
export function summarize(rows,today=viewingDay()){
 const groups=new Map();let missingIdRows=0;
 for(const row of rows){const id=String(row.SubID??'').trim();if(!id){missingIdRows++;continue;}if(!groups.has(id))groups.set(id,[]);groups.get(id).push(row);}
 const months=Array.from({length:12},()=>[0,0,0]),totals=[0,0,0],issues=[],excluded=[],missing=[];let outsideYear=0;
 for(const [id,list]of groups){const dates=Object.fromEntries(roles.slice(1).map(k=>[k,resolve(list.map(r=>r[k]))]));
  const bad=Object.entries(dates).filter(([,p])=>p.kind==='issue').map(([k])=>k);if(bad.length)issues.push({id,fields:bad});
  let chosen=dates.ActualDispatch,cat=0;
  if(chosen.kind==='issue'){excluded.push(id);continue;}
  if(chosen.kind==='blank'){chosen=dates.LatestDispatch;cat=1;if(chosen.kind==='issue'){excluded.push(id);continue;}if(chosen.kind==='blank')chosen=dates.OriginalDispatch;if(chosen.kind==='issue'){excluded.push(id);continue;}if(chosen.kind==='blank'){missing.push(id);continue;}if(chosen.day<today)cat=2;}
  const date=new Date(chosen.day);if(date.getUTCFullYear()!==2026){outsideYear++;continue;}months[date.getUTCMonth()][cat]++;totals[cat]++;
 }
 const total=totals.reduce((a,b)=>a+b,0);
 return {months,totals,total,average:total/12,percentages:totals.map(n=>total?n/total*100:0),missing,issues,excluded,outsideYear,missingIdRows,distinct:groups.size,today};
}
