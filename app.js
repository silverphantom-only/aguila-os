const timeline = document.getElementById("timeline");
const pendientesDiv = document.getElementById("pendientes");
const fechaEl = document.getElementById("fecha");

let currentDate = new Date();

/* FECHA LOCAL */
function getDia() {
let d = new Date(currentDate);
return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function getKey(date){
return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

/* DATA */
function getData() {
try {
return JSON.parse(localStorage.getItem("aguilaOS")) || {};
} catch {
localStorage.clear();
return {};
}
}

function saveData(data) {
localStorage.setItem("aguilaOS", JSON.stringify(data));
}

/* DIA CON TAREAS AUTOMATICAS */
function getDiaData() {
let data = getData();
let dia = getDia();

if (!data[dia]) {

let fecha = new Date(currentDate);
let diaSemana = fecha.getDay();

/* PERSONALES */
let personales = ["Baño","Fluoxetina"];

/* TRABAJO */
let trabajo = [
"Revisar cierres día anterior",
"Revisar consumo de gasolinas",
"Revisar WhatsApp",
"Revisar Gmail",
"Seguimiento a clientes",
"Llevar redes sociales",
"Actualizar página web",
"Reservar pendientes",
"Revisar cuentas por cobrar"
];

let tareasBase = (diaSemana === 0)
? personales
: [...personales, ...trabajo];

data[dia] = {
pendientes: tareasBase.map(t => ({texto:t, done:false})),
eventos: [],
agua: 0,
disciplina: {respiracion:false, calistenia:false, baño:false},
biblia: {reflexion:""},
progreso: 0
};

saveData(data);
}

return data[dia];
}

/* RENDER */
function render() {
fechaEl.innerText = getDia();
renderEventos();
renderPendientes();
renderDisciplina();
renderAgua();
actualizarProgreso();
renderMision();
renderCalendar();
renderGrafica();
renderBiblia();
}

/* EVENTOS */
function renderEventos() {
timeline.innerHTML = "";
let data = getData();
let dia = getDia();

(data[dia].eventos || []).sort((a,b)=>a.hora.localeCompare(b.hora))
.forEach((ev,i)=>{
let div=document.createElement("div");
div.className="evento";

let cb=document.createElement("input");
cb.type="checkbox";
cb.checked=ev.done;

cb.onchange=()=>{
data[dia].eventos[i].done = cb.checked;
saveData(data);
render();
};

let span=document.createElement("span");
span.innerText=ev.hora+" - "+ev.texto;
if(ev.done) span.classList.add("done");

let del=document.createElement("button");
del.innerText="X";
del.onclick=()=>{
data[dia].eventos.splice(i,1);
saveData(data);
render();
};

div.append(cb,span,del);
timeline.appendChild(div);
});
}

/* PENDIENTES */
function renderPendientes() {
pendientesDiv.innerHTML="";
let data = getData();
let dia = getDia();

(data[dia].pendientes || []).forEach((p,i)=>{
let div=document.createElement("div");
div.className="pendiente";

let cb=document.createElement("input");
cb.type="checkbox";
cb.checked=p.done;

cb.onchange=()=>{
data[dia].pendientes[i].done = cb.checked;
saveData(data);
render();
};

let span=document.createElement("span");
span.innerText=p.texto;
if(p.done) span.classList.add("done");

let del=document.createElement("button");
del.innerText="X";
del.onclick=()=>{
data[dia].pendientes.splice(i,1);
saveData(data);
render();
};

div.append(cb,span,del);
pendientesDiv.appendChild(div);
});
}

/* DISCIPLINA */
function renderDisciplina(){
let data=getData();
let dia=getDia();

["respiracion","calistenia","baño"].forEach(id=>{
let el=document.getElementById(id);
el.checked=data[dia].disciplina[id];

el.onchange=()=>{
data[dia].disciplina[id]=el.checked;
saveData(data);
render();
};
});
}

/* AGUA */
function renderAgua(){
let d=getDiaData();
document.getElementById("agua").innerText=d.agua+" ml";
}

document.getElementById("addAgua").onclick=()=>{
let data=getData();
let dia=getDia();

data[dia].agua+=250;
if(data[dia].agua>2000) data[dia].agua=2000;

saveData(data);
render();
};

/* PROGRESO */
function actualizarProgreso(){
let d=getDiaData();

let total=0, done=0;

d.pendientes.forEach(p=>{total++; if(p.done) done++;});
d.eventos.forEach(e=>{total++; if(e.done) done++;});
Object.values(d.disciplina).forEach(v=>{total++; if(v) done++;});

total++;
if(d.agua>=2000) done++;

let prog=Math.round((done/total)*100)||0;
d.progreso=prog;

document.getElementById("progressBar").style.width=prog+"%";
document.getElementById("porcentaje").innerText=prog+"%";

let data=getData();
data[getDia()]=d;
saveData(data);
}

/* MISION */
function renderMision(){
let d=getDiaData();
let p=d.pendientes.find(p=>!p.done);

let mision=p?p.texto:"Todo completado ✔️";

document.getElementById("mision").innerText=mision;

document.getElementById("completeMission").onclick=()=>{
let data=getData();
let dia=getDia();

let pendiente=data[dia].pendientes.find(x=>!x.done);
if(pendiente) pendiente.done=true;

saveData(data);
render();
};
}

/* CALENDARIO */
function renderCalendar(){
let cal=document.getElementById("calendar");
cal.innerHTML="";
let data=getData();

let y=currentDate.getFullYear();
let m=currentDate.getMonth();
let days=new Date(y,m+1,0).getDate();

for(let i=1;i<=days;i++){
let d=new Date(y,m,i);
let key=getKey(d);

let prog=data[key]?.progreso;

let day=document.createElement("div");
day.className="day";
day.innerText=i;

if(prog!==undefined){
if(prog<40) day.classList.add("rojo");
else if(prog<80) day.classList.add("amarillo");
else day.classList.add("verde");
}else{
day.style.background="#2a2d36";
}

day.onclick=()=>{
currentDate=d;
render();
};

cal.appendChild(day);
}
}

/* GRAFICA */
function renderGrafica(){
let c=document.getElementById("grafica");
let ctx=c.getContext("2d");
ctx.clearRect(0,0,c.width,c.height);

let data=getData();

for(let i=0;i<7;i++){
let d=new Date(currentDate);
d.setDate(d.getDate()-i);

let val=data[getKey(d)]?.progreso||0;

ctx.fillStyle="lime";
ctx.fillRect(40*i,150-val,20,val);
}
}

/* BIBLIA */
function renderBiblia(){
let base=["Génesis 1","Génesis 2","Génesis 3","Génesis 4","Génesis 5"];
let index=Math.floor((new Date(getDia())-new Date("2026-01-01"))/86400000)%base.length;

document.getElementById("pasaje").innerText=base[index];

let d=getDiaData();
let ref=document.getElementById("reflexion");

ref.value=d.biblia.reflexion;

ref.oninput=()=>{
let data=getData();
data[getDia()].biblia.reflexion=ref.value;
saveData(data);
};
}

/* AGREGAR */
document.getElementById("addEvento").onclick=()=>{
let h=document.getElementById("hora");
let t=document.getElementById("eventoTexto");

if(!h.value||!t.value) return;

let data=getData();
let dia=getDia();

data[dia].eventos.push({hora:h.value,texto:t.value,done:false});

h.value="";
t.value="";

saveData(data);
render();
};

document.getElementById("addPendiente").onclick=()=>{
let i=document.getElementById("nuevoPendiente");

if(!i.value) return;

let data=getData();
let dia=getDia();

data[dia].pendientes.push({texto:i.value,done:false});

i.value="";

saveData(data);
render();
};

/* NAV */
document.getElementById("prevDay").onclick=()=>{
currentDate.setDate(currentDate.getDate()-1);
render();
};

document.getElementById("nextDay").onclick=()=>{
currentDate.setDate(currentDate.getDate()+1);
render();
};

render();
