let current = new Date();

function format(d){
return d.toLocaleDateString('sv-SE');
}

function getData(){
return JSON.parse(localStorage.getItem("aguila")||"{}");
}

function save(data){
localStorage.setItem("aguila",JSON.stringify(data));
}

/* BASE */
function baseTasks(){
return [
{hora:"07:00",texto:"Respiración"},
{hora:"07:10",texto:"Fluoxetina"},
{hora:"07:20",texto:"Calistenia"},
{hora:"07:40",texto:"Baño"},
{hora:"09:00",texto:"Trabajo (bloque 1)"},
{hora:"16:00",texto:"Trabajo (bloque 2)"}
];
}

function ensureDay(){
let data=getData();
let key=format(current);

if(!data[key]){
data[key]={agenda:[],pendientes:[]};
}

baseTasks().forEach(t=>{
if(!data[key].agenda.some(e=>e.texto===t.texto)){
data[key].agenda.push({...t,done:false});
}
});

save(data);
return data[key];
}

/* CALENDAR */
function renderCalendar(){
let cal=document.getElementById("calendar");
cal.innerHTML="";

let y=current.getFullYear();
let m=current.getMonth();

document.getElementById("month").innerText =
y+"-"+String(m+1).padStart(2,"0");

let days=new Date(y,m+1,0).getDate();

for(let i=1;i<=days;i++){
let d=new Date(y,m,i);
let key=format(d);

let div=document.createElement("div");
div.className="day";
div.innerText=i;

let data=getData();
if(data[key]?.agenda?.length) div.style.background="#43a047";

div.onclick=()=>{
current=d;
render();
};

cal.appendChild(div);
}
}

/* AGENDA */
function renderAgenda(){
let cont=document.getElementById("agenda");
cont.innerHTML="";

let data=getData();
let key=format(current);

data[key].agenda.sort((a,b)=>a.hora.localeCompare(b.hora));

data[key].agenda.forEach((t,i)=>{

let div=document.createElement("div");
div.className="task";

let cb=document.createElement("input");
cb.type="checkbox";
cb.checked=t.done;

cb.onchange=()=>{
t.done=cb.checked;
save(data);
render();
};

let span=document.createElement("span");
span.innerText=t.hora+" "+t.texto;
if(t.done) span.classList.add("done");

let del=document.createElement("button");
del.innerText="X";

del.onclick=()=>{
data[key].agenda.splice(i,1);
save(data);
render();
};

div.append(cb,span,del);
cont.appendChild(div);
});
}

/* ADD TASK */
document.getElementById("addTask").onclick=()=>{
let h=document.getElementById("time").value;
let t=document.getElementById("taskText").value;
if(!h||!t)return;

let data=getData();
let key=format(current);

data[key].agenda.push({hora:h,texto:t,done:false});

save(data);
render();
};

/* PENDIENTES */
function renderPendientes(){
let cont=document.getElementById("pendientes");
cont.innerHTML="";

let data=getData();

Object.keys(data).forEach(d=>{
data[d].pendientes.forEach((p,i)=>{

let div=document.createElement("div");
div.className="task";

let cb=document.createElement("input");
cb.type="checkbox";
cb.checked=p.done;

cb.onchange=()=>{
p.done=cb.checked;
save(data);
render();
};

let span=document.createElement("span");
span.innerText=p.texto;

let del=document.createElement("button");
del.innerText="X";

del.onclick=()=>{
data[d].pendientes.splice(i,1);
save(data);
render();
};

div.append(cb,span,del);
cont.appendChild(div);
});
});
}

/* ADD PENDIENTE */
document.getElementById("addPendiente").onclick=()=>{
let txt=document.getElementById("pendienteTexto").value;
if(!txt)return;

let data=getData();
let key=format(current);

data[key].pendientes.push({texto:txt,done:false});

save(data);
render();
};

/* PROGRESS */
function progreso(){
let d=ensureDay();

let total=d.agenda.length;
let done=d.agenda.filter(t=>t.done).length;

let p=Math.round((done/total)*100);

document.getElementById("bar").style.width=p+"%";

let estado="🌫️ Sin control";
if(p>30) estado="⚖️ En proceso";
if(p>70) estado="🦅 Modo Águila";

document.getElementById("estado").innerText=estado;
}

/* RENDER */
function render(){
ensureDay();
document.getElementById("selectedDate").innerText=format(current);

renderCalendar();
renderAgenda();
renderPendientes();
progreso();
}

/* NAV */
document.getElementById("prevMonth").onclick=()=>{
current.setMonth(current.getMonth()-1);
render();
};

document.getElementById("nextMonth").onclick=()=>{
current.setMonth(current.getMonth()+1);
render();
};

/* PWA */
if("serviceWorker" in navigator){
navigator.serviceWorker.register("service-worker.js");
}

render();
