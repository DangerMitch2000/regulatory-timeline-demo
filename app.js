(async()=>{
 'use strict';
 const chart=document.querySelector('#chart'),tooltip=document.querySelector('#tooltip'),status=document.querySelector('#filter-status');
 const selected={site:new Set(),product:new Set()};
 const fields={site:'Manufacturer',product:'Product'};
 const normalized=value=>value==null?'':String(value).trim();
 let view,rows,queued=Promise.resolve(),hideTimer;
 tooltip.addEventListener('mouseenter',()=>clearTimeout(hideTimer));
 tooltip.addEventListener('mouseleave',()=>{tooltip.style.display='none';});
 try{
  const [spec,data]=window.__demoBundle ? [window.__demoBundle.spec,window.__demoBundle.rows] : await Promise.all(['timeline.json','sample.json'].map(async url=>{const response=await fetch(url);if(!response.ok)throw new Error('Unable to load '+url);return response.json();}));rows=data;
  const options={};
  for(const kind of ['site','product']){
   options[kind]=[...new Set(rows.map(row=>normalized(row[fields[kind]])))].sort((a,b)=>a.localeCompare(b));
   const search=document.querySelector('#'+kind+'-search');
   document.querySelector('#'+kind+'-filter').addEventListener('toggle',()=>{if(document.querySelector('#'+kind+'-filter').open)document.querySelector('#'+(kind==='site'?'product':'site')+'-filter').open=false;});
   const visible=()=>options[kind].filter(value=>(value||'(Missing)').toLocaleLowerCase().includes(search.value.toLocaleLowerCase()));
   const draw=()=>{
    const box=document.querySelector('#'+kind+'-options');box.replaceChildren();
    for(const value of visible()){
     const label=document.createElement('label');label.className='option';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.value=value;checkbox.checked=selected[kind].has(value);const name=document.createElement('span');name.textContent=value||'(Missing)';label.append(checkbox,name);box.append(label);
     checkbox.addEventListener('change',()=>{checkbox.checked?selected[kind].add(value):selected[kind].delete(value);updateSummary(kind);requestFilter();});
    }
    if(!box.children.length){const empty=document.createElement('p');empty.className='empty-options';empty.textContent='No options match this search.';box.append(empty);}
   };
   search.addEventListener('input',draw);
   document.querySelector('#'+kind+'-select').addEventListener('click',()=>{visible().forEach(x=>selected[kind].add(x));draw();updateSummary(kind);requestFilter();});
   document.querySelector('#'+kind+'-clear').addEventListener('click',()=>{selected[kind].clear();draw();updateSummary(kind);requestFilter();});
   document.querySelector('#'+kind+'-filter').addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelector('#'+kind+'-filter').open=false;document.querySelector('#'+kind+'-summary').focus();}});
   options[kind+'Draw']=draw;draw();
  }
  document.querySelector('#reset-filters').addEventListener('click',()=>{for(const kind of ['site','product']){selected[kind].clear();document.querySelector('#'+kind+'-search').value='';options[kind+'Draw']();updateSummary(kind);}requestFilter();});
  chart.replaceChildren();
  view=new vega.View(vega.parse(spec),{renderer:'svg',hover:true}).initialize(chart).tooltip((handler,event,item,value)=>{
   clearTimeout(hideTimer);if(value==null){hideTimer=setTimeout(()=>{tooltip.style.display='none';},180);return;}tooltip.replaceChildren();
   const dl=document.createElement('dl');for(const [k,v] of Object.entries(typeof value==='object'?value:{Action:value})){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=String(v);dl.append(dt,dd);}tooltip.append(dl);tooltip.style.display='block';tooltip.style.left=Math.max(5,Math.min(event.clientX+12,innerWidth-tooltip.offsetWidth-6))+'px';tooltip.style.top=Math.max(5,Math.min(event.clientY+12,innerHeight-tooltip.offsetHeight-6))+'px';
  });
  const resize=new ResizeObserver(entries=>{const {width,height}=entries[0].contentRect;queued=queued.then(()=>view.signal('denebContainer',{width:Math.max(480,width),height:Math.max(480,height)}).runAsync()).catch(showError);});resize.observe(chart);
  const searchProxy=document.querySelector('#detail-search-proxy');
  searchProxy.addEventListener('input',()=>{const query=searchProxy.value;queued=queued.then(()=>view.signal('detailQuery',query).runAsync()).catch(showError);});
  view.addSignalListener('detailQuery',(name,value)=>{searchProxy.value=value;});
  for(const name of ['detailTab','selectedKey'])view.addSignalListener(name,()=>{requestAnimationFrame(()=>{searchProxy.value=view.signal('detailQuery');});});
  view.addSignalListener('detailsOpen',(name,value)=>{searchProxy.closest('label').hidden=!value;});
  chart.addEventListener('pointerdown',()=>chart.focus({preventScroll:true}));
  await requestFilter();
  function updateSummary(kind){document.querySelector('#'+kind+'-summary').textContent=(kind==='site'?'Site':'Product')+' · '+(selected[kind].size?selected[kind].size+' selected':'All');}
  function requestFilter(){queued=queued.then(async()=>{
   const filtered=rows.filter(row=>['site','product'].every(kind=>!selected[kind].size||selected[kind].has(normalized(row[fields[kind]]))));
   tooltip.style.display='none';view.change('dataset',vega.changeset().remove(()=>true).insert(filtered.map(r=>({...r}))));await view.runAsync();
   const n=view.data('sub').length;status.textContent=n+' matching '+(n===1?'submission':'submissions')+' · '+filtered.length+' fictional membership rows';
  }).catch(showError);return queued;}
 }catch(error){showError(error);}
 function showError(error){status.textContent='Demo could not load. Reload the page or use a static web server for downloaded files.';console.error(error);}
})();
