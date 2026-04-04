/* ============================================================
   MODO ÁGUILA — app.js v3.0
   + Estudio Bíblico con exégesis por día
   + Pendientes con checklist separado (activos / completados)
   + Agenda, notas, agua, foco, respiración
   ============================================================ */
'use strict';

const SK      = 'ma2';
const WATER_G = 2000;
const CHK_IDS = ['respiracion','calistenia','desayuno',
                 'whatsapp','gmail','reservas','gasolinas','cierre','control'];
const CIRC    = 2 * Math.PI * 65;

const ESTADOS = [
  { min:0,  max:25,  name:'SOMBRA',      img:'eagle1.png', cls:'s-sombra'    },
  { min:25, max:50,  name:'DESPERTAR',   img:'eagle2.png', cls:'s-despertar' },
  { min:50, max:75,  name:'ASCENSO',     img:'eagle3.png', cls:'s-ascenso'   },
  { min:75, max:101, name:'MODO ÁGUILA', img:'eagle4.png', cls:'s-aguila'    },
];

const RECS = [
  { ico:'☀️', txt:'Sal al sol',            sub:'10 minutos de luz solar activan la serotonina. Sal ahora.' },
  { ico:'🫁', txt:'Respira profundo',       sub:'Tres respiraciones 4-4-6. Activa tu sistema nervioso central.' },
  { ico:'🎯', txt:'Una tarea a la vez',     sub:'El multitasking reduce el rendimiento 40%. Enfócate en una sola cosa.' },
  { ico:'✅', txt:'Termina lo que empiezas',sub:'No abras nada nuevo sin cerrar lo anterior. La disciplina es terminar.' },
  { ico:'📵', txt:'Evita distracciones',    sub:'Silencia notificaciones. Los primeros 90 min del día son oro puro.' },
  { ico:'💧', txt:'Toma agua ahora',        sub:'La deshidratación leve reduce la concentración. Bebe un vaso.' },
  { ico:'🚶', txt:'Mueve el cuerpo',        sub:'Levántate 2 minutos. Tu cerebro oxigenado rinde mejor.' },
  { ico:'📖', txt:'Medita la Palabra',      sub:'Un pasaje bien meditado transforma más que mil leídos rápido.' },
  { ico:'🙏', txt:'Ora antes de actuar',    sub:'La oración alinea tu corazón antes de que tu mente decida.' },
  { ico:'⚡', txt:'Actúa sin esperar',      sub:'El águila no espera motivación. La disciplina precede al sentimiento.' },
];

/* ── Breath ── */
let breathRunning=false, breathInterval=null, breathPhaseIdx=0, breathSecLeft=0;
const BREATH_PHASES=[
  {lbl:'INHALA',secs:4,cls:'inhale'},
  {lbl:'SOSTÉN',secs:4,cls:'hold'},
  {lbl:'EXHALA',secs:6,cls:'exhale'},
];

/* ── Focus timer ── */
let focusRunning=false, focusTimer=null, focusDurSecs=10*60, focusLeft=10*60;

/* ── PWA install ── */
let installEvt=null;

/* ── Recommendations ── */
let recIdx=Math.floor(Math.random()*RECS.length);

/* ── Biblia autosave debounce ── */
let bibliaTimer=null;

/* ============================================================
   STORAGE
   ============================================================ */
const todayKey=()=>{
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const load=()=>{try{return JSON.parse(localStorage.getItem(SK)||'{}');}catch{return{};}};
const save=d=>{try{localStorage.setItem(SK,JSON.stringify(d));}catch(e){}};
const day=()=>{
  const data=load(),k=todayKey();
  if(!data[k]) data[k]={
    checks:{},foco:'',agenda:[],pending:[],notes:'',water:0,
    biblia:{pasaje:'',versiculo:'',exegesis:'',palabras:'',aplicacion:''}
  };
  /* Ensure biblia key exists for older saved days */
  if(!data[k].biblia) data[k].biblia={pasaje:'',versiculo:'',exegesis:'',palabras:'',aplicacion:''};
  return{data,k,d:data[k]};
};

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded',()=>{
  setDate();
  initFoco();
  initBiblia();
  initChecklist();
  initAgenda();
  initPending();
  initNotes();
  initWater();
  initFocusTimer();
  renderRec();
  updateProgress();

  /* Enter shortcuts */
  q('#agText')?.addEventListener('keydown',e=>e.key==='Enter'&&addAgenda());
  q('#pendText')?.addEventListener('keydown',e=>e.key==='Enter'&&addPend());
  q('#focoInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();saveFoco();}});

  /* PWA */
  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();installEvt=e;q('#installBar')?.classList.remove('hide');
  });
  window.addEventListener('appinstalled',()=>{
    q('#installBar')?.classList.add('hide');installEvt=null;toast('🦅 App instalada','ok');
  });
  q('#installBtn')?.addEventListener('click',doInstall);
  q('#installClose')?.addEventListener('click',()=>q('#installBar').classList.add('hide'));

  if('serviceWorker' in navigator)
    navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
});

