'use strict';

const CAL_SK  = 'ma2_cal';
const MAIN_SK = 'ma2';
const MONTHS  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DOWS    = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const DAYS_FULL = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

let navDate = new Date();
let selKey  = null;
let weekOff = 0;
let curView = 'mes';

const loadCal  = () => { try{ return JSON.parse(localStorage.getItem(CAL_SK)||'{}'); }catch{ return {}; } };
const saveCal  = d => { try{ localStorage.setItem(CAL_SK,JSON.stringify(d)); }catch(e){} };
const loadMain = () => { try{ return JSON.parse(localStorage.getItem(MAIN_SK)||'{}'); }catch{ return {}; } };

function todayKey(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function dKey(y,m,d){ return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }

function getEventsForKey(key){
  const calData=loadCal(), mainData=loadMain();
  const calEvs =(calData[key]||[]);
  const mainEvs=(mainData[key]?.agenda||[]).map(e=>({...e,_main:true}));
  const merged =[...calEvs];
  for(const me of mainEvs){ if(!merged.find(e=>e.id===me.id)) merged.push(me); }
  return merged.sort((a,b)=>(a.time||'').localeCompare(b.time||''));
}
function hasEvents(key){ return getEventsForKey(key).length>0; }

document.addEventListener('DOMContentLoaded',()=>{
  navDate=new Date(); selKey=todayKey();
  renderMes(); renderSemana(); openDay(selKey);
  q('#evText')?.addEventListener('keydown', e=> e.key==='Enter' && addCalEv());
  if('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
});

const q  = sel => document.querySelector(sel);
const esc = s => { const d=document.createElement('div'); d.textContent=s; return d.innerHTML; };

function toast(msg,type='info'){
  const c=q('#toasts'); if(!c) return;
  const el=document.createElement('div'); el.className=`toast ${type}`; el.textContent=msg;
  c.appendChild(el);
  setTimeout(()=>{ el.classList.add('out'); setTimeout(()=>el.remove(),260); },3000);
}

function setView(v){
  curView=v;
  q('#mesView')?.classList.toggle('hidden',v!=='mes');
  q('#semanaView')?.classList.toggle('hidden',v!=='semana');
  document.querySelectorAll('.vtab').forEach(b=>b.classList.remove('on'));
  if(v==='mes')    q('#vMes')?.classList.add('on');
  if(v==='semana') q('#vSemana')?.classList.add('on');
  if(v==='semana') renderSemana();
}
function goToday(){
  navDate=new Date(); weekOff=0; selKey=todayKey();
  renderMes(); renderSemana(); openDay(selKey); toast('📌 Hoy','info');
}

function prevMonth(){ navDate=new Date(navDate.getFullYear(),navDate.getMonth()-1,1); renderMes(); }
function nextMonth(){ navDate=new Date(navDate.getFullYear(),navDate.getMonth()+1,1); renderMes(); }

function renderMes(){
  const Y=navDate.getFullYear(),M=navDate.getMonth(),today=new Date();
  const title=q('#calTitle'); if(title) title.textContent=`${MONTHS[M]} ${Y}`;
  let startDow=new Date(Y,M,1).getDay();
  startDow=startDow===0?6:startDow-1;
  const daysInMonth=new Date(Y,M+1,0).getDate();
  const daysInPrev =new Date(Y,M,0).getDate();
  const grid=q('#calGrid'); if(!grid) return;
  let html='';
  for(let i=startDow-1;i>=0;i--){
    const d2=daysInPrev-i, k=dKey(Y,M-1,d2);
    html+=`<div class="cal-cell other${hasEvents(k)?' has':''}" onclick="selectDay(${Y},${M-1},${d2})">${d2}</div>`;
  }
  for(let d2=1;d2<=daysInMonth;d2++){
    const k=dKey(Y,M,d2);
    const isToday=(Y===today.getFullYear()&&M===today.getMonth()&&d2===today.getDate());
    const isSel=(k===selKey);
    const cls=[isToday?'today':'',isSel?'sel':'',hasEvents(k)?'has':''].filter(Boolean).join(' ');
    html+=`<div class="cal-cell ${cls}" onclick="selectDay(${Y},${M},${d2})">${d2}</div>`;
  }
  const total=startDow+daysInMonth;
  const fill=total%7===0?0:7-(total%7);
  for(let d2=1;d2<=fill;d2++){
    const k=dKey(Y,M+1,d2);
    html+=`<div class="cal-cell other${hasEvents(k)?' has':''}" onclick="selectDay(${Y},${M+1},${d2})">${d2}</div>`;
  }
  grid.innerHTML=html;
}

function selectDay(Y,M,D){
  const real=new Date(Y,M,D);
  const rY=real.getFullYear(),rM=real.getMonth(),rD=real.getDate();
  selKey=dKey(rY,rM,rD);
  if(rM!==navDate.getMonth()||rY!==navDate.getFullYear()) navDate=new Date(rY,rM,1);
  renderMes(); openDay(selKey);
  q('#dayPanel')?.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function prevWeek(){ weekOff--; renderSemana(); }
function nextWeek(){ weekOff++; renderSemana(); }

function renderSemana(){
  const today=new Date();
  const dow=today.getDay()===0?6:today.getDay()-1;
  const mon=new Date(today); mon.setDate(today.getDate()-dow+weekOff*7);
  const sun=new Date(mon);   sun.setDate(mon.getDate()+6);
  const fmt=d=>`${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)}`;
  const title=q('#semTitle'); if(title) title.textContent=`${fmt(mon)} – ${fmt(sun)} ${sun.getFullYear()}`;
  const grid=q('#semGrid'); if(!grid) return;
  let html='';
  for(let i=0;i<7;i++){
    const d=new Date(mon); d.setDate(mon.getDate()+i);
    const Y=d.getFullYear(),M=d.getMonth(),D=d.getDate(),k=dKey(Y,M,D);
    const isToday=d.toDateString()===today.toDateString(),isSel=k===selKey;
    const evs=getEventsForKey(k);
    const chips=evs.slice(0,3).map(e=>`<span class="week-chip">${e.time?e.time+' ':''}${esc(e.text.slice(0,16))}${e.text.length>16?'…':''}</span>`).join('');
    const more=evs.length>3?`<span class="week-chip" style="opacity:.55">+${evs.length-3}</span>`:'';
    html+=`<div class="week-row${isToday?' today':''}${isSel?' sel':''}" onclick="selectDay(${Y},${M},${D})">
      <div class="week-row-meta">
        <div class="week-row-dow">${DOWS[i]}</div>
        <div class="week-row-d">${D}</div>
      </div>
      <div class="week-row-evs">${evs.length?chips+more:'<span class="no-evs">Sin eventos</span>'}</div>
    </div>`;
  }
  grid.innerHTML=html;
}

function openDay(key){
  const panel=q('#dayPanel'); if(!panel) return;
  panel.classList.remove('hidden');
  const [Y,M,D]=key.split('-').map(Number);
  const date=new Date(Y,M-1,D);
  const title=q('#dayPanelTitle');
  if(title) title.textContent=`${DAYS_FULL[date.getDay()]}, ${D} de ${MONTHS[M-1]} ${Y}`;
  const ti=q('#evTime');
  if(ti){
    if(key===todayKey()){ const n=new Date(); ti.value=`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`; }
    else ti.value='09:00';
  }
  renderDayEvList(key);
}

function renderDayEvList(key){
  const list=q('#dayEvList'); if(!list) return;
  const evs=getEventsForKey(key);
  if(!evs.length){ list.innerHTML='<div class="empty-msg" style="padding:12px 0"><span class="emi" style="font-size:1.4rem">📭</span>Sin eventos</div>'; return; }
  list.innerHTML=evs.map(ev=>`
    <div class="day-ev${ev.done?' done':''}" data-evid="${ev.id}">
      <button class="day-ev-chk" onclick="toggleCalEv('${key}',${ev.id})">${ev.done?'✓':''}</button>
      <span class="day-ev-time">${ev.time||'—'}</span>
      <span class="day-ev-text">${esc(ev.text)}</span>
      ${ev._main
        ?'<span style="font-size:.68rem;color:var(--t3);flex-shrink:0">agenda</span>'
        :`<button class="ico-btn del" onclick="deleteCalEv('${key}',${ev.id})">✕</button>`}
    </div>`).join('');
}

function addCalEv(){
  if(!selKey){ toast('⚠️ Selecciona un día','warn'); return; }
  const ti=q('#evTime'),tx=q('#evText'); if(!ti||!tx) return;
  const text=tx.value.trim(); if(!text){ toast('⚠️ Escribe una descripción','warn'); return; }
  const data=loadCal();
  if(!data[selKey]) data[selKey]=[];
  data[selKey].push({ id:Date.now(), time:ti.value, text, done:false });
  data[selKey].sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  saveCal(data); tx.value='';
  renderDayEvList(selKey); renderMes();
  if(curView==='semana') renderSemana();
  toast('✅ Evento guardado','ok');
}
function toggleCalEv(key,id){
  const data=loadCal(); const ev=data[key]?.find(e=>e.id===id);
  if(ev){ ev.done=!ev.done; saveCal(data); renderDayEvList(key); if(ev.done) toast('✅ Completado','ok'); }
}
function deleteCalEv(key,id){
  const data=loadCal(); if(!data[key]) return;
  data[key]=data[key].filter(e=>e.id!==id);
  if(!data[key].length) delete data[key];
  saveCal(data); renderDayEvList(key); renderMes();
  if(curView==='semana') renderSemana();
  toast('🗑️ Evento eliminado','info');
}

Object.assign(window,{
  setView,goToday,prevMonth,nextMonth,prevWeek,nextWeek,
  selectDay,addCalEv,toggleCalEv,deleteCalEv
});
