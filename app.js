let currentDate = new Date();

/* FECHA */
function getDia(){
let d = new Date(currentDate);
return d.toLocaleDateString('sv-SE'); // 🔥 FIX FECHA REAL
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

/* CREAR DÍA */
function getDiaData(){
let data = getData();
let dia = getDia();

if(!data[dia]){

let w = new Date().getDay();

let personales = ["Baño","Fluoxetina"];

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

data[dia] = {
pendientes: base.map(t => ({texto:t, done:false})),
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
function render(){

let diaData = getDiaData();

document.getElementById("fecha").innerText = getDia();

/* PENDIENTES */
let cont = document.getElementById("pendientes");
cont.innerHTML = "";

diaData.pendientes.forEach((p,i)=>{

let div = document.createElement("div");

let cb = document.createElement("input");
cb.type="checkbox";
cb.checked=p.done;

cb.onchange=()=>{
let data=getData();
data[getDia()].pendientes[i].done=cb.checked;
saveData(data);
render();
};

let span = document.createElement("span");
span.innerText=p.texto;
if(p.done) span.style.textDecoration="line-through";

let del = document.createElement("button");
del.innerText="X";
del.onclick=()=>{
let data=getData();
data[getDia()].pendientes.splice(i,1);
saveData(data);
render();
};

div.append(cb,span,del);
cont.appendChild(div);
});

/* DISCIPLINA */
["respiracion","calistenia","baño"].forEach(id=>{
let el=document.getElementById(id);
el.checked=diaData.disciplina[id];

el.onchange=()=>{
let data=getData();
data[getDia()].disciplina[id]=el.checked;
saveData(data);
render();
};
});

/* AGUA */
document.getElementById("agua").innerText = diaData.agua + " ml";

document.getElementById("addAgua").onclick=()=>{
let data=getData();
data[getDia()].agua+=250;
saveData(data);
render();
};

/* PROGRESO */
let total=diaData.pendientes.length+3+1;
let done=diaData.pendientes.filter(p=>p.done).length;

Object.values(diaData.disciplina).forEach(v=>{if(v) done++;});

if(diaData.agua>=2000) done++;

let prog=Math.round((done/total)*100)||0;

document.getElementById("progressBar").style.width=prog+"%";
document.getElementById("porcentaje").innerText=prog+"%";

/* MISIÓN */
let m = diaData.pendientes.find(p=>!p.done);
document.getElementById("mision").innerText = m ? m.texto : "Todo completado ✔️";

document.getElementById("completeMission").onclick=()=>{
if(!m) return;
let data=getData();
let idx=data[getDia()].pendientes.findIndex(p=>!p.done);
data[getDia()].pendientes[idx].done=true;
saveData(data);
render();
};

}

/* EVENTOS */
document.getElementById("addEvento").onclick=()=>{
let h=document.getElementById("hora");
let t=document.getElementById("eventoTexto");

if(!h.value||!t.value) return;

let data=getData();
let dia=getDia();

if(!data[dia]) getDiaData();

data[dia].eventos.push({hora:h.value,texto:t.value});

saveData(data);
render();

h.value="";
t.value="";
};

/* PENDIENTE NUEVO */
document.getElementById("addPendiente").onclick=()=>{
let i=document.getElementById("nuevoPendiente");

if(!i.value) return;

let data=getData();
data[getDia()].pendientes.push({texto:i.value,done:false});

saveData(data);
render();

i.value="";
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

/* INIT */
render();