/* ============================================================
   UTILS
   ============================================================ */
const q  =sel=>document.querySelector(sel);
const qa =sel=>[...document.querySelectorAll(sel)];
const esc=s=>{const d=document.createElement('div');d.textContent=s;return d.innerHTML;};
const clamp=(v,mn,mx)=>Math.max(mn,Math.min(mx,v));

function toast(msg,type='info'){
  const c=q('#toasts');if(!c)return;
  const el=document.createElement('div');
  el.className=`toast ${type}`;el.innerHTML=msg;
  c.appendChild(el);
  setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),260);},3200);
}

/* ============================================================
   DATE
   ============================================================ */
function setDate(){
  const el=q('#heroDate');if(!el)return;
  const d=new Date();
  const dias=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const meses=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  el.textContent=`${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

/* ============================================================
   PROGRESS
   ============================================================ */
function calcProgress(){
  const{d}=day();
  const chkDone =CHK_IDS.filter(id=>d.checks[id]).length;
  const chkPct  =(chkDone/CHK_IDS.length)*40;
  const waterPct=clamp(d.water/WATER_G,0,1)*15;
  const agPct   =clamp(d.agenda.length/3,0,1)*10;
  const focoPct =d.foco.trim()?10:0;
  const notesPct=d.notes.trim()?5:0;
  /* Biblia contribuye hasta 20% */
  const bib=d.biblia;
  const bibPts=(bib.pasaje?5:0)+(bib.exegesis.trim()?10:0)+(bib.aplicacion.trim()?5:0);
  return Math.round(clamp(chkPct+waterPct+agPct+focoPct+notesPct+bibPts,0,100));
}

function updateProgress(){
  const pct=calcProgress();
  const estado=ESTADOS.find(e=>pct>=e.min&&pct<e.max)||ESTADOS[3];
  const nameEl=q('#estadoName'),pctEl=q('#estadoPct'),barEl=q('#pbarFill');
  if(nameEl)nameEl.textContent=estado.name;
  if(pctEl)pctEl.textContent=pct+'%';
  if(barEl)barEl.style.width=pct+'%';
  const img=q('#eagleImg');if(img)img.src=estado.img;
  const ring=q('#eagleRing');if(ring)ring.classList.toggle('active',pct>=75);
  document.body.className=estado.cls;
}

/* ============================================================
   FOCO DEL DÍA
   ============================================================ */
function initFoco(){const{d}=day();renderFocoDisplay(d.foco);}
function renderFocoDisplay(text){
  const el=q('#focoDisplay');if(!el)return;
  if(text&&text.trim()){el.textContent=text;el.classList.remove('placeholder');}
  else{el.textContent='Sin foco definido hoy';el.classList.add('placeholder');}
}
function editFoco(){
  const{d}=day();
  const input=q('#focoInput'),saveBtn=q('#focoSaveBtn'),editBtn=q('#focoEditBtn');
  const cancelBtn=q('#focoCancelBtn'),display=q('#focoDisplay');
  input.value=d.foco||'';input.style.display='block';display.style.display='none';
  saveBtn.style.display='inline-flex';cancelBtn.style.display='inline-flex';editBtn.style.display='none';
  input.focus();
}
function cancelFoco(){
  const input=q('#focoInput'),saveBtn=q('#focoSaveBtn'),editBtn=q('#focoEditBtn');
  const cancelBtn=q('#focoCancelBtn'),display=q('#focoDisplay');
  input.style.display='none';display.style.display='';
  saveBtn.style.display='none';cancelBtn.style.display='none';editBtn.style.display='inline-flex';
}
function saveFoco(){
  const input=q('#focoInput');if(!input)return;
  const text=input.value.trim();
  const{data,k}=day();data[k].foco=text;save(data);
  renderFocoDisplay(text);cancelFoco();updateProgress();toast('🎯 Foco guardado','ok');
}

/* ============================================================
   📖 ESTUDIO BÍBLICO
   ============================================================ */
function initBiblia(){
  const{d}=day();
  const b=d.biblia;
  if(q('#bibliaPasaje'))    q('#bibliaPasaje').value=b.pasaje||'';
  if(q('#bibliaVersiculo')) q('#bibliaVersiculo').value=b.versiculo||'';
  if(q('#bibliaExegesis'))  q('#bibliaExegesis').value=b.exegesis||'';
  if(q('#bibliaPalabras'))  q('#bibliaPalabras').value=b.palabras||'';
  if(q('#bibliaAplicacion'))q('#bibliaAplicacion').value=b.aplicacion||'';
  updateBibliaBadge();
}

function autosaveBiblia(){
  clearTimeout(bibliaTimer);
  bibliaTimer=setTimeout(()=>{
    const{data,k}=day();
    data[k].biblia={
      pasaje:     q('#bibliaPasaje')?.value||'',
      versiculo:  q('#bibliaVersiculo')?.value||'',
      exegesis:   q('#bibliaExegesis')?.value||'',
      palabras:   q('#bibliaPalabras')?.value||'',
      aplicacion: q('#bibliaAplicacion')?.value||'',
    };
    save(data);
    updateBibliaBadge();
    updateProgress();
    /* Show saved indicator */
    const sv=q('#bibliaSaved');
    if(sv){sv.classList.add('show');setTimeout(()=>sv.classList.remove('show'),2000);}
  },800);
}

function updateBibliaBadge(){
  const{d}=day();
  const b=d.biblia;
  const badge=q('#bibliaBadge');
  if(!badge)return;
  if(b.pasaje){badge.textContent=b.pasaje.slice(0,18)+(b.pasaje.length>18?'…':'');}
  else{badge.textContent='—';}
}

function clearBiblia(){
  if(!confirm('¿Limpiar el estudio bíblico de hoy?'))return;
  const{data,k}=day();
  data[k].biblia={pasaje:'',versiculo:'',exegesis:'',palabras:'',aplicacion:''};
  save(data);
  initBiblia();
  updateProgress();
  toast('📖 Estudio bíblico limpiado','info');
}

/* ============================================================
   CHECKLIST
   ============================================================ */
function initChecklist(){
  const{d}=day();
  qa('.chk-row').forEach(row=>{if(d.checks[row.dataset.id])row.classList.add('done');});
  updateChkBadge();
}
function toggleChk(row){
  row.classList.toggle('done');
  const{data,k}=day();data[k].checks[row.dataset.id]=row.classList.contains('done');save(data);
  updateChkBadge();updateProgress();
  if(row.classList.contains('done')){
    row.style.transform='scale(.97)';setTimeout(()=>row.style.transform='',140);
    const done=CHK_IDS.filter(id=>data[k].checks[id]).length;
    if(done===CHK_IDS.length)setTimeout(()=>toast('🦅 ¡Checklist completo!','ok'),300);
  }
}
function updateChkBadge(){
  const{d}=day();
  const done=CHK_IDS.filter(id=>d.checks[id]).length;
  const el=q('#chkBadge');if(el)el.textContent=`${done}/${CHK_IDS.length}`;
}

/* ============================================================
   AGENDA
   ============================================================ */
function initAgenda(){
  const ti=q('#agTime');
  if(ti){const n=new Date();ti.value=`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;}
  renderAgenda();
}
function addAgenda(){
  const ti=q('#agTime'),tx=q('#agText');if(!ti||!tx)return;
  const text=tx.value.trim();if(!text){toast('⚠️ Escribe la actividad','warn');return;}
  const{data,k}=day();
  data[k].agenda.push({id:Date.now(),time:ti.value,text,done:false});
  data[k].agenda.sort((a,b)=>a.time.localeCompare(b.time));save(data);
  tx.value='';renderAgenda();updateProgress();
  saveToCalendar(k,{id:Date.now(),time:ti.value,text,done:false});
}
function deleteAgenda(id){
  const{data,k}=day();data[k].agenda=data[k].agenda.filter(i=>i.id!==id);
  save(data);renderAgenda();updateProgress();
}
function toggleAgenda(id){
  const{data,k}=day();const it=data[k].agenda.find(i=>i.id===id);
  if(it){it.done=!it.done;save(data);renderAgenda();}
}
function startEditAgenda(id){
  const row=q(`[data-agid="${id}"]`);if(!row)return;
  const{d}=day();const it=d.agenda.find(i=>i.id===id);if(!it)return;
  let er=row.querySelector('.item-edit-row');
  if(er){er.remove();return;}
  er=document.createElement('div');er.className='item-edit-row';
  er.innerHTML=`<input type="time" class="field field-time" value="${it.time}" style="width:105px;flex:none"/>
    <input type="text" class="field" value="${esc(it.text)}" placeholder="Actividad..."/>
    <button class="btn btn-gold btn-sm" onclick="saveEditAgenda(${id},this)">✓</button>`;
  row.appendChild(er);er.querySelector('input[type=text]').focus();
}
function saveEditAgenda(id,btn){
  const er=btn.closest('.item-edit-row');
  const time=er.querySelectorAll('input')[0].value;
  const text=er.querySelectorAll('input')[1].value.trim();
  if(!text){toast('⚠️ Texto vacío','warn');return;}
  const{data,k}=day();const it=data[k].agenda.find(i=>i.id===id);
  if(it){it.time=time;it.text=text;}
  data[k].agenda.sort((a,b)=>a.time.localeCompare(b.time));save(data);renderAgenda();
}
function renderAgenda(){
  const list=q('#agendaList');if(!list)return;
  const{d}=day();
  const badge=q('#agendaBadge');if(badge)badge.textContent=d.agenda.length;
  if(!d.agenda.length){list.innerHTML='<div class="empty-msg"><span class="emi">📭</span>Sin actividades hoy</div>';return;}
  list.innerHTML=d.agenda.map(it=>`
    <div class="agenda-item ${it.done?'done':''}" data-agid="${it.id}">
      <button class="item-chk" onclick="toggleAgenda(${it.id})" aria-label="${it.done?'Desmarcar':'Marcar'}">${it.done?'✓':''}</button>
      <span class="item-time">${it.time||'—'}</span>
      <span class="item-text">${esc(it.text)}</span>
      <div class="item-actions">
        <button class="ico-btn edit" onclick="startEditAgenda(${it.id})" title="Editar">✏️</button>
        <button class="ico-btn del"  onclick="deleteAgenda(${it.id})"    title="Eliminar">✕</button>
      </div>
    </div>`).join('');
}
function saveToCalendar(dateKey,ev){
  try{
    const cd=JSON.parse(localStorage.getItem('ma2_cal')||'{}');
    if(!cd[dateKey])cd[dateKey]=[];
    if(!cd[dateKey].find(e=>e.id===ev.id))cd[dateKey].push(ev);
    localStorage.setItem('ma2_cal',JSON.stringify(cd));
  }catch(e){}
}

