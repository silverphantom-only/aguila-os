const checksBase=["WhatsApp","Gmail","Reservas","Gasolina","Cierre","Control"];
const habitosBase=["Respiración","Calistenia","Baño","Desayuno"];

const getFecha=()=>document.getElementById("fecha").value;
const getData=()=>JSON.parse(localStorage.getItem("aguilaOS"))||{};
const saveData=(d)=>localStorage.setItem("aguilaOS",JSON.stringify(d));

function getDia(fecha=getFecha()){
  const data=getData();
  if(!data[fecha]){
    data[fecha]={eventos:[],pendientes:[],checks:{},agua:0,biblia:{}};
    saveData(data);
  }
  return data[fecha];
}

/* INIT */
function init(){
  document.getElementById("fecha").valueAsDate=new Date();

  document.getElementById("btnEvento").onclick=agregarEvento;
  document.getElementById("btnPendiente").onclick=agregarPendiente;
  document.getElementById("btnAgua").onclick=sumarAgua;
  document.getElementById("btnBiblia").onclick=guardarBiblia;

  document.getElementById("fecha").addEventListener("change",renderTodo);

  renderTodo();
}

/* EVENTOS */
function agregarEvento(){
  const hora=document.getElementById("horaEvento").value;
  const texto=document.getElementById("textoEvento").value;
  if(!texto) return;

  const data=getData();
  const dia=getDia();

  dia.eventos.push({hora,texto,done:false});
  data[getFecha()]=dia;
  saveData(data);

  renderTodo();
}

/* PENDIENTES */
function agregarPendiente(){
  const texto=document.getElementById("inputPendiente").value;
  const fecha=document.getElementById("fechaPendiente").value||getFecha();

  if(!texto) return;

  const data=getData();
  const dia=getDia(fecha);

  dia.pendientes.push({id:Date.now(),texto,done:false});
  data[fecha]=dia;
  saveData(data);

  renderTodo();
}

/* CALENDARIO */
function renderCalendar(){
  const calendar=document.getElementById("calendar");
  calendar.innerHTML="";

  const f=new Date(getFecha());
  const y=f.getFullYear();
  const m=f.getMonth();

  const first=new Date(y,m,1).getDay();
  const total=new Date(y,m+1,0).getDate();

  const data=getData();

  for(let i=0;i<first;i++){
    calendar.appendChild(document.createElement("div"));
  }

  for(let d=1;d<=total;d++){
    const fecha=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const div=document.createElement("div");
    div.classList.add("day");

    if(data[fecha]){
      const p=calcularProgresoDia(data[fecha]);

      if(p<40) div.classList.add("low");
      else if(p<70) div.classList.add("mid");
      else div.classList.add("high");

      div.innerHTML=`${d}<br>${p}%`;
    }else{
      div.innerText=d;
    }

    if(fecha===getFecha()) div.classList.add("today");

    div.onclick=()=>{
      document.getElementById("fecha").value=fecha;
      renderTodo();
    };

    calendar.appendChild(div);
  }
}

/* CHECKS */
function renderChecklist(){
  const cont=document.getElementById("checklist");
  cont.innerHTML="";
  const dia=getDia();

  checksBase.forEach(c=>{
    const div=document.createElement("div");
    div.innerHTML=`<input type="checkbox" ${dia.checks[c]?"checked":""} onclick="toggleCheck('${c}')"> ${c}`;
    cont.appendChild(div);
  });
}

function renderHabitos(){
  const cont=document.getElementById("habitos");
  cont.innerHTML="";
  const dia=getDia();

  habitosBase.forEach(h=>{
    const div=document.createElement("div");
    div.innerHTML=`<input type="checkbox" ${dia.checks[h]?"checked":""} onclick="toggleCheck('${h}')"> ${h}`;
    cont.appendChild(div);
  });
}

function toggleCheck(nombre){
  const data=getData();
  const dia=getDia();

  dia.checks[nombre]=!dia.checks[nombre];
  data[getFecha()]=dia;
  saveData(data);

  renderTodo();
}

/* PROGRESO */
function calcularProgresoDia(dia){
  let p=0;

  p+=(checksBase.filter(c=>dia.checks[c]).length/checksBase.length)*30;
  p+=(habitosBase.filter(c=>dia.checks[c]).length/habitosBase.length)*30;

  const total=dia.pendientes.length;
  const done=dia.pendientes.filter(p=>p.done).length;
  if(total) p+=(done/total)*40;

  return Math.round(p);
}

function actualizarProgreso(){
  const p=calcularProgresoDia(getDia());

  document.getElementById("barra").style.width=p+"%";
  document.getElementById("porcentaje").innerText=p+"%";
  document.getElementById("estadoDia").innerText=p<40?"⚠️ Bajo":p<70?"⚡ Medio":"🦅 Águila";

  document.getElementById("nivelImg").src=p<40?"balgham.png":p<70?"progreso.png":"aguila.png";
}

/* STREAK */
function calcularStreak(){
  const data=getData();
  const fechas=Object.keys(data).sort();

  let streak=0;

  for(let i=fechas.length-1;i>=0;i--){
    if(calcularProgresoDia(data[fechas[i]])>=70) streak++;
    else break;
  }

  document.getElementById("streak").innerText="🔥 Racha: "+streak;
}

/* EXTRA */
function renderPendientes(){
  const lista=document.getElementById("listaPendientes");
  lista.innerHTML="";
  const dia=getDia();

  dia.pendientes.forEach(p=>{
    const li=document.createElement("li");
    li.innerHTML=`<input type="checkbox" ${p.done?"checked":""} onclick="togglePendiente(${p.id})"> ${p.texto}`;
    lista.appendChild(li);
  });
}

function togglePendiente(id){
  const data=getData();
  const dia=getDia();

  dia.pendientes=dia.pendientes.map(p=>p.id===id?{...p,done:!p.done}:p);
  data[getFecha()]=dia;
  saveData(data);

  renderTodo();
}

function renderEventos(){}
function renderAgua(){ document.getElementById("aguaTotal").innerText=getDia().agua+" ml"; }
function renderBiblia(){}
function sumarAgua(){ const d=getDia(); d.agua+=250; const data=getData(); data[getFecha()]=d; saveData(data); renderTodo();}
function guardarBiblia(){}

/* START */
init();
