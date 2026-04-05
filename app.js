const timeline = document.getElementById("timeline");
const pendientesDiv = document.getElementById("pendientes");
const fechaEl = document.getElementById("fecha");

let currentDate = new Date();

function getDia() {
return currentDate.toISOString().split("T")[0];
}

function getData() {
return JSON.parse(localStorage.getItem("aguilaOS") || "{}");
}

function saveData(data) {
localStorage.setItem("aguilaOS", JSON.stringify(data));
}

function getDiaData() {
let data = getData();
let dia = getDia();

if (!data[dia]) {
data[dia] = {
pendientes: [],
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

function renderEventos() {
timeline.innerHTML = "";
let d = getDiaData();

for (let h = 6; h <= 22; h++) {
let hour = String(h).padStart(2, "0") + ":00";

let div = document.createElement("div");

let ev = d.eventos.find(e => e.hora.startsWith(hour.substring(0,2)));

div.innerText = ev ? hour + " - " + ev.texto : hour;

timeline.appendChild(div);
}
}

function renderPendientes() {
pendientesDiv.innerHTML="";
let d = getDiaData();

d.pendientes.forEach((p,i)=>{
let div = document.createElement("div");
div.className="pendiente";

let cb = document.createElement("input");
cb.type="checkbox";
cb.checked=p.done;

cb.onchange=()=>{
p.done=!p.done;
saveData(getData());
render();
};

let span = document.createElement("span");
span.innerText=p.texto;
if(p.done) span.classList.add("done");

let del = document.createElement("button");
del.innerText="X";
del.onclick=()=>{
d.pendientes.splice(i,1);
saveData(getData());
render();
};

div.append(cb,span,del);
pendientesDiv.appendChild(div);
});
}

function renderDisciplina(){
let d=getDiaData();

["respiracion","calistenia","baño"].forEach(id=>{
let el=document.getElementById(id);
el.checked=d.disciplina[id];

el.onchange=()=>{
d.disciplina[id]=el.checked;
saveData(getData());
render();
};
});
}

function renderAgua(){
let d=getDiaData();
document.getElementById("agua").innerText=d.agua+" ml";
}

document.getElementById("addAgua").onclick=()=>{
let data=getData();
let dia=getDia();
data[dia].agua+=250;
saveData(data);
render();
};

function actualizarProgreso(){
let d=getDiaData();

let total=0, done=0;

d.pendientes.forEach(p=>{
total++;
if(p.done) done++;
});

Object.values(d.disciplina).forEach(v=>{
total++;
if(v) done++;
});

total++;
if(d.agua>=2000) done++;

let prog=Math.round((done/total)*100);
if(isNaN(prog)) prog=0;

d.progreso=prog;

document.getElementById("progressBar").style.width=prog+"%";
document.getElementById("porcentaje").innerText=prog+"%";

saveData(getData());
}

function renderMision(){
let d=getDiaData();
let mision="";
let discPendiente=null;

let p=d.pendientes.find(p=>!p.done);

if(p){
mision=p.texto;
}else{
let disc=Object.entries(d.disciplina).find(([k,v])=>!v);
if(disc){
mision=disc[0];
discPendiente=disc[0];
}else{
mision="Todo completado ✔️";
}
}

document.getElementById("mision").innerText=mision;

document.getElementById("completeMission").onclick=()=>{
if(p){
p.done=true;
}else if(discPendiente){
d.disciplina[discPendiente]=true;
}
saveData(getData());
render();
};
}

function renderCalendar(){
let cal=document.getElementById("calendar");
cal.innerHTML="";
let data=getData();

for(let i=1;i<=30;i++){
let d=new Date(currentDate.getFullYear(),currentDate.getMonth(),i);
let key=d.toISOString().split("T")[0];

let prog=data[key]?.progreso||0;

let day=document.createElement("div");
day.className="day";

if(prog<40) day.classList.add("rojo");
else if(prog<80) day.classList.add("amarillo");
else day.classList.add("verde");

day.innerText=i;

day.onclick=()=>{
currentDate=d;
render();
};

cal.appendChild(day);
}
}

function renderGrafica(){
let canvas=document.getElementById("grafica");
let ctx=canvas.getContext("2d");

ctx.clearRect(0,0,canvas.width,canvas.height);

let data=getData();

for(let i=0;i<7;i++){
let d=new Date(currentDate);
d.setDate(d.getDate()-i);

let key=d.toISOString().split("T")[0];
let val=data[key]?.progreso||0;

ctx.fillStyle="lime";
ctx.fillRect(40*i,150-val,20,val);
}
}

function renderBiblia(){
let base=["Génesis 1","Génesis 2","Génesis 3","Génesis 4","Génesis 5"];

let index=Math.floor((new Date(getDia())-new Date("2026-01-01"))/86400000)%base.length;

document.getElementById("pasaje").innerText=base[index];

let d=getDiaData();
let ref=document.getElementById("reflexion");

ref.value=d.biblia.reflexion;

ref.oninput=()=>{
d.biblia.reflexion=ref.value;
saveData(getData());
};
}

document.getElementById("addEvento").onclick=()=>{
let hora=document.getElementById("hora").value;
let texto=document.getElementById("eventoTexto").value;

if(!hora||!texto) return;

let data=getData();
let dia=getDia();

data[dia].eventos.push({hora,texto});

saveData(data);
render();
};

document.getElementById("addPendiente").onclick=()=>{
let txt=document.getElementById("nuevoPendiente").value;

if(!txt) return;

let data=getData();
let dia=getDia();

data[dia].pendientes.push({texto:txt,done:false});

saveData(data);
render();
};

document.getElementById("prevDay").onclick=()=>{
currentDate.setDate(currentDate.getDate()-1);
render();
};

document.getElementById("nextDay").onclick=()=>{
currentDate.setDate(currentDate.getDate()+1);
render();
};

render();
