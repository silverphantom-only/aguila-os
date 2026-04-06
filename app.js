let currentDate = new Date();

/* FECHA */
function getDia(){
let d = new Date(currentDate);
return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function getKey(d){
let fecha = new Date(d);
return `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,"0")}-${String(fecha.getDate()).padStart(2,"0")}`;
}

/* DATA */
function getData(){
try{
return JSON.parse(localStorage.getItem("aguilaOS")) || {};
}catch{
localStorage.clear();
return {};
}
}

function saveData(d){
localStorage.setItem("aguilaOS", JSON.stringify(d));
}

/* CREACIÓN AUTOMÁTICA */
function getDiaData(){
let data = getData();
let dia = getDia();
let f = new Date(currentDate);
let w = f.getDay();

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

let base = (w === 0) ? personales : [...personales, ...trabajo];

if(!data[dia]){
data[dia] = {
pendientes: base.map(t => ({texto:t, done:false})),
eventos: [],
proyectos: [],
agua: 0,
disciplina: {respiracion:false, calistenia:false, baño:false},
biblia: {reflexion:""},
progreso: 0
};
}else{
let existentes = data[dia].pendientes.map(p => p.texto);
base.forEach(t => {
if(!existentes.includes(t)){
data[dia].pendientes.push({texto:t, done:false});
}
});
}

saveData(data);
return data[dia];
}

/* RENDER PRINCIPAL */
function render(){
getDiaData(); // 🔥 FIX CRÍTICO

document.getElementById("fecha").innerText = getDia();

renderEventos();
renderPendientes();
renderDisciplina();
renderAgua();
renderProyectos();
actualizarProgreso();
renderMision();
renderCalendar();
renderGrafica();
renderBiblia();
}

/* EVENTOS */
function renderEventos(){
let cont = document.getElementById("timeline");
cont.innerHTML = "";

let data = getData();
let dia = getDia();

(data[dia].eventos || []).sort((a,b)=>a.hora.localeCompare(b.hora))
.forEach((e,i)=>{

let div = document.createElement("div");
div.className = "evento";

let cb = document.createElement("input");
cb.type = "checkbox";
cb.checked = e.done;

cb.onchange = ()=>{
data[dia].eventos[i].done = cb.checked;
saveData(data);
render();
};

let span = document.createElement("span");
span.innerText = e.hora + " - " + e.texto;

if(e.done) span.classList.add("done");

let del = document.createElement("button");
del.innerText = "X";

del.onclick = ()=>{
data[dia].eventos.splice(i,1);
saveData(data);
render();
};

div.append(cb,span,del);
cont.appendChild(div);
});
}

/* PENDIENTES */
function renderPendientes(){
let cont = document.getElementById("pendientes");
cont.innerHTML = "";

let data = getData();
let dia = getDia();

(data[dia].pendientes || []).forEach((p,i)=>{

let div = document.createElement("div");
div.className = "pendiente";

let cb = document.createElement("input");
cb.type = "checkbox";
cb.checked = p.done;

cb.onchange = ()=>{
data[dia].pendientes[i].done = cb.checked;
saveData(data);
render();
};

let span = document.createElement("span");
span.innerText = p.texto;

if(p.done) span.classList.add("done");

let del = document.createElement("button");
del.innerText = "X";

del.onclick = ()=>{
data[dia].pendientes.splice(i,1);
saveData(data);
render();
};

div.append(cb,span,del);
cont.appendChild(div);
});
}

/* PROYECTOS */
function renderProyectos(){
let cont = document.getElementById("proyectos");
cont.innerHTML = "";

let data = getData();
let dia = getDia();

(data[dia].proyectos || []).forEach((p,i)=>{

let div = document.createElement("div");
div.className = "pendiente";

let cb = document.createElement("input");
cb.type = "checkbox";
cb.checked = p.done;

cb.onchange = ()=>{
data[dia].proyectos[i].done = cb.checked;
saveData(data);
render();
};

let span = document.createElement("span");
span.innerText = p.texto;

if(p.done) span.classList.add("done");

let del = document.createElement("button");
del.innerText = "X";

del.onclick = ()=>{
data[dia].proyectos.splice(i,1);
saveData(data);
render();
};

div.append(cb,span,del);
cont.appendChild(div);
});
}

/* DISCIPLINA */
function renderDisciplina(){
let data = getData();
let dia = getDia();

["respiracion","calistenia","baño"].forEach(id=>{
let el = document.getElementById(id);

el.checked = data[dia].disciplina[id];

el.onchange = ()=>{
data[dia].disciplina[id] = el.checked;
saveData(data);
render();
};
});
}

/* AGUA */
function renderAgua(){
document.getElementById("agua").innerText = getDiaData().agua + " ml";
}

document.getElementById("addAgua").onclick = ()=>{
let data = getData();
let dia = getDia();

data[dia].agua = Math.min((data[dia].agua || 0) + 250, 2000);

saveData(data);
render();
};

/* PROGRESO */
function actualizarProgreso(){
let d = getDiaData();

let total = 0;
let done = 0;

d.pendientes.forEach(p=>{total++; if(p.done) done++;});
d.eventos.forEach(p=>{total++; if(p.done) done++;});
d.proyectos.forEach(p=>{total++; if(p.done) done++;});
Object.values(d.disciplina).forEach(v=>{total++; if(v) done++;});

total++;
if(d.agua >= 2000) done++;

let prog = Math.round((done/total)*100) || 0;

d.progreso = prog;

document.getElementById("progressBar").style.width = prog + "%";
document.getElementById("porcentaje").innerText = prog + "%";

let data = getData();
data[getDia()] = d;
saveData(data);
}

/* MISIÓN */
function renderMision(){
let d = getDiaData();

let tarea =
d.pendientes.find(x=>!x.done) ||
d.proyectos.find(x=>!x.done);

document.getElementById("mision").innerText = tarea ? tarea.texto : "Todo completado ✔️";

document.getElementById("completeMission").onclick = ()=>{
let data = getData();
let dia = getDia();

let m =
data[dia].pendientes.find(x=>!x.done) ||
data[dia].proyectos.find(x=>!x.done);

if(m) m.done = true;

saveData(data);
render();
};
}

/* CALENDARIO */
function renderCalendar(){
let cont = document.getElementById("calendar");
cont.innerHTML = "";

let data = getData();

let y = currentDate.getFullYear();
let m = currentDate.getMonth();

let days = new Date(y,m+1,0).getDate();

for(let i=1;i<=days;i++){
let d = new Date(y,m,i);
let key = getKey(d);
let prog = data[key]?.progreso;

let div = document.createElement("div");
div.className = "day";
div.innerText = i;

if(prog != null){
if(prog < 40) div.classList.add("rojo");
else if(prog < 80) div.classList.add("amarillo");
else div.classList.add("verde");
}else{
div.style.background = "#2a2d36";
}

div.onclick = ()=>{
currentDate = d;
render();
};

cont.appendChild(div);
}
}

/* GRAFICA */
function renderGrafica(){
let c = document.getElementById("grafica");
let ctx = c.getContext("2d");

ctx.clearRect(0,0,c.width,c.height);

let data = getData();

for(let i=0;i<7;i++){
let d = new Date(currentDate);
d.setDate(d.getDate()-i);

let val = data[getKey(d)]?.progreso || 0;

ctx.fillStyle = "lime";
ctx.fillRect(40*i,150-val,20,val);
}
}

/* BIBLIA */
function renderBiblia(){
let base = ["Génesis 1","Génesis 2","Génesis 3","Génesis 4","Génesis 5"];

let index = Math.floor((new Date(getDia()) - new Date("2026-01-01")) / 86400000) % base.length;

document.getElementById("pasaje").innerText = base[index];

let d = getDiaData();
let ref = document.getElementById("reflexion");

ref.value = d.biblia.reflexion;

ref.oninput = ()=>{
let data = getData();
data[getDia()].biblia.reflexion = ref.value;
saveData(data);
};
}

/* AGREGAR */
document.getElementById("addEvento").onclick = ()=>{
let h = document.getElementById("hora");
let t = document.getElementById("eventoTexto");

if(!h.value || !t.value) return;

let data = getData();
let dia = getDia();

data[dia].eventos.push({
hora: h.value,
texto: t.value,
done: false
});

h.value = "";
t.value = "";

saveData(data);
render();
};

document.getElementById("addPendiente").onclick = ()=>{
let input = document.getElementById("nuevoPendiente");

if(!input.value) return;

let data = getData();
let dia = getDia();

data[dia].pendientes.push({
texto: input.value,
done: false
});

input.value = "";

saveData(data);
render();
};

/* NAV */
document.getElementById("prevDay").onclick = ()=>{
currentDate.setDate(currentDate.getDate()-1);
render();
};

document.getElementById("nextDay").onclick = ()=>{
currentDate.setDate(currentDate.getDate()+1);
render();
};

/* INIT */
render();
