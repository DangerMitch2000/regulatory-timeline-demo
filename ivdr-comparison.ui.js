import {compare,viewingDay,categories} from './ivdr-comparison.logic.js';
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const percent=n=>n.toFixed(1)+'%';
export function render(root,rows,{now=new Date(),state={},onChange=(patch)=>{},expanded=new Set(),onExpansion=(key)=>{},notice='',projectMapped=true,synthetic=false}={}){
 const r=compare(projectMapped?rows:[],viewingDay(now),state);root.replaceChildren();root.className='ivdrOverview';
 const header=el('header'),titles=el('div');titles.append(el('h1','IVDR Registration Overview'),el('p',r.year+' · '+(r.month<0?'Full year':months[r.month])+' · distinct submissions','subtitle'));header.append(titles,el('span','As of '+now.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),'asof'));root.append(header);
 if(synthetic)root.append(el('p','Fictional demonstration data','demoNote'));
 if(notice)root.append(el('p',notice,'notice'));
 if(!projectMapped){root.append(el('p','Add the Regulatory Objective project field to Project before viewing this comparison. A missing field is not the same as a blank value.','notice'));return r;}
 const controls=el('div',undefined,'controls');
 function dropdown(label,key,options,value){const field=el('label',label),select=el('select');select.setAttribute('aria-label',label);if(!options.some(o=>JSON.stringify(o.value)===JSON.stringify(value)))options.push({value,label:String(value??'Unassigned')+' (no matching records)'});
  options.forEach(o=>{const option=el('option',o.label);option.value=JSON.stringify(o.value);select.append(option)});select.value=JSON.stringify(value);select.onchange=()=>onChange({[key]:JSON.parse(select.value)});field.append(select);controls.append(field);}
 dropdown('Business unit','businessUnit',[{value:'*',label:'All business units'},...r.units.map(value=>({value,label:value===null?'Unassigned':value}))],state.businessUnit===undefined?'*':state.businessUnit);
 dropdown('Site','site',[{value:'*',label:'All sites'},...r.siteChoices.map(s=>({value:s.key,label:s.label}))],state.site??'*');
 dropdown('Month','month',[{value:-1,label:'All months'},...months.map((label,value)=>({value,label}))],r.month);
 dropdown('Registration group','classification',[{value:'*',label:'IVDR + Non-IVDR'},{value:'ivdr',label:'IVDR'},{value:'non',label:'Non-IVDR'}],state.classification??'*');
 const checkLabel=el('label',undefined,'check'),check=el('input');check.type='checkbox';check.checked=!!state.includeInferred;check.onchange=()=>onChange({includeInferred:check.checked});checkLabel.append(check,document.createTextNode('Include inferred dispatches'));controls.append(checkLabel);root.append(controls);
 const summary=el('div',undefined,'summary');for(const [label,value,cls]of [['Total submissions',r.total,''],['IVDR',r.ivdr,'ivdr'],['Non-IVDR',r.non,'non'],['IVDR share',percent(r.share),'']]){const card=el('div',undefined,'metric '+cls);card.append(el('span',label),el('strong',String(value)));summary.append(card)}root.append(summary);
 const legend=el('div',undefined,'legend');for(const [name,cls]of [['IVDR','ivdr'],['Non-IVDR','non']]){const label=el('span');label.append(el('i',undefined,cls),document.createTextNode(name));legend.append(label)}legend.append(el('span','Blank project values count as Non-IVDR.','muted'));root.append(legend);
 const layout=el('div',undefined,'comparisonLayout'),tablePanel=el('section',undefined,'tablePanel'),chartPanel=el('section',undefined,'chartPanel');layout.append(tablePanel,chartPanel);root.append(layout);
 tablePanel.append(el('h2','Site and progress'),el('p','Expand a site to see dispatch progress.','hint'));
 const table=el('table'),thead=el('thead'),head=el('tr');['Site / Progress','IVDR','Non-IVDR','Total'].forEach(name=>head.append(el('th',name)));thead.append(head);table.append(thead);const tbody=el('tbody');
 function counts(row,s){row.append(el('td',String(s.ivdr),'ivdrText'),el('td',String(s.non),'nonText'),el('td',String(s.total),'totalNumber'));}
 r.sites.forEach(s=>{const row=el('tr',undefined,'siteRow'),name=el('td'),button=el('button',(expanded.has(s.key)?'▾ ':'▸ ')+s.label,'expand');button.setAttribute('aria-expanded',String(expanded.has(s.key)));button.onclick=()=>onExpansion(s.key);name.append(button);row.append(name);counts(row,s);tbody.append(row);
  if(expanded.has(s.key))s.progress.forEach((p,i)=>{if(i===3&&!state.includeInferred)return;const sub=el('tr',undefined,'progressRow');sub.append(el('td',categories[i]));counts(sub,p);tbody.append(sub)});
 });
 const total=el('tr',undefined,'grandTotal');total.append(el('td','Grand total'));counts(total,r);tbody.append(total);table.append(tbody);tablePanel.append(table);
 chartPanel.append(el('h2','IVDR mix by site'),el('p','Bar length shows volume · labels show the IVDR share.','hint'));
 const max=Math.max(1,...r.sites.map(s=>s.total)),chart=el('div',undefined,'siteChart');chart.setAttribute('role','list');chartPanel.append(chart);
 r.sites.forEach(s=>{const row=el('div',undefined,'chartRow');row.setAttribute('role','listitem');const title=el('div',undefined,'barHeading');title.append(el('strong',s.label),el('span',s.total+' total · '+percent(s.ivdr/s.total*100)+' IVDR'));row.append(title);
  const bar=el('button',undefined,'stack');bar.setAttribute('aria-label',s.label+': '+s.ivdr+' IVDR, '+s.non+' Non-IVDR, '+s.total+' total. '+percent(s.ivdr/s.total*100)+' IVDR. Expand progress.');bar.setAttribute('aria-expanded',String(expanded.has(s.key)));bar.title=s.label+'\nIVDR: '+s.ivdr+'\nNon-IVDR: '+s.non+'\nTotal: '+s.total+'\n'+(r.month<0?'Full year':months[r.month])+' '+r.year;bar.onclick=()=>onExpansion(s.key);
  for(const [field,cls]of [['ivdr','ivdr'],['non','non']]){const segment=el('span',s[field]/max>=.07?String(s[field]):'',cls);segment.style.width=(s[field]/max*100)+'%';bar.append(segment)}row.append(bar);chart.append(row);
 });
 if(!r.total)chart.append(el('p','No submissions match this selection.','empty'));
 const totals=el('details',undefined,'progressTotals');totals.append(el('summary','Progress totals for this selection'));const text=categories.map((c,i)=>i===3&&!state.includeInferred?'':c+': '+r.progress[i].total).filter(Boolean).join(' · ');totals.append(el('p',text));root.append(totals);
 const cleanup=el('div',undefined,'cleanup');cleanup.append(el('strong','Missing Dates — '+r.year+': '+r.missing.length),el('p','No usable dispatch date, but actual submission or approval occurred this year. Scoped to Business unit, Site and Registration group; all months, since no dispatch month is known.'));if(state.includeInferred)cleanup.append(el('p','Undated inferred: '+r.undatedInferred.length+' across all filtered years. Outside chart totals; may overlap Missing Dates.'));root.append(cleanup);
 const checks=el('details',undefined,'checks');checks.append(el('summary','Counting and data checks'),el('p','Each submission counts once. IVDR plus rebranding or UDI counts as IVDR; blanks and labels without IVDR count as Non-IVDR. Multiple sites are counted once as unallocated. Dispatch month and inference rules match the Roadmap.'));
 checks.append(el('p',r.excluded.length+' excluded for required-date issues · '+r.issues.length+' records with date issues (all filtered years) · '+r.ambiguousSites.length+' multi-site records (full year) · '+r.missingIdRows+' rows without an identifier (business-unit scope).'));
 const list=el('ul');r.issues.forEach(x=>list.append(el('li',x.id+': '+x.fields.join(', '))));r.ambiguousSites.forEach(x=>list.append(el('li',x.id+': '+x.sites.join(', '))));checks.append(list);root.append(checks);
 return r;
}
