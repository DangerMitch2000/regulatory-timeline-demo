(async()=>{
const target=document.querySelector('#chart'),select=document.querySelector('#manufacturer'),tip=document.querySelector('#tooltip');
try{
const responses=await Promise.all([fetch('timeline.json'),fetch('sample.json')]);
if(responses.some(r=>!r.ok))throw new Error('The demo files could not be loaded.');
const [spec,rows]=await Promise.all(responses.map(r=>r.json()));
for(const name of [...new Set(rows.map(r=>r.Manufacturer))].sort()){const option=document.createElement('option');option.value=name;option.textContent=name;select.appendChild(option);}
let view;
async function render(){if(view)view.finalize();target.replaceChildren();tip.style.display='none';view=new vega.View(vega.parse(spec),{renderer:'svg',hover:true}).initialize(target).tooltip((handler,event,item,value)=>{tip.replaceChildren();if(!value){tip.style.display='none';return;}const dl=document.createElement('dl');for(const [k,v] of Object.entries(typeof value === 'object' ? value : {Action:value})){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=String(v);dl.append(dt,dd);}tip.appendChild(dl);tip.style.display='block';tip.style.left=Math.max(8,Math.min(event.clientX+14,innerWidth-tip.offsetWidth-10))+'px';tip.style.top=Math.max(8,Math.min(event.clientY+14,innerHeight-tip.offsetHeight-10))+'px';});view.change('dataset',vega.changeset().insert(rows.filter(r=>!select.value||r.Manufacturer===select.value)));await view.runAsync();}
select.addEventListener('change',()=>render().catch(showError));await render();
}catch(e){showError(e);}
function showError(e){target.textContent='Unable to load the demo. Please reload the page. If viewing downloaded files, use a local static server.';console.error(e);}
})();
