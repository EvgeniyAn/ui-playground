'use strict';
const $ = selector => document.querySelector(selector);
const parts = ['Wheels', 'Pedals', 'Saddle', 'Handlebars'];
const names = ['Default', 'Urban', 'Jumper', 'Expert'];
let current = 0, selected = [0, 0, 0, 0], folded = false, generation = 0, items = 0, entering = false;
const running = new Set();
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const svg = body => `<svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
function wheelMarkup(style, radius = 94) {
 let spokes = '';
 if(style===0){
  for(let i=0;i<3;i++)spokes+=`<g transform="rotate(${i*120-20})"><path d="M-10 -8Q-5 -40 -17 -83L-23 -87L23 -87L17 -82Q5 -37 10 -8Z" fill="url(#blade)" stroke="#969aa0" stroke-width=".7"/><path d="M-3 -24L-5 -73Q0 -77 5 -73L3 -24Z" fill="none" stroke="#a7abb0" stroke-width="1"/><path d="M-15 -81L-10 -45" stroke="#eef0f1" stroke-width="1.2"/><g fill="url(#hub)" stroke="#848890" stroke-width=".6"><circle cy="-81" r="2"/><circle cx="-13" cy="-83" r="1.8"/><circle cx="13" cy="-83" r="1.8"/></g></g>`;
 }else if(style===1){
  for(let i=0;i<28;i++){const a=i*Math.PI*2/28;spokes+=`<path d="M${Math.cos(a+.5)*8} ${Math.sin(a+.5)*8}L${Math.cos(a)*88} ${Math.sin(a)*88}" stroke="${i%2?'#c4c7ca':'#636973'}" stroke-width=".85"/>`;}
 }else if(style===2){
  spokes='<circle r="87" fill="url(#rubber)"/><circle r="74" fill="none" stroke="#41454c" stroke-width=".8"/><path d="M-56 -57Q0 -81 59 -54" fill="none" stroke="#5b6068" stroke-width="1.5"/>';
 }else{
  for(let i=0;i<5;i++)spokes+=`<path transform="rotate(${i*72})" d="M-6 0L-12 -87L-2 -88L7 -4Z" fill="url(#rubber)" stroke="#6e737a" stroke-width=".6"/>`;
 }
 let rotor='';for(let i=0;i<12;i++){const a=i*Math.PI/6;rotor+=`<ellipse cx="${Math.cos(a)*20}" cy="${Math.sin(a)*20}" rx="2.5" ry="1.6" transform="rotate(${i*30} ${Math.cos(a)*20} ${Math.sin(a)*20})" fill="#777d8570"/>`;}
 return `<circle r="${radius}" fill="none" stroke="url(#rubber)" stroke-width="11"/><circle r="${radius+3}" fill="none" stroke="#62666d" stroke-width=".6" stroke-dasharray="2 2" opacity=".65"/><circle r="${radius-1}" fill="none" stroke="#080b0f" stroke-width="1"/><circle r="${radius-6}" fill="none" stroke="url(#metal)" stroke-width="6"/><circle r="${radius-9}" fill="none" stroke="#f6f7f7" stroke-width="1"/>${spokes}<circle r="24" fill="none" stroke="url(#metal)" stroke-width="4"/>${rotor}<circle r="13" fill="url(#hub)" stroke="#949ba0" stroke-width="1"/><circle r="6" fill="url(#metal)" stroke="#3f454b" stroke-width="1.2"/><circle r="2" fill="#464b53"/><path d="M0 86v-8" stroke="#34383d" stroke-width="2"/><path d="M0 79v-3" stroke="#aaaeb5" stroke-width="1"/><path d="M-25 91L-9 94" stroke="#c39b55" stroke-width="1"/>`;
}
function icon(part, variant=0) {
 if(part===0){let p='';for(let i=0;i<[3,12,0,5][variant];i++){let a=i*2*Math.PI/[3,12,1,5][variant];p+=`<path d="M32 32L${32+25*Math.cos(a)} ${32+25*Math.sin(a)}"/>`;}return svg(`<circle cx="32" cy="32" r="26" stroke-width="${variant===2?7:3}"/>${p}<circle cx="32" cy="32" r="4"/>`);}
 if(part===1)return svg(`<path d="M18 42L39 24M16 35l15 6-2 9-16-5zM34 14l17 5-2 10-18-5z"/><path d="M${17+variant*3} 38l9 4M37 19l9 3"/>`);
 if(part===2)return svg(`<path d="M10 ${19+variant*2}Q20 16 30 22L54 22Q58 30 42 31L27 35Q17 35 10 27Z" fill="${variant===1?'currentColor':'none'}"/><path d="M30 35l6 17h-7l-6-17"/>`);
 return svg(['<path d="M6 24H58M32 24v25h-5V24"/>','<path d="M8 22v13q0 9 8 3M56 22v13q0 9-8 3M8 28q24 9 48 0M32 33v15"/>','<path d="M5 30L23 23L41 23L59 30M32 23v23"/>','<path d="M7 18L10 30H54L57 18M32 30v18"/>'][variant]);
}
function renderBike(){
 for(const id of ['#rear-wheel','#front-wheel'])$(id).innerHTML=wheelMarkup(selected[0]);
 const saddles=['M174 84Q185 82 199 87Q210 90 228 86Q243 83 251 88L254 96Q240 94 222 99L207 106Q195 103 184 99Z','M174 87Q191 87 205 92Q224 83 246 88Q256 91 254 98L225 98L211 109L187 102Z','M183 84Q217 77 241 84Q251 86 254 96L227 98L210 103L189 98Z','M178 85Q208 81 242 84Q254 85 256 95Q232 92 214 103L185 98Z'];
 $('#saddle').innerHTML=`<path d="M191 101Q212 118 240 99M202 105L211 113L226 104" stroke="url(#metal)" stroke-width="2" fill="none"/><path d="M205 109L215 111" stroke="#191d24" stroke-width="6"/><path d="${saddles[selected[2]]}" fill="${selected[2]===1?'url(#frame)':'url(#leather)'}" stroke="#8e9098" stroke-width=".8"/><path d="M176 85Q190 86 205 94L198 102L184 98Z" fill="${selected[2]===0?'url(#grip)':'#292e36'}"/><path d="M178 87Q189 88 202 94M218 91Q240 85 249 90" stroke="#dad6d4" stroke-width=".55" stroke-dasharray="1 1.5" opacity=".65"/><path d="M221 97L250 94" stroke="#91929a" stroke-width=".6"/>`;
 const bars=['M398 79L444 94','M397 77L443 87Q460 99 446 104L440 99','M390 89L406 80L431 84L449 98','M391 75L398 88L438 94L448 82'];
 $('#handlebars').innerHTML=`<path d="${bars[selected[3]]}" stroke="#151b22" stroke-width="6" fill="none" stroke-linecap="round"/><path d="${bars[selected[3]]}" stroke="#69717b" stroke-width="1" fill="none"/><path d="M395 78L408 83" stroke="url(#grip)" stroke-width="9" stroke-linecap="round"/><path d="M437 91L446 95" stroke="url(#grip)" stroke-width="7" stroke-linecap="round"/><path d="M396 75L393 81M399 76L397 83M403 78L400 84M406 79L404 86" stroke="#573533" stroke-width=".6" opacity=".7"/><ellipse cx="393" cy="77" rx="3.3" ry="4.5" transform="rotate(-60 393 77)" fill="#303239" stroke="#b27261" stroke-width="1.2"/><path d="M433 94L441 99L442 105L431 99" fill="#20252c" stroke="#646971" stroke-width=".7"/><path d="M432 99L428 108" stroke="#282e35" stroke-width="2" stroke-linecap="round"/><circle cx="428" cy="89" r="2" fill="url(#hub)"/>`;
 const pedalWidth=[24,32,20,28][selected[1]];
 $('#pedals').innerHTML=`<circle cx="284" cy="334" r="11" fill="url(#metal)" stroke="#94989c"/><path d="M277 336Q274 329 282 328Q289 327 291 335L302 365L295 369Z" fill="url(#rubber)" stroke="#686e75" stroke-width=".7"/><path d="M286 340L296 362" stroke="#5b6069" stroke-width="1.2"/><circle cx="283" cy="334" r="4" fill="#171c22" stroke="#62666d"/><g transform="translate(${297-pedalWidth/2} 365)"><path d="M0 0L${pedalWidth} -2L${pedalWidth+1} 7L0 9Z" fill="${selected[1]===2?'#a5785d':'#232830'}" stroke="#737984" stroke-width="1"/><path d="M5 1v6M10 1v6M15 0v6M20 0v6" stroke="#a2a5a8" stroke-width="1.4"/><path d="M2 0L${pedalWidth-2} -1" stroke="#d9dce0" stroke-width=".7"/><path d="M${pedalWidth-2} 1v4" stroke="#cb9942" stroke-width="2"/></g>`;
 $('#price').textContent='$'+(2850+selected.reduce((s,v)=>s+v*65,0));
}
function renderOptions(){
 $('#part-title').textContent=parts[current];
 $('.categories').innerHTML=parts.map((p,i)=>`<button aria-label="${p}" aria-pressed="${i===current}" data-part="${i}">${icon(i)}</button>`).join('');
 $('.options').innerHTML=names.map((n,i)=>`<button aria-label="${n} ${parts[current].toLowerCase()}" aria-pressed="${selected[current]===i}" data-option="${i}">${icon(current,i)}<span>${n}</span></button>`).join('');
}
async function animate(el, frames, duration=500){
 if(reduced.matches)return;
 const animation=el.animate(frames,{duration,easing:'cubic-bezier(.22,.75,.25,1)',fill:'none'});running.add(animation);
 try{await animation.finished;}catch{}finally{running.delete(animation);}
}
function stop(){generation++;for(const a of running)a.cancel();running.clear();if(entering){entering=false;setFold(false,true);}$('#replay').textContent='↻ Replay';}
async function choose(option){
 stop();const token=generation;const part=current;selected[part]=option;renderOptions();
 const targets=part===0?[$('#rear-wheel'),$('#front-wheel')]:[$(['#rear-wheel','#pedals','#saddle','#handlebars'][part])];
 await Promise.all(targets.map(el=>animate(el,[{opacity:1},{opacity:0}],180)));
 if(token!==generation)return;renderBike();
 await Promise.all(targets.map(el=>animate(el,[{opacity:0},{opacity:1}],400)));
 $('#status').textContent=`${names[option]} ${parts[part].toLowerCase()} selected.`;
}
async function setFold(value, immediate=false){folded=value;$('#fold').setAttribute('aria-pressed',String(value));$('#unfold').setAttribute('aria-pressed',String(!value));$('#fold').classList.toggle('selected',value);$('#unfold').classList.toggle('selected',!value);
 const rear=$('#rear-assembly'),front=$('#front-assembly');const before=[rear.style.transform||'none',front.style.transform||'none'];
 rear.style.transform=value?'translate(122px, -16px) rotate(-18deg)':'none';front.style.transform=value?'translate(-74px, -5px) rotate(12deg)':'none';
 if(!immediate)await Promise.all([rear,front].map((el,i)=>animate(el,[{transform:before[i]},{transform:el.style.transform}],850)));
}
async function playEntrance(){
 if(reduced.matches)return;
 const token=generation;
 entering=true;
 setFold(true,true);
 await animate($('#bike'),[
  {opacity:0,transform:'translateY(18px) scale(.94)'},
  {opacity:1,transform:'translateY(0) scale(1)'}
 ],650);
 if(token!==generation)return;
 await setFold(false);
 if(token===generation)entering=false;
}
function reset(){stop();selected=[0,0,0,0];current=0;renderBike();renderOptions();setFold(false);$('#status').textContent='Configuration reset.';}
$('.categories').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;stop();renderBike();current=Number(b.dataset.part);renderOptions();$('.categories').children[current].focus();});
$('.options').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const index=Number(b.dataset.option);choose(index);$('.options').children[index].focus();});
$('#fold').onclick=()=>{stop();renderBike();setFold(true);};$('#unfold').onclick=()=>{stop();renderBike();setFold(false);};
$('#reset').onclick=reset;$('#back').onclick=()=>{stop();current=0;renderBike();renderOptions();};
$('#replay').onclick=async()=>{
 if($('#replay').textContent==='Stop'){stop();renderBike();return;}
 stop();selected=[0,0,0,0];current=0;renderBike();renderOptions();const token=generation;$('#replay').textContent='Stop';
 await setFold(true);if(token!==generation)return;await setFold(false);
 for(const [part,option] of [[0,1],[2,1],[3,1]]){if(token!==generation)return;current=part;selected[part]=option;renderOptions();renderBike();await animate($('#bike'),[{opacity:.45,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],850);}
 if(token===generation){$('#replay').textContent='↻ Replay';$('#status').textContent='Replay complete.';}
};
function show(title,copy){$('#dialog-title').textContent=title;$('#dialog-copy').textContent=copy;$('#info').showModal();}
$('#close').onclick=()=>$('#info').close();
$('#specs').onclick=()=>show('IF Mode · Specifications','Folding city bicycle\nAluminium frame · 26-inch wheels\nChoose your wheels, pedals, saddle and handlebars.\nSpecifications and prices are illustrative for this demo.');
$('#overview-tab').onclick=$('#overview').onclick=()=>{stop();renderBike();setFold(false);};
$('[data-info="delivery"]').onclick=()=>show('Delivery','This is an interactive product demo. No orders or deliveries are processed.');
$('[data-info="contact"]').onclick=()=>show('Bikeville','A local recreation of the bicycle configurator shown in the video reference. Try different parts to build your bike.');
$('#add').onclick=()=>{items++;$('#cart-count').textContent=items;$('#status').textContent='Bike added to the demo cart.';show('Added to your cart',`IF Mode · ${$('#price').textContent}\n${parts.map((p,i)=>p+': '+names[selected[i]]).join('\n')}\nDemo only — no payment is taken.`);};
$('#cart').onclick=()=>show('Your demo cart',`${items} ${items===1?'bicycle':'bicycles'} added.\nThis demo does not process purchases.`);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){stop();renderBike();}});
reduced.addEventListener('change',()=>{stop();renderBike();});
renderBike();renderOptions();
playEntrance();
