const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const ctx={Date};vm.createContext(ctx);vm.runInContext(fs.readFileSync('roadmap-2026.logic.js','utf8').replaceAll('export ','')+';this.api={summarize,parseDay,mapTable};',ctx);const {summarize,parseDay,mapTable}=ctx.api,today=Date.UTC(2026,8,24);
const rows=[
{SubID:'A',ActualDispatch:'2026-01-02',ActualApproval:'2026-02-01',BusinessUnit:'ID',Site:'North'},
{SubID:'B',LatestDispatch:'2026-12-01',ActualSubmission:'2026-08-01',BusinessUnit:'ID',Site:'North'},
{SubID:'C',OriginalDispatch:'2026-03-01',ActualApproval:'2026-04-01',BusinessUnit:'CMI',Site:'South'},
{SubID:'D',ActualSubmission:'2026-01-01',ActualApproval:'2026-02-01',BusinessUnit:'ID'},
{SubID:'E',ActualSubmission:'2025-01-01',BusinessUnit:'TOX'},
{SubID:'F',LatestDispatch:'2026-10-01',BusinessUnit:'CMI',Site:'South'},
{SubID:'G',LatestDispatch:'2026-11-01',ActualApproval:'2027-01-01',Site:'West'},
{SubID:'H',ActualDispatch:'2026-05-01',BusinessUnit:'ID',Site:'North'},
{SubID:'H',ActualDispatch:'2026-05-01',BusinessUnit:'CSP',Site:'South'},
{SubID:'I',LatestDispatch:'bad',ActualSubmission:'2026-06-01',BusinessUnit:'CMI'},
{SubID:'J',ActualDispatch:'2026-04-01',BusinessUnit:'TOX'},
{SubID:'J',ActualDispatch:'2026-05-01',BusinessUnit:'TOX'}];
function run(inferred=false,unit='*'){return summarize(rows,today,inferred,unit);}
let a=run(),b=run(true);assert.equal(a.total,6);assert.equal(b.total,6);assert.deepEqual(Array.from(a.totals),[2,3,1,0]);assert.deepEqual(Array.from(b.totals),[2,1,0,3]);assert.equal(b.months[11][3],1);assert.equal(b.months[7][3],0);assert.equal(b.months[10][3],1);assert.equal(b.months[0][0],1);assert.equal(b.missing.length,2);assert.deepEqual(Array.from(a.missing),Array.from(b.missing));assert.equal(b.undatedInferred.length,3);assert.equal(b.excluded.length,2);assert.equal(b.sites.reduce((n,s)=>n+s.total,0),b.total);assert.equal(b.ambiguousSites.length,1);assert.equal(b.sites.find(s=>s.key==='ambiguous').total,1);
let id=run(true,'ID');assert.equal(id.total,3);assert.equal(id.totals[3],1);assert.equal(id.missing.length,1);assert.equal(id.excluded.length,0);assert.equal(id.ambiguousSites.length,1);assert.equal(id.sites.reduce((n,s)=>n+s.total,0),3);assert.equal(run(true,null).total,1);assert.equal(run(true,'CSP').total,1);assert.equal(run(true,'unknown').total,0);assert.equal(run(true,'CMI').missing.length,1);
const future=summarize([{SubID:'X',LatestDispatch:'2027-01-01'}],Date.UTC(2027,0,1));assert.equal(future.year,2027);assert.equal(future.total,1);assert.equal(future.average,1/12);
assert.equal(parseDay('2026-02-30').kind,'invalid');assert.equal(parseDay('01/02/2026').kind,'invalid');assert.equal(parseDay('2026-01-01T23:00:00-08:00').day,Date.UTC(2026,0,1));assert.equal(parseDay(0).kind,'invalid');assert.equal(mapTable({}).missing,true);
const conflicting=[{SubID:'X',LatestDispatch:'2026-01-01',ActualSubmission:'2026-02-01'},{SubID:'X',LatestDispatch:'2026-03-01',ActualSubmission:'2026-02-01'}];assert.equal(summarize(conflicting,today,true).total,0);assert.equal(summarize(conflicting,today,true).excluded.length,1);
const big=Array.from({length:30000},(_,i)=>({SubID:'S'+i%1000,LatestDispatch:'2026-12-01',BusinessUnit:i%2?'ID':'CMI'}));assert.equal(summarize(big,today).total,1000);
console.log('PASS: inference partition/precedence/evidence/future plans, undated scope, current-year cleanup OR, business-unit membership filtering, duplicates and 30k rows, site reconciliation and ambiguity, calendar parsing, conflicts and dynamic year.');
