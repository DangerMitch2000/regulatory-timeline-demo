import {summarize,viewingDay,categories} from './roadmap-2026.logic.js';
const colours=['#2875d9','#ed922d','#269968'],months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const el=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
const svg=(tag,attrs)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
export function render(root,rows,{now=new Date(),notice='',synthetic=false}={}){
 const r=summarize(rows,viewingDay(now));root.replaceChildren();root.className='roadmap2026';
 const header=el('header'),h=el('h1','2026 Roadmap'),asof=el('p','As of '+now.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}));header.append(h,asof);root.append(header);
 if(synthetic)root.append(el('p','Synthetic example data'));
 if(notice){const n=el('p',notice);n.className='notice';n.setAttribute('role','status');root.append(n);}
 const legend=el('div');legend.className='legend';categories.forEach((c,i)=>{const label=el('span'),dot=el('i');dot.style.background=colours[i];label.append(dot,document.createTextNode(c));legend.append(label);});root.append(legend);
 const chart=el('div');chart.className='chart';root.append(chart);
 const width=Math.max(540,root.clientWidth-32),height=Math.max(225,Math.min(390,(root.clientHeight||600)-235)),left=46,right=14,top=30,bottom=32,plotW=width-left-right,plotH=height-top-bottom;
 const max=Math.max(1,...r.months.map(m=>m.reduce((a,b)=>a+b,0))),step=Math.max(1,Math.ceil(max/5)),ceiling=step*5,y=n=>top+plotH*(1-n/ceiling),band=plotW/12;
 const canvas=svg('svg',{viewBox:`0 0 ${width} ${height}`,width,height,role:'img','aria-label':`2026 monthly dispatch counts. ${r.total} submissions. Average ${r.average.toFixed(1)} per month.`});chart.append(canvas);
 if(now.getFullYear()===2026)canvas.append(svg('rect',{x:left+now.getMonth()*band,y:top,width:band,height:plotH,fill:'#edf4fc'}));
 for(let n=0;n<=ceiling;n+=step){canvas.append(svg('line',{x1:left,x2:width-right,y1:y(n),y2:y(n),stroke:'#dde4ec'}));const t=svg('text',{x:left-8,y:y(n)+4,'text-anchor':'end'});t.textContent=n;canvas.append(t);}
 const label=svg('text',{x:left,y:16});label.textContent='Submissions';canvas.append(label);
 const tip=el('div');tip.className='tip';tip.hidden=true;tip.setAttribute('role','tooltip');chart.append(tip);
 r.months.forEach((values,m)=>{let base=0;values.forEach((count,c)=>{if(!count)return;const bar=svg('rect',{x:left+m*band+band*.2,y:y(base+count),width:band*.6,height:plotH*count/ceiling,fill:colours[c],tabindex:0,role:'graphics-symbol','aria-label':`${months[m]}: ${categories[c]}, ${count}`});const text=`${months[m]} 2026 · ${categories[c]}: ${count}`+(c===2?'\nPlanned dispatch date has passed; actual dispatch date not recorded.':'');const title=svg('title',{});title.textContent=text;bar.append(title);const show=()=>{tip.textContent=text;tip.hidden=false;tip.style.left=Math.min(width-280,Math.max(8,left+m*band))+'px';tip.style.top='12px';};bar.addEventListener('pointerenter',show);bar.addEventListener('focus',show);bar.addEventListener('click',show);bar.addEventListener('pointerleave',()=>tip.hidden=true);bar.addEventListener('blur',()=>tip.hidden=true);canvas.append(bar);base+=count;});
 const t=svg('text',{x:left+(m+.5)*band,y:height-10,'text-anchor':'middle'});t.textContent=months[m];canvas.append(t);});
 canvas.append(svg('line',{x1:left,x2:width-right,y1:y(r.average),y2:y(r.average),stroke:'#586779','stroke-width':1.5,'stroke-dasharray':'6 4'}));
 const avg=el('p',`Monthly average: ${r.average.toFixed(1)} (${r.total} ÷ 12)`);avg.className='average';root.append(avg);
 const table=el('table'),thead=el('thead'),tr=el('tr');['2026 dispatch outlook','Count','Share'].forEach(x=>tr.append(el('th',x)));thead.append(tr);table.append(thead);const body=el('tbody');categories.forEach((c,i)=>{const row=el('tr');[c,String(r.totals[i]),r.percentages[i].toFixed(1)+'%'].forEach(v=>row.append(el('td',v)));body.append(row);});const total=el('tr');total.className='total';['2026 total',String(r.total),r.total?'100%':'0%'].forEach(v=>total.append(el('td',v)));body.append(total);table.append(body);root.append(table);
 const cleanup=el('p',`Missing Dates: ${r.missing.length}`);cleanup.className='cleanup';cleanup.title='Distinct submissions across all supplied/filtered records with no dispatch dates. Excluded from the 2026 chart: no date establishes their year.';root.append(cleanup);
 const scope=el('small','Missing Dates covers all supplied/filtered records, not just 2026. No recorded refresh timestamp is available.');root.append(scope);
 if(r.issues.length||r.missingIdRows){const detail=el('details'),summary=el('summary',`Data checks: ${r.excluded.length} submissions excluded · ${r.issues.length} with date issues · ${r.missingIdRows} rows without SubID`);detail.append(summary,el('p','Conflicting or invalid dates are not guessed. An issue in the date needed for classification excludes that submission; issues in unused lower-priority fields are flagged only.'));const list=el('ul');r.issues.forEach(x=>list.append(el('li',x.id+': '+x.fields.join(', '))));detail.append(list);root.append(detail);}
 return r;
}