/* ============================================================
   📌 PENDIENTES — con checklist separado activos/completados
   ============================================================ */
function initPending(){renderPending();}

function addPend(){
  const tx=q('#pendText');if(!tx)return;
  const text=tx.value.trim();if(!text){toast('⚠️ Escribe el pendiente','warn');return;}
  const{data,k}=day();
  data[k].pending.push({id:Date.now(),text,done:false});
  save(data);tx.value='';renderPending();updateProgress();
}

function togglePend(id){
  const{data,k}=day();const it=data[k].pending.find(i=>i.id===id);
  if(it){
    it.done=!it.done;save(data);renderPending();
    if(it.done)toast('✅ ¡Pendiente completado!','ok');
  }
}

function deletePend(id){
  const{data,k}=day();data[k].pending=data[k].pending.filter(i=>i.id!==id);
  save(data);renderPending();
}

function renderPending(){
  const activeList=q('#pendActiveList');
  const doneList  =q('#pendDoneList');
  const doneSection=q('#pendDoneSection');
  if(!activeList)return;

  const{d}=day();
  const active  =d.pending.filter(i=>!i.done);
  const done    =d.pending.filter(i=>i.done);
  const badge   =q('#pendBadge');
  if(badge)badge.textContent=`${active.length} pend.`;

  /* ── Activos ── */
  if(!active.length){
    activeList.innerHTML='<div class="empty-msg"><span class="emi">✨</span>Todo al día</div>';
  } else {
    activeList.innerHTML=active.map(it=>`
      <div class="pend-item" data-pid="${it.id}">
        <button class="pend-chk-btn" onclick="togglePend(${it.id})" aria-label="Marcar como hecho">
          <span class="pend-chk-inner"></span>
        </button>
        <span class="item-text">${esc(it.text)}</span>
        <button class="ico-btn del" onclick="deletePend(${it.id})" title="Eliminar">✕</button>
      </div>`).join('');
  }

  /* ── Completados ── */
  if(!done.length){
    if(doneSection)doneSection.classList.add('hidden');
  } else {
    if(doneSection)doneSection.classList.remove('hidden');
    if(doneList)doneList.innerHTML=done.map(it=>`
      <div class="pend-item pend-done" data-pid="${it.id}">
        <button class="pend-chk-btn pend-chk-done" onclick="togglePend(${it.id})" aria-label="Desmarcar">
          <span class="pend-chk-inner">✓</span>
        </button>
        <span class="item-text" style="text-decoration:line-through;color:var(--t3)">${esc(it.text)}</span>
        <button class="ico-btn del" onclick="deletePend(${it.id})" title="Eliminar">✕</button>
      </div>`).join('');
  }
}

