const checks = ["WhatsApp","Gmail","Reservas","Gasolina","Cierre","Control"];

/* STORAGE */
function getData(){
  return JSON.parse(localStorage.getItem("aguila"))||{};
}
function saveData(d){
  localStorage.setItem("aguila",JSON.stringify(d));
}
function getFecha(){
  return document.getElementById("fecha").value;
}
function getDia(){
  const data=getData();
  const f=getFecha();

  if(!data[f]){
    data[f]={eventos:[],pendientes:[],checks:{},agua:0,disciplina:{},biblia:{}};
    saveData(data);
  }

  return data[f];
}

/* NAV */
function go(id){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* EVENTOS */
function addEvento(){
  const dia=getDia();
  dia.eventos.push({
    hora:hora.value,
    texto:eventoTexto.value
  });
  save();
}
function renderAgenda(){
  const ul=document.getElementById("listaEventos");
  ul.innerHTML="";
  getDia().eventos.sort((a,b)=>a.hora.localeCompare(b.hora)).forEach(e=>{
    let li=document.createElement("li");
    li.innerText=e.hora+" "+e.texto;
    ul.appendChild(li);
  });
}

/* PENDIENTES */
function addPendiente(){
  const dia=getDia();
  dia.pendientes.push({texto:pendienteTexto.value,done:false});
  save();
}
function renderPendientes(){
  const ul=document.getElementById("listaPendientes");
  ul.innerHTML="";
  getDia().pendientes.forEach((p,i)=>{
    let li=document.createElement("li");
    li.innerHTML=`<input type="checkbox" ${p.done?"checked":""} onclick="togglePendiente(${i})">${p.texto}`;
    ul.appendChild(li);
  });
}
function togglePendiente(i){
  let dia=getDia();
  dia.pendientes[i].done=!dia.pendientes[i].done;
  save();
}

/* CHECKS */
function renderChecks(){
  const cont=document.getElementById("checks");
  cont.innerHTML="";
  let dia=getDia();

  checks.forEach(c=>{
    cont.innerHTML+=`<label><input type="checkbox" ${dia.checks[c]?"checked":""} onchange="toggleCheck('${c}')"> ${c}</label>`;
  });
}
function toggleCheck(c){
  let dia=getDia();
  dia.checks[c]=!dia.checks[c];
  save();
}

/* DISCIPLINA */
function toggleDisc(t){
  let dia=getDia();
  dia.disciplina[t]=!dia.disciplina[t];
  save();
}

function sumarAgua(){
  let dia=getDia();
  dia.agua+=250;
  save();
}

/* PROGRESO */
function actualizarProgreso(){
  let dia=getDia();

  let total=checks.length + dia.pendientes.length + 4 + 1;
  let done=0;

  checks.forEach(c=>{ if(dia.checks[c]) done++; });
  dia.pendientes.forEach(p=>{ if(p.done) done++; });
  if(dia.agua>=2000) done++;

  if(dia.disciplina.resp) done++;
  if(dia.disciplina.ejercicio) done++;
  if(dia.disciplina.pastilla) done++;

  let p = Math.round((done/total)*100);

  porcentaje.innerText=p+"%";
  barra.style.width=p+"%";

  estado.innerText =
    p<25?"BALGHAM":
    p<50?"MEDIO":
    p<75?"ASCENSO":"ÁGUILA";
}

/* SAVE */
function save(){
  let data=getData();
  data[getFecha()]=getDia();
  saveData(data);
  renderTodo();
}

/* MAIN */
function renderTodo(){
  renderAgenda();
  renderPendientes();
  renderChecks();
  actualizarProgreso();
  agua.innerText=getDia().agua+" ml";
}

/* INIT */
fecha.valueAsDate=new Date();
fecha.addEventListener("change",renderTodo);

renderTodo();
