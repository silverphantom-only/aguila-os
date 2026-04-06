let currentDate=new Date();

function getDia(){
let d=new Date(currentDate);
return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function getKey(d){
return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function getData(){
try{return JSON.parse(localStorage.getItem("aguilaOS"))||{}}catch{localStorage.clear();return{}}
}

function saveData(d){localStorage.setItem("aguilaOS",JSON.stringify(d))}

/* TAREAS AUTOMATICAS */
function getDiaData(){
let data=getData(),dia=getDia(),f=new Date(currentDate),w=f.getDay();

let personales=["Baño","Fluoxetina"];
let trabajo=[
"Revisar cierres día anterior","Revisar consumo de gasolinas","Revisar WhatsApp",
"Revisar Gmail","Seguimiento a clientes","Llevar redes sociales",
"Actualizar página web","Reservar pendientes","Revisar cuentas por cobrar"
];

let base=(w===0)?personales:[...personales,...trabajo];

if(!data[dia]){
data[dia]={pendientes:base.map(t=>({texto:t,done:false})),eventos:[],proyectos:[],agua:0,disciplina:{respiracion:false,calistenia:false,baño:false},biblia:{reflexion:""},progreso:0}
}else{
let existentes=data[dia].pendientes.map(p=>p.texto);
base.forEach(t=>{if(!existentes.includes(t))data[dia].pendientes.push({texto:t,done:false})});
}

saveData(data);
return data[dia];
}

/* RENDER */
function render(){
document.getElementById("fecha").innerText=getDia();
renderEventos();renderPendientes();renderDisciplina();renderAgua();
renderProyectos();actualizarProgreso();renderMision();renderCalendar();renderGrafica();renderBiblia();
}

/* EVENTOS */
function renderEventos(){
let c=document.getElementById("timeline");c.innerHTML="";
let data=getData(),dia=getDia();

(data[dia].eventos||[]).sort((a,b)=>a.hora.localeCompare(b.hora))
.forEach((e,i)=>{
let div=document.createElement("div");div.className="evento";

let cb=document.createElement("input");cb.type="checkbox";cb.checked=e.done;
cb.onchange=()=>{data[dia].eventos[i].done=cb.checked;saveData(data);render()};

let span=document.createElement("span");span.innerText=e.hora+" - "+e.texto;
if(e.done)span.classList.add("done");

let del=document.createElement("button");del.innerText="X";
del.onclick=()=>{data[dia].eventos.splice(i,1);saveData(data);render()};

div.append(cb,span,del);c.appendChild(div);
});
}

/* PENDIENTES */
function renderPendientes(){
let c=document.getElementById("pendientes");c.innerHTML="";
let data=getData(),dia=getDia();

(data[dia].pendientes||[]).forEach((p,i)=>{
let div=document.createElement("div");div.className="pendiente";

let cb=document.createElement("input");cb.type="checkbox";cb.checked=p.done;
cb.onchange=()=>{data[dia].pendientes[i].done=cb.checked;saveData(data);render()};

let span=document.createElement("span");span.innerText=p.texto;
if(p.done)span.classList.add("done");

let del=document.createElement("button");del.innerText="X";
del.onclick=()=>{data[dia].pendientes.splice(i,1);saveData(data);render()};

div.append(cb,span,del);c.appendChild(div);
});
}

/* PROYECTOS */
function renderProyectos(){
let c=document.getElementById("proyectos");c.innerHTML="";
let data=getData(),dia=getDia();

(data[dia].proyectos||[]).forEach((p,i)=>{
let div=document.createElement("div");div.className="pendiente";

let cb=document.createElement("input");cb.type="checkbox";cb.checked=p.done;
cb.onchange=()=>{data[dia].proyectos[i].done=cb.checked;saveData(data);render()};

let span=document.createElement("span");span.innerText=p.texto;
if(p.done)span.classList.add("done");

let del=document.createElement("button");del.innerText="X";
del.onclick=()=>{data[dia].proyectos.splice(i,1);saveData(data);render()};

div.append(cb,span,del);c.appendChild(div);
});
}

document.getElementById("addProyecto").onclick=()=>{
let i=document.getElementById("nuevoProyecto");if(!i.value)return;
let data=getData(),dia=getDia();
data[dia].proyectos.push({texto:i.value,done:false});
i.value="";saveData(data);render();
};

/* DISCIPLINA */
function renderDisciplina(){
let data=getData(),dia=getDia();
["respiracion","calistenia","baño"].forEach(id=>{
let el=document.getElementById(id);
el.checked=data[dia].disciplina[id];
el.onchange=()=>{data[dia].disciplina[id]=el.checked;saveData(data);render()};
});
}

/* AGUA */
function renderAgua(){document.getElementById("agua").innerText=getDiaData().agua+" ml";}
document.getElementById("addAgua").onclick=()=>{
let data=getData(),dia=getDia();
data[dia].agua=Math.min((data[dia].agua||0)+250,2000);
saveData(data);render();
};

/* PROGRESO */
function actualizarProgreso(){
let d=getDiaData(),t=0,dn=0;
d.pendientes.forEach(p=>{t++;if(p.done)dn++});
d.eventos.forEach(p=>{t++;if(p.done)dn++});
d.proyectos.forEach(p=>{t++;if(p.done)dn++});
Object.values(d.disciplina).forEach(v=>{t++;if(v)dn++});
t++;if(d.agua>=2000)dn++;
let p=Math.round((dn/t)*100)||0;
d.progreso=p;
document.getElementById("progressBar").style.width=p+"%";
document.getElementById("porcentaje").innerText=p+"%";
let data=getData();data[getDia()]=d;saveData(data);
}

/* MISION */
function renderMision(){
let d=getDiaData();
let p=d.pendientes.find(x=>!x.done)||d.proyectos.find(x=>!x.done);
document.getElementById("mision").innerText=p?p.texto:"Todo completado ✔️";

document.getElementById("completeMission").onclick=()=>{
let data=getData(),dia=getDia();
let m=data[dia].pendientes.find(x=>!x.done)||data[dia].proyectos.find(x=>!x.done);
if(m)m.done=true;
saveData(data);render();
};
}

/* CALENDARIO */
function renderCalendar(){
let c=document.getElementById("calendar");c.innerHTML="";
let data=getData(),y=currentDate.getFullYear(),m=currentDate.getMonth();
let days=new Date(y,m+1,0).getDate();

for(let i=1;i<=days;i++){
let d=new Date(y,m,i),k=getKey(d),p=data[k]?.progreso;
let div=document.createElement("div");div.className="day";div.innerText=i;
if(p!=null){if(p<40)div.classList.add("rojo");else if(p<80)div.classList.add("amarillo");else div.classList.add("verde")}
else div.style.background="#2a2d36";
div.onclick=()=>{currentDate=d;render()};
c.appendChild(div);
}
}

/* GRAFICA */
function renderGrafica(){
let c=document.getElementById("grafica"),ctx=c.getContext("2d");
ctx.clearRect(0,0,c.width,c.height);
let data=getData();
for(let i=0;i<7;i++){
let d=new Date(currentDate);d.setDate(d.getDate()-i);
let v=data[getKey(d)]?.progreso||0;
ctx.fillStyle="lime";ctx.fillRect(40*i,150-v,20,v);
}
}

/* BIBLIA */
function renderBiblia(){
let base=["Génesis 1","Génesis 2","Génesis 3","Génesis 4","Génesis 5"];
let i=Math.floor((new Date(getDia())-new Date("2026-01-01"))/86400000)%base.length;
document.getElementById("pasaje").innerText=base[i];
let d=getDiaData(),r=document.getElementById("reflexion");
r.value=d.biblia.reflexion;
r.oninput=()=>{let data=getData();data[getDia()].biblia.reflexion=r.value;saveData(data)};
}

/* AGREGAR */
document.getElementById("addEvento").onclick=()=>{
let h=document.getElementById("hora"),t=document.getElementById("eventoTexto");
if(!h.value||!t.value)return;
let data=getData(),dia=getDia();
data[dia].eventos.push({hora:h.value,texto:t.value,done:false});
h.value="";t.value="";saveData(data);render();
};

document.getElementById("addPendiente").onclick=()=>{
let i=document.getElementById("nuevoPendiente");if(!i.value)return;
let data=getData(),dia=getDia();
data[dia].pendientes.push({texto:i.value,done:false});
i.value="";saveData(data);render();
};

/* NAV */
document.getElementById("prevDay").onclick=()=>{currentDate.setDate(currentDate.getDate()-1);render()};
document.getElementById("nextDay").onclick=()=>{currentDate.setDate(currentDate.getDate()+1);render()};

render();