/* ============================================================
   NOTAS
   ============================================================ */
let notesSaveTimer=null;
function initNotes(){
  const{d}=day();const ta=q('#notesArea');if(!ta)return;
  ta.value=d.notes||'';
  ta.addEventListener('input',()=>{clearTimeout(notesSaveTimer);notesSaveTimer=setTimeout(autoSaveNotes,900);});
}
function autoSaveNotes(){
  const ta=q('#notesArea');if(!ta)return;
  const{data,k}=day();data[k].notes=ta.value;save(data);
  const label=q('#notesSaved');
  if(label){label.classList.add('show');setTimeout(()=>label.classList.remove('show'),2200);}
  updateProgress();
}

/* ============================================================
   WATER
   ============================================================ */
function initWater(){const{d}=day();renderWater(d.water);}
function addWater(ml){
  const{data,k}=day();data[k].water=clamp(data[k].water+ml,0,WATER_G*1.5);
  save(data);renderWater(data[k].water);updateProgress();
  if(data[k].water>=WATER_G&&data[k].water-ml<WATER_G)toast('💧 ¡Meta de hidratación alcanzada!','ok');
}
function resetWater(){
  const{data,k}=day();data[k].water=0;save(data);renderWater(0);updateProgress();
}
function renderWater(ml){
  const pct=clamp(ml/WATER_G*100,0,100);
  const ve=q('#vesselFill'),wv=q('#waterVal'),wm=q('#waterMiniFill'),wb=q('#waterBadge');
  if(ve)ve.style.height=pct+'%';
  if(wv)wv.textContent=ml.toLocaleString('es')+' ml';
  if(wm)wm.style.width=pct+'%';
  if(wb)wb.textContent=`${ml}/${WATER_G}ml`;
}

