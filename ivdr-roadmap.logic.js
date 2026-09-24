export const roles=['SubID','OriginalDispatch','LatestDispatch','ActualDispatch','ActualSubmission','ActualApproval','Site','BusinessUnit'];
export const categories=['Dispatched','In Progress / Expected','Unconfirmed','Inferred'];
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
export function summarize(rows,today=viewingDay(),includeInferred=false,businessUnit='*'){
 const unitKey=r=>String(r.BusinessUnit??'').trim()||null;
 const units=[...new Set(rows.map(unitKey))].sort((a,b)=>String(a).localeCompare(String(b)));
 // Select records by membership, then retain all delivered associations for those IDs.
 // This avoids hiding conflicting dates or multi-site membership in joined rows.
 const selected=new Set(rows.filter(r=>businessUnit==='*'||unitKey(r)===businessUnit).map(r=>String(r.SubID??'').trim()).filter(Boolean));
 rows=rows.filter(r=>String(r.SubID??'').trim()?selected.has(String(r.SubID).trim()):businessUnit==='*'||unitKey(r)===businessUnit);
 const groups=new Map();let missingIdRows=0;
 for(const row of rows){const id=String(row.SubID??'').trim();if(!id){missingIdRows++;continue;}if(!groups.has(id))groups.set(id,[]);groups.get(id).push(row);}
 const year=new Date(today).getUTCFullYear(),zero=()=>[0,0,0,0],months=Array.from({length:12},zero),totals=zero(),issues=[],excluded=[],missing=[],records=[],ambiguousSites=[],undatedInferred=[],sites=new Map();let outsideYear=0;
 for(const [id,list]of groups){const dates=Object.fromEntries(roles.slice(1).filter(k=>k!=='Site'&&k!=='BusinessUnit').map(k=>[k,resolve(list.map(r=>r[k]))]));
  const bad=Object.entries(dates).filter(([,p])=>p.kind==='issue').map(([k])=>k);if(bad.length)issues.push({id,fields:bad});
  const evidence=['ActualSubmission','ActualApproval'].filter(k=>dates[k].kind==='date').map(k=>({field:k,day:dates[k].day}));
  const actualAbsent=dates.ActualDispatch.kind==='blank';
  // Cleanup scope is independent of the inference toggle. Invalid/conflicting plans
  // are unusable but remain explicitly flagged. A valid plan in either field means
  // this is NOT a no-usable-dispatch-date record, even if a higher-priority field fails.
  const noPlan=dates.LatestDispatch.kind!=='date'&&dates.OriginalDispatch.kind!=='date';
  if(actualAbsent&&noPlan&&evidence.some(e=>new Date(e.day).getUTCFullYear()===year))missing.push(id);
  if(includeInferred&&actualAbsent&&noPlan&&evidence.length)undatedInferred.push(id);
  let chosen=dates.ActualDispatch,cat=0;
  if(chosen.kind==='issue'){excluded.push(id);continue;}
  if(chosen.kind==='blank'){chosen=dates.LatestDispatch;cat=1;if(chosen.kind==='issue'){excluded.push(id);continue;}if(chosen.kind==='blank')chosen=dates.OriginalDispatch;if(chosen.kind==='issue'){excluded.push(id);continue;}if(chosen.kind==='blank')continue;if(chosen.day<today)cat=2;if(includeInferred&&evidence.length)cat=3;}
  const date=new Date(chosen.day);if(date.getUTCFullYear()!==year){outsideYear++;continue;}const month=date.getUTCMonth();months[month][cat]++;totals[cat]++;
  const names=[...new Set(list.map(r=>String(r.Site??'').trim()).filter(Boolean))].sort();
  const siteKey=names.length>1?'ambiguous':names.length===1?'site:'+names[0]:'unassigned',site=names.length>1?'Multiple sites (unallocated)':names[0]||'Unassigned';
  if(names.length>1)ambiguousSites.push({id,sites:names});
  if(!sites.has(siteKey))sites.set(siteKey,{key:siteKey,label:site,months:Array.from({length:12},zero),totals:zero(),total:0});
  const bucket=sites.get(siteKey);bucket.months[month][cat]++;bucket.totals[cat]++;bucket.total++;
  records.push({id,month,category:cat,siteKey,site,sites:names,plannedDay:cat===0?null:chosen.day,actualDay:cat===0?chosen.day:null,evidence,missingActual:actualAbsent});
 }
 const total=totals.reduce((a,b)=>a+b,0);
 return {units,businessUnit,year,months,totals,total,average:total/12,percentages:totals.map(n=>total?n/total*100:0),missing,issues,excluded,outsideYear,missingIdRows,distinct:groups.size,today,records,sites:[...sites.values()].sort((a,b)=>a.label.localeCompare(b.label)),ambiguousSites,undatedInferred,includeInferred};
}
