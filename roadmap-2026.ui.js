import {summarize,viewingDay,categories} from './roadmap-2026.logic.js';
const colours=['#2875d9','#ed922d','#269968','#8159bd'],months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const el=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
const svg=(tag,attrs)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
export function render(root,rows,{now=new Date(),notice='',synthetic=false,includeInferred=false,onInference=(value)=>{},businessUnit='*',onBusinessUnit=(value)=>{},expanded=new Set(),onExpansion=(key)=>{}}={}){
 const r=summarize(rows,viewingDay(now),includeInferred,businessUnit);root.replaceChildren();root.className='roadmap2026';
 const header=el('header'),h=el('h1',r.year+' Roadmap'),asof=el('p','As of '+now.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}));header.append(h,asof);root.append(header);
 if(synthetic)root.append(el('p','Synthetic example data'));
 if(notice){const n=el('p',notice);n.className='notice';n.setAttribute('role','status');root.append(n);}
 const controls=el('div');controls.className='controls';
 const unitLabel=el('label','Business unit '),select=el('select');select.setAttribute('aria-label','Business unit');
 const option=(value,label)=>{const o=el('option',label);o.value=value;select.append(o);};option('*','All');
 r.units.forEach(u=>option(JSON.stringify(u),u===null?'Unassigned':u));
 if(businessUnit!=='*'&&!r.units.includes(businessUnit))option(JSON.stringify(businessUnit),String(businessUnit??'Unassigned')+' (no matching records)');
 select.value=businessUnit==='*'?'*':JSON.stringify(businessUnit);select.onchange=()=>onBusinessUnit(select.value==='*'?'*':JSON.parse(select.value));unitLabel.append(select);
 const labelCheck=el('label'),check=el('input');check.type='checkbox';check.checked=includeInferred;check.onchange=()=>onInference(check.checked);labelCheck.append(check,document.createTextNode('Include inferred dispatches'));controls.append(unitLabel,labelCheck);root.append(controls);
 const activeCategories=categories.map((c,i)=>({c,i})).filter(x=>includeInferred||x.i!==3);
 const legend=el('div');legend.className='legend';activeCategories.forEach(({c,i})=>{const label=el('span'),dot=el('i');dot.style.background=colours[i];label.append(dot,document.createTextNode(c));legend.append(label);});root.append(legend);
 const layout=el('div');layout.className='layout';const main=el('section'),side=el('section');side.className='sites';layout.append(main,side);root.append(layout);const chart=el('div');chart.className='chart';main.append(chart);
 const width=Math.max(520,main.clientWidth),height=300,left=46,right=14,top=30,bottom=32,plotW=width-left-right,plotH=height-top-bottom;
 const max=Math.max(1,...r.months.map(m=>m.reduce((a,b)=>a+b,0))),step=Math.max(1,Math.ceil(max/5)),ceiling=step*5,y=n=>top+plotH*(1-n/ceiling),band=plotW/12;
 const canvas=svg('svg',{viewBox:`0 0 ${width} ${height}`,width,height,role:'img','aria-label':`${r.year} monthly dispatch counts. ${r.total} submissions. Average ${r.average.toFixed(1)} per month.`});chart.append(canvas);
 if(now.getFullYear()===r.year)canvas.append(svg('rect',{x:left+now.getMonth()*band,y:top,width:band,height:plotH,fill:'#edf4fc'}));
 for(let n=0;n<=ceiling;n+=step){canvas.append(svg('line',{x1:left,x2:width-right,y1:y(n),y2:y(n),stroke:'#dde4ec'}));const t=svg('text',{x:left-8,y:y(n)+4,'text-anchor':'end'});t.textContent=n;canvas.append(t);}
 const label=svg('text',{x:left,y:16});label.textContent='Submissions';canvas.append(label);
 const tip=el('div');tip.className='tip';tip.hidden=true;tip.setAttribute('role','tooltip');chart.append(tip);
 r.months.forEach((values,m)=>{let base=0;values.forEach((count,c)=>{if(!count)return;const bar=svg('rect',{x:left+m*band+band*.2,y:y(base+count),width:band*.6,height:plotH*count/ceiling,fill:colours[c],tabindex:0,role:'graphics-symbol','aria-label':`${months[m]}: ${categories[c]}, ${count}`});const text=`${months[m]} ${r.year} · ${categories[c]}: ${count}`+(c===2?'\nPlanned dispatch date has passed; actual dispatch date not recorded.':'');const evidence=r.records.filter(x=>x.month===m&&x.category===3);const evidenceText=c===3?'\nActual dispatch missing. Month comes from planned dispatch.\nActual submission evidence: '+evidence.filter(x=>x.evidence.some(e=>e.field==='ActualSubmission')).length+'; actual approval evidence: '+evidence.filter(x=>x.evidence.some(e=>e.field==='ActualApproval')).length+' (may overlap).':'';const tooltipText=text+evidenceText;const title=svg('title',{});title.textContent=tooltipText;bar.append(title);const show=()=>{tip.textContent=tooltipText;tip.hidden=false;tip.style.left=Math.min(width-280,Math.max(8,left+m*band))+'px';tip.style.top='12px';};bar.addEventListener('pointerenter',show);bar.addEventListener('focus',show);bar.addEventListener('click',show);bar.addEventListener('pointerleave',()=>tip.hidden=true);bar.addEventListener('blur',()=>tip.hidden=true);canvas.append(bar);base+=count;});
 const t=svg('text',{x:left+(m+.5)*band,y:height-10,'text-anchor':'middle'});t.textContent=months[m];canvas.append(t);});
 canvas.append(svg('line',{x1:left,x2:width-right,y1:y(r.average),y2:y(r.average),stroke:'#586779','stroke-width':1.5,'stroke-dasharray':'6 4'}));
 const avg=el('p',`Monthly average: ${r.average.toFixed(1)} (${r.total} ÷ 12)`);avg.className='average';main.append(avg);
 const table=el('table'),thead=el('thead'),tr=el('tr');[r.year+' dispatch outlook','Count','Share'].forEach(x=>tr.append(el('th',x)));thead.append(tr);table.append(thead);const body=el('tbody');activeCategories.forEach(({c,i})=>{const row=el('tr');[c,String(r.totals[i]),r.percentages[i].toFixed(1)+'%'].forEach(v=>row.append(el('td',v)));body.append(row);});const total=el('tr');total.className='total';[r.year+' total',String(r.total),r.total?'100%':'0%'].forEach(v=>total.append(el('td',v)));body.append(total);table.append(body);main.append(table);
 side.append(el('h2','Site breakdown'));
 const st=el('table'),sh=el('tr');['Site',...activeCategories.map(x=>x.c),'Total'].forEach(t=>sh.append(el('th',t)));const head=el('thead');head.append(sh);st.append(head);const sb=el('tbody');
 const cells=(row,counts,total)=>{activeCategories.forEach(({i})=>row.append(el('td',String(counts[i]))));row.append(el('td',String(total)));};
 r.sites.forEach(site=>{const row=el('tr'),name=el('td'),button=el('button',(expanded.has(site.key)?'▾ ':'▸ ')+site.label);button.setAttribute('aria-expanded',String(expanded.has(site.key)));button.onclick=()=>onExpansion(site.key);name.append(button);row.append(name);cells(row,site.totals,site.total);sb.append(row);
 if(expanded.has(site.key))site.months.forEach((counts,m)=>{const mr=el('tr');mr.className='monthRow';mr.append(el('td',months[m]));cells(mr,counts,counts.reduce((a,b)=>a+b,0));sb.append(mr);});});
 const sr=el('tr');sr.className='total';sr.append(el('td','Total'));cells(sr,r.totals,r.total);sb.append(sr);st.append(sb);side.append(st);
 if(r.ambiguousSites.length)side.append(el('small',r.ambiguousSites.length+' submissions have multiple sites and are counted once in the unallocated bucket.'));
 const cleanup=el('p','Missing Dates — '+r.year+': '+r.missing.length);cleanup.className='cleanup';root.append(cleanup);
 root.append(el('small','No actual dispatch or usable planned dispatch date, with actual submission or approval in '+r.year+'. Each submission counted once. Independent of the inference checkbox.'));
 if(includeInferred)root.append(el('small','Undated inferred: '+r.undatedInferred.length+' across all filtered years; outside the chart total. May overlap Missing Dates — do not add these counts.'));
 const inferred=r.records.filter(x=>x.category===3);
 if(inferred.length){const d=el('details');d.append(el('summary','Inferred evidence — '+inferred.length+' records'));const list=el('ul');inferred.forEach(x=>list.append(el('li',x.id+' · planned dispatch '+new Date(x.plannedDay).toISOString().slice(0,10)+' · actual dispatch missing · '+x.evidence.map(e=>e.field+': '+new Date(e.day).toISOString().slice(0,10)).join('; '))));d.append(list);root.append(d);}
 if(r.issues.length||r.missingIdRows||r.ambiguousSites.length){const d=el('details');d.append(el('summary','Data checks: '+r.excluded.length+' excluded · '+r.issues.length+' date issues · '+r.ambiguousSites.length+' multiple-site records · '+r.missingIdRows+' rows without SubID'));
 d.append(el('p','Checks cover the filtered records across all years; multi-site checks cover the chart year. Conflicting dates are not guessed. Missing Dates and date issues may overlap.'));const list=el('ul');r.issues.forEach(x=>list.append(el('li',x.id+': '+x.fields.join(', '))));r.ambiguousSites.forEach(x=>list.append(el('li',x.id+': '+x.sites.join(', '))));d.append(list);root.append(d);}
 return r;
}