/* ============================================================
   FOCUS TIMER
   ============================================================ */
function initFocusTimer(){renderTimer(focusLeft,focusDurSecs);}
function setDur(min,btn){
  if(focusRunning)return;
  focusDurSecs=min*60;focusLeft=focusDurSecs;renderTimer(focusLeft,focusDurSecs);
  qa('.dur-chips .chip').forEach(c=>c.classList.remove('on'));btn.classList.add('on');
}
function toggleFocus(){focusRunning?pauseFocus():startFocus();}
function startFocus(){
  if(focusLeft<=0)resetFocus();focusRunning=true;
  q('#focusToggleBtn').textContent='⏸ Pausar';
  q('#focusCard').classList.add('focus-running');
  focusTimer=setInterval(()=>{
    focusLeft--;renderTimer(focusLeft,focusDurSecs);
    if(focusLeft<=0){
      clearInterval(focusTimer);focusRunning=false;
      q('#focusToggleBtn').textContent='▶ Iniciar';
      q('#focusCard').classList.remove('focus-running');
      onFocusDone();
    }
  },1000);
}
function pauseFocus(){
  clearInterval(focusTimer);focusRunning=false;
  q('#focusToggleBtn').textContent='▶ Continuar';
  q('#focusCard').classList.remove('focus-running');
}
function resetFocus(){
  clearInterval(focusTimer);focusRunning=false;focusLeft=focusDurSecs;
  renderTimer(focusLeft,focusDurSecs);
  q('#focusToggleBtn').textContent='▶ Iniciar';
  q('#focusCard').classList.remove('focus-running');
}
function renderTimer(left,total){
  const m=Math.floor(left/60),s=left%60;
  const disp=q('#timerDisp');
  if(disp)disp.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  const ring=q('#trFill');
  if(ring){const prog=total>0?left/total:0;ring.style.strokeDasharray=CIRC;ring.style.strokeDashoffset=CIRC*(1-prog);}
  const lbl=q('#timerLbl');if(lbl)lbl.textContent=left>0?'FOCO':'¡LISTO!';
}
function onFocusDone(){
  toast('🔥 ¡Sesión completada! Descansa.','ok');
  if(Notification.permission==='granted')
    new Notification('🦅 Modo Águila',{body:'¡Sesión de foco completada!',icon:'./icons/icon-192.png'});
}

