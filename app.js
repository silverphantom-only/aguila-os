const checksBase = ["WhatsApp","Gmail","Reservas","Gasolina","Cierre","Control"];
const habitosBase = ["Respiración","Calistenia","Baño","Desayuno"];

/* DATA */
function getFecha(){ return document.getElementById("fecha").value; }

function getData(){
  return JSON.parse(localStorage.getItem("aguilaOS")) || {};
}

function saveData(data){
  localStorage.setItem("aguilaOS", JSON.stringify(data));
}

function getDia(){
  const fecha = getFecha();
  const data = getData();

  if(!data[fecha]){
    data[fecha]={
      eventos:[],
      pendientes:[],
      checks:{},
      agua:0,
      biblia:{}
    };
    saveData(data);
  }
  return data[fecha];
}

/* RENDER GENERAL */
function renderTodo(){
  renderEventos();
  renderPendientes();
  renderChecklist();
  renderHabitos();
  renderAgua();
  renderBiblia();
  renderCalendario();
  actualizarProgreso();
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

  renderEventos();
}

function toggleEvento(i){
  const data=getData();
  const dia=getDia();

  dia.eventos[i].done=!dia.eventos[i].done;

  data[getFecha()]=dia;
  saveData(data);

  renderEventos();
  actualizarProgreso();
}

function eliminarEvento(i){
  const data=getData();
  const dia=getDia();

  dia.eventos.splice(i,1);

  data[getFecha()]=dia;
  saveData(data);

  renderEventos();
}

function renderEventos(){
  const lista=document.getElementById("listaEventos");
  lista.innerHTML="";
  const dia=getDia();

  dia.eventos.forEach((e,i)=>{
    const li=document.createElement("li");
    li.innerHTML=`
      <input type="checkbox" ${e.done?"checked":""}
        onchange="toggleEvento(${i})">
      ${e.hora} - ${e.texto}
      <button onclick="eliminarEvento(${i})">X</button>
    `;
    lista.appendChild(li);
  });
}

/* PENDIENTES */
function agregarPendiente(){
  const input=document.getElementById("inputPendiente");
  if(!input.value) return;

  const data=getData();
  const dia=getDia();

  dia.pendientes.push({
    id:Date.now(),
    texto:input.value,
    done:false
  });

  data[getFecha()]=dia;
  saveData(data);

  input.value="";
  renderPendientes();
}

function togglePendiente(id){
  const data=getData();
  const dia=getDia();

  dia.pendientes=dia.pendientes.map(p=>
    p.id===id ? {...p,done:!p.done}:p
  );

  data[getFecha()]=dia;
  saveData(data);

  renderPendientes();
  actualizarProgreso();
}

function eliminarPendiente(id){
  const data=getData();
  const dia=getDia();

  dia.pendientes=dia.pendientes.filter(p=>p.id!==id);

  data[getFecha()]=dia;
  saveData(data);

  renderPendientes();
}

function renderPendientes(){
  const lista=document.getElementById("listaPendientes");
  lista.innerHTML="";
  const dia=getDia();

  dia.pendientes.forEach(p=>{
    const li=document.createElement("li");
    li.innerHTML=`
      <input type="checkbox" ${p.done?"checked":""}
      onchange="togglePendiente(${p.id})">
      <span class="${p.done?"done":""}">${p.texto}</span>
      <button onclick="eliminarPendiente(${p.id})">X</button>
    `;
    lista.appendChild(li);
  });
}

/* CHECKLIST */
function renderChecklist(){
  const cont=document.getElementById("checklist");
  cont.innerHTML="";
  const dia=getDia();

  checksBase.forEach(c=>{
    const checked=dia.checks[c]||false;

    const div=document.createElement("div");
    div.innerHTML=`
      <label>
        <input type="checkbox" ${checked?"checked":""}
        onchange="toggleCheck('${c}')"> ${c}
      </label>
    `;
    cont.appendChild(div);
  });
}

/* HABITOS */
function renderHabitos(){
  const cont=document.getElementById("habitos");
  cont.innerHTML="";
  const dia=getDia();

  habitosBase.forEach(h=>{
    const checked=dia.checks[h]||false;

    const div=document.createElement("div");
    div.innerHTML=`
      <label>
        <input type="checkbox" ${checked?"checked":""}
        onchange="toggleCheck('${h}')"> ${h}
      </label>
    `;
    cont.appendChild(div);
  });
}

function toggleCheck(nombre){
  const data=getData();
  const dia=getDia();

  dia.checks[nombre]=!dia.checks[nombre];

  data[getFecha()]=dia;
  saveData(data);

  actualizarProgreso();
}

/* AGUA */
function sumarAgua(){
  const data=getData();
  const dia=getDia();

  dia.agua+=250;

  data[getFecha()]=dia;
  saveData(data);

  renderAgua();
  actualizarProgreso();
}

function renderAgua(){
  document.getElementById("aguaTotal").innerText=getDia().agua+" ml";
}

/* BIBLIA */
function guardarBiblia(){
  const data=getData();
  const dia=getDia();

  dia.biblia={
    pasaje:document.getElementById("pasaje").value,
    nota:document.getElementById("nota").value
  };

  data[getFecha()]=dia;
  saveData(data);
}

function renderBiblia(){
  const dia=getDia();
  document.getElementById("pasaje").value=dia.biblia.pasaje||"";
  document.getElementById("nota").value=dia.biblia.nota||"";
}

/* CALENDARIO */
function renderCalendario(){
  const lista=document.getElementById("calendario");
  lista.innerHTML="";
  const data=getData();

  Object.keys(data).forEach(f=>{
    const li=document.createElement("li");
    li.innerHTML=`${f} <button onclick="irAFecha('${f}')">Ver</button>`;
    lista.appendChild(li);
  });
}

function irAFecha(f){
  document.getElementById("fecha").value=f;
  renderTodo();
}

/* PROGRESO */
function actualizarProgreso(){
  const dia=getDia();

  let progreso=0;

  // checklist
  const doneChecks=checksBase.filter(c=>dia.checks[c]).length;
  progreso+=(doneChecks/checksBase.length)*25;

  // hábitos
  const doneHab=habitosBase.filter(h=>dia.checks[h]).length;
  progreso+=(doneHab/habitosBase.length)*25;

  // pendientes
  const totalPend=dia.pendientes.length;
  const donePend=dia.pendientes.filter(p=>p.done).length;
  if(totalPend) progreso+=(donePend/totalPend)*25;

  // eventos
  const totalEv=dia.eventos.length;
  const doneEv=dia.eventos.filter(e=>e.done).length;
  if(totalEv) progreso+=(doneEv/totalEv)*15;

  // agua
  progreso+=Math.min(dia.agua/2000,1)*10;

  progreso=Math.round(progreso);

  document.getElementById("barra").style.width=progreso+"%";
  document.getElementById("porcentaje").innerText=progreso+"%";

  actualizarNivel(progreso);
}

/* NIVEL */
function actualizarNivel(p){
  const img=document.getElementById("nivelImg");
  const txt=document.getElementById("nivelTexto");

  if(p<25){
    img.src="balgham.png";
    txt.innerText="Modo Balgham";
  }else if(p<50){
    img.src="inicio.png";
    txt.innerText="Despertando";
  }else if(p<75){
    img.src="progreso.png";
    txt.innerText="En progreso";
  }else{
    img.src="aguila.png";
    txt.innerText="Águila activada";
  }
}

/* INIT */
document.getElementById("fecha").valueAsDate=new Date();
document.getElementById("fecha").addEventListener("change",renderTodo);

renderTodo();
