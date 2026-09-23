(async()=>{
 'use strict';
 const $=id=>document.getElementById(id), chart=$('chart'),status=$('filter-status'),detail=$('selected-details');
 const fields={site:'Manufacturer',product:'Product',country:'Country',type:'SubmissionType'},selected=Object.fromEntries(Object.keys(fields).map(k=>[k,new Set()]));
 const norm=x=>x==null?'':String(x).trim(),el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 let view,rows,queue=Promise.resolve(),detailQuery='',detailPage=0,selectedKey='',timer;
 const run=fn=>queue=queue.then(fn).catch(error=>{status.textContent='Could not update the chart: '+error.message;console.error(error);});
 const date=x=>x==null||!Number.isFinite(x)?'Not recorded':new Date(x).toISOString().slice(0,10);
 const duration=x=>x==null?'Not recorded / withheld':Math.round(x)+' days';
 try{
  const [spec,data]=window.__demoBundle?[window.__demoBundle.spec,window.__demoBundle.rows]:await Promise.all(['timeline.json','sample.json'].map(async url=>{const r=await fetch(url+'?v=1.5');if(!r.ok)throw Error('Unable to load '+url);return r.json();}));rows=data;
  // These are genuine Vega HTML input bindings, also included in the Deneb deliverable.
  view=new vega.View(vega.parse(spec),{renderer:'svg',hover:true}).initialize(chart,$('bindings')).tooltip((h,event,item,value)=>{
   const tip=$('tooltip');if(value==null){tip.hidden=true;return;}tip.replaceChildren();for(const [k,v]of Object.entries(typeof value==='object'?value:{Details:value})){tip.append(el('strong',k+': '),el('span',String(v)),el('br'));}tip.hidden=false;tip.style.left=Math.max(6,Math.min(event.clientX+12,innerWidth-330))+'px';tip.style.top=Math.max(6,Math.min(event.clientY+12,innerHeight-160))+'px';
  });
  const stateLegend=$('state-legend');
  const states=[['Active / Planned','#6d9eff'],['In progress / Ready','#43c6ec'],['Sent / Distributed','#bd9aff'],['HA received','#42cbbb'],['Completed','#65d18c'],['Health Authority Approved','#37d67a'],['Hold / Deferred','#e8b65f'],['Rejected','#f27b82'],['Inactive / Other','#99a4b5']];
  for(const [label,colour]of states){const wrap=el('label'),cb=el('input'),sw=el('span',undefined,'state-swatch');cb.type='checkbox';cb.checked=true;cb.value=colour;sw.style.background=colour;wrap.append(cb,sw,el('span',label));stateLegend.append(wrap);cb.onchange=()=>run(async()=>{view.signal('stateColours',[...stateLegend.querySelectorAll('input:checked')].map(x=>x.value));await view.runAsync();updateStatus();});}
  for(const [kind,field]of Object.entries(fields)){

   const box=el('details',undefined,'filter'),summary=el('summary',(kind==='site'?'Site (LM)':kind[0].toUpperCase()+kind.slice(1))+' · All'),panel=el('div',undefined,'panel'),search=el('input');search.type='search';search.placeholder='Search '+kind+'s';search.setAttribute('aria-label','Search '+kind+' options');
   const choices=el('div',undefined,'options'),actions=el('div',undefined,'filter-actions'),all=el('button','Select shown'),clear=el('button','Clear');actions.append(all,clear);panel.append(search,actions,choices);box.append(summary,panel);$('filters').prepend(box);
   const values=[...new Set(rows.map(r=>norm(r[field])))].sort(),shown=()=>values.filter(x=>(x||'(Missing)').toLowerCase().includes(search.value.toLowerCase()));
   const draw=()=>{choices.replaceChildren();for(const value of shown()){const label=el('label',undefined,'option'),cb=el('input');cb.type='checkbox';cb.checked=selected[kind].has(value);label.append(cb,el('span',value||'(Missing)'));choices.append(label);cb.onchange=()=>{cb.checked?selected[kind].add(value):selected[kind].delete(value);update();};}};
   const update=()=>{summary.textContent=(kind==='site'?'Site (LM)':kind[0].toUpperCase()+kind.slice(1))+' · '+(selected[kind].size?selected[kind].size+' selected':'All');filter();};search.oninput=draw;all.onclick=()=>{shown().forEach(x=>selected[kind].add(x));draw();update();};clear.onclick=()=>{selected[kind].clear();draw();update();};box.ontoggle=()=>{if(box.open)for(const other of $('filters').querySelectorAll('details'))if(other!==box)other.open=false;};box.reset=()=>{selected[kind].clear();search.value='';draw();summary.textContent=(kind==='site'?'Site (LM)':kind[0].toUpperCase()+kind.slice(1))+' · All';};draw();
  }
  $('reset-filters').onclick=()=>{for(const cb of stateLegend.querySelectorAll('input'))cb.checked=true;run(()=>view.signal('stateColours',states.map(s=>s[1])).runAsync());for(const box of $('filters').querySelectorAll('details'))box.reset();run(async()=>{view.signal('query','');await view.runAsync();});filter();};
  const resize=new ResizeObserver(entries=>{const {width,height}=entries[0].contentRect;run(()=>view.signal('denebContainer',{width:Math.max(720,width),height:Math.max(480,height)}).runAsync());});resize.observe(chart);
  chart.addEventListener('pointerdown',e=>{if(!e.target.closest('input,select'))chart.focus({preventScroll:true});});
  for(const name of ['selectedKey','query','mode','compareLevel','pinsOnly','pinClick','showRegistrationEnd','sortBy','axisMode'])view.addSignalListener(name,()=>{clearTimeout(timer);timer=setTimeout(()=>{updateStatus();renderDetails();updateControls();},0);});
  // The separate browser details list has full native caret, paste and selection behaviour.
  $('list-search').oninput=e=>{detailQuery=e.target.value;detailPage=0;renderDetails();};
  $('list-prev').onclick=()=>{detailPage=Math.max(0,detailPage-1);renderDetails();};$('list-next').onclick=()=>{detailPage++;renderDetails();};
  $('copy-details').onclick=async()=>{const row=view.data('selectedRow')[0];if(!row)return;const text=$('detail-body').innerText+'\n\nFull products\n'+row.ProductInfo.members.map(x=>x.label).join('\n')+'\n\nFull countries\n'+row.CountryInfo.members.map(x=>x.label).join('\n')+'\n\nFull legal manufacturers\n'+row.ManufacturerInfo.members.map(x=>x.label).join('\n');await copy(text,$('copy-status'));};
  $('copy-id').onclick=async()=>{const row=view.data('selectedRow')[0];if(row)await copy(row.level===2?row.SubID:row.level===1?row.ROID:row.AppID,$('copy-status'));};
  $('clear-pins').onclick=()=>run(async()=>{view.change('pinned',vega.changeset().remove(()=>true));await view.runAsync();updateStatus();});
  detail.ontoggle=()=>document.body.classList.toggle('details-expanded',detail.open);
  await filter();updateControls();
  function filter(){return run(async()=>{const matching=rows.filter(row=>Object.entries(fields).every(([kind,field])=>!selected[kind].size||selected[kind].has(norm(row[field]))));view.change('dataset',vega.changeset().remove(()=>true).insert(matching.map(r=>({...r}))));await view.runAsync();detailPage=0;updateStatus();renderDetails();});}
  function updateStatus(){status.textContent=view.data('sub').length+' submissions · '+view.data('apps').length+' applications · '+view.data('pinned').length+' pinned';}
  function updateControls(){for(const binding of $('bindings').children){const name=binding.querySelector('input,select')?.name;if(['compareLevel','axisMode','sortBy','pinsOnly'].includes(name))binding.hidden=view.signal('mode')!=='Compare';if(name==='axisMode')binding.hidden=view.signal('mode')!=='Compare'||view.signal('compareLevel')!==2;if(name==='detailQuery')binding.hidden=true;}$('comparison-help').hidden=view.signal('mode')!=='Compare';}
  function renderDetails(){
   const row=view.data('selectedRow')[0],body=$('detail-body'),lists=$('member-lists');body.replaceChildren();lists.replaceChildren();
   if(selectedKey!==view.signal('selectedKey')){selectedKey=view.signal('selectedKey');detailQuery='';$('list-search').value='';detailPage=0;}
   if(!row){$('detail-title').textContent=selectedKey?'Details · selection outside current filters':'Details · select a row or membership count';body.append(el('p','Select a submission, or a parent subtitle or membership count.'));$('detail-tools').hidden=true;return;}
   $('detail-tools').hidden=false;const id=row.level===2?row.SubID:row.level===1?row.ROID:row.AppID;
   $('detail-title').textContent='Details · '+id+' · '+row.State;
   const heading=el('h2',id),badge=el('span',row.State,'state-badge');badge.style.color=row.StateColor;heading.append(badge);body.append(heading);
   if(row.level===2)body.append(el('p',row.SubmissionType,'type-label'));
   const relations=el('dl',undefined,'relationships');for(const [label,value]of [['Application',row.AppID],['Regulatory objective',row.ROID],['Legal manufacturer',row.ManufacturerInfo.detail],['Countries',row.CountryInfo.detail]]){relations.append(el('dt',label),el('dd',value||'Not recorded'));}body.append(relations);
   if(row.level===2){
    const table=el('table'),head=el('tr');for(const t of ['Milestone','Original','Latest','Actual'])head.append(el('th',t));table.append(head);
    for(const stage of ['Dispatch','Submission','Approval']){const tr=el('tr');tr.append(el('th',stage));for(const prefix of ['Original','Latest','Actual']){const field=prefix+stage;tr.append(el('td',row[field+'Bad']>0||row[field+'Min']!==row[field+'Max']?'Withheld — see data issues':date(row[field])));}table.append(tr);}body.append(table);
    const reg=el('p','Registration start: '+date(row.RegistrationStart)+' · Registration end: '+date(row.RegistrationEnd));body.append(reg);
    const metrics=el('table'),tr=el('tr');for(const t of ['Completed duration','Value'])tr.append(el('th',t));metrics.append(tr);for(const [label,value]of [['Dispatch → submission',duration(row.DispatchDays)],['Submission → approval',duration(row.ApprovalDays)],['Open stage age',row.OpenAge||'Not open / not recorded']]){const tr=el('tr');tr.append(el('th',label),el('td',value));metrics.append(tr);}body.append(metrics);
    const variance=el('table'),vh=el('tr');for(const t of ['Actual variance (days)','vs Original','vs Latest'])vh.append(el('th',t));variance.append(vh);for(const stage of ['Dispatch','Submission','Approval']){const tr=el('tr');tr.append(el('th',stage));for(const baseline of ['Original','Latest']){const val=row[stage+baseline+'Variance'];tr.append(el('td',val==null?'Not recorded':(val>0?'+':'')+Math.round(val)));}variance.append(tr);}body.append(variance,el('p','Positive variance means later than the plan. Open age is not a completed duration.','muted'));
   }else body.append(el('p',(row.level===0?row.ROCount+' distinct ROs · ':'')+row.n+' distinct submissions'),el('p','Child submission states: '+row.Breakdown.label));
   const issues=[];if(row.level===2){for(const key of ['OriginalDispatch','LatestDispatch','ActualDispatch','OriginalSubmission','LatestSubmission','ActualSubmission','OriginalApproval','LatestApproval','ActualApproval','RegistrationStart','RegistrationEnd']){if(row[key+'Bad']>0)issues.push(key+': invalid input, withheld');else if(row[key+'Min']!==row[key+'Max'])issues.push(key+': conflicting dates, withheld');else if(row[key+'Valid']>0&&row[key+'Valid']<row.sourceRows)issues.push(key+': some membership rows are blank');}if(row.Reversed)issues.push('Reversed actual processing dates: duration withheld');}if(row.State==='Conflicting values')issues.push('Conflicting own-state values; neutral colour');body.append(el('h3','Data issues'),el('p',issues.length?issues.join(' · '):row.level<2?row.issues+' withheld milestone fields across children':'No conflicting or invalid milestone values detected.'));
   const groups=[['Products',row.ProductInfo],['Countries',row.CountryInfo],['Legal manufacturers',row.ManufacturerInfo]],q=detailQuery.toLowerCase();let max=1;
   for(const [label,info]of groups){const found=info.members.map(m=>m.label).filter(x=>x.toLowerCase().includes(q));max=Math.max(max,Math.ceil(found.length/12));}
   detailPage=Math.min(detailPage,max-1);
   for(const [label,info]of groups){const section=el('section'),found=info.members.map(m=>m.label).filter(x=>x.toLowerCase().includes(q));section.append(el('h3',label+' · '+found.length+' matching'));const ul=el('ul');for(const item of found.slice(detailPage*12,detailPage*12+12))ul.append(el('li',item));if(!ul.children.length)ul.append(el('li','No values on this page'));section.append(ul);lists.append(section);}
   $('list-page').textContent=(detailPage+1)+' / '+max;$('list-prev').disabled=detailPage===0;$('list-next').disabled=detailPage>=max-1;
  }
  async function copy(text,target){try{await navigator.clipboard.writeText(text);target.textContent='Copied';}catch{target.textContent='Clipboard unavailable here. Select the text and use Copy.';}}
 }catch(error){status.textContent='Could not load the demo: '+error.message;console.error(error);}
})();