/* ============================================================
   RECOMMENDATIONS
   ============================================================ */
function renderRec(){
  const c=q('#recContainer');if(!c)return;
  const r=RECS[recIdx%RECS.length];
  c.innerHTML=`<div class="rec-card">
    <div class="rec-ico">${r.ico}</div>
    <div class="rec-content">
      <div class="rec-label">Acción recomendada</div>
      <div class="rec-text">${r.txt}</div>
      <div class="rec-sub">${r.sub}</div>
    </div></div>`;
}
function nextRec(){recIdx=(recIdx+1)%RECS.length;renderRec();}

/* ============================================================
   RESPIRACIÓN
   ============================================================ */
function toggleBreath(){breathRunning?stopBreath():startBreath();}
function startBreath(){
  breathRunning=true;breathPhaseIdx=0;
  q('#breathBtn').textContent='⏹ Detener';
  q('#breathCircle').classList.remove('hidden');
  runBreathPhase();
}
function stopBreath(){
  breathRunning=false;clearInterval(breathInterval);
  q('#breathBtn').textContent='▶ Iniciar guía';
  q('#breathCircle').classList.add('hidden');
}
function runBreathPhase(){
  if(!breathRunning)return;
  const ph=BREATH_PHASES[breathPhaseIdx];breathSecLeft=ph.secs;
  const circle=q('#breathCircle'),phase=q('#breathPhase'),count=q('#breathCount');
  if(circle){circle.className='breath-anim '+ph.cls;}
  if(phase)phase.textContent=ph.lbl;
  if(count)count.textContent=ph.secs;
  clearInterval(breathInterval);
  breathInterval=setInterval(()=>{
    breathSecLeft--;if(count)count.textContent=breathSecLeft;
    if(breathSecLeft<=0){
      clearInterval(breathInterval);
      breathPhaseIdx=(breathPhaseIdx+1)%BREATH_PHASES.length;
      if(breathRunning)runBreathPhase();
    }
  },1000);
}

/* ============================================================
   PWA INSTALL
   ============================================================ */
function doInstall(){
  if(!installEvt)return;
  installEvt.prompt();
  installEvt.userChoice.then(r=>{if(r.outcome==='accepted')toast('🦅 Instalando...','ok');installEvt=null;});
}

/* ── Expose globals ── */
Object.assign(window,{
  toggleChk,
  addAgenda,deleteAgenda,toggleAgenda,startEditAgenda,saveEditAgenda,
  addPend,togglePend,deletePend,
  addWater,resetWater,
  setDur,toggleFocus,resetFocus,
  saveFoco,editFoco,cancelFoco,
  autosaveBiblia,clearBiblia,
  nextRec,toggleBreath,doInstall
});
