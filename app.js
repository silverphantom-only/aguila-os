const checks = ["WhatsApp","Gmail","Reservas","Gasolina","Cierre","Control"];

function hoy(){
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function getData(){
  return JSON.parse(localStorage.getItem("aguila"))||{};
}

function saveData(d){
  localStorage.setItem("aguila",JSON.stringify(d));
}

function getFecha(){
  return fecha.value;
}

function getDia(){
  let data=getData();
  let f=getFecha();

  if(!data[f]){
    data[f]={pendientes:[],eventos:[],checks:{},agua:0,disciplina:{},biblia:{}};
    saveData(data);
  }

  return data[f];
}

/* 🔥 MISIÓN */
function getMision(){
  let d=getDia();

  if(!d.disciplina.resp) return "Respiración";
  if(!d.disciplina.baño) return "Baño caliente";
  if(!d.disciplina.calistenia) return "Calistenia";

  let p=d.pendientes.find(x=>!x.done);
  if(p) return p.texto;

  return "Día completado";
}

btnCompletar.onclick=()=>{
  let d=getDia();

  if(!d.disciplina.resp) d.disciplina.resp=true;
  else if(!d.disciplina.baño) d.disciplina.baño=true;
  else if(!d.disciplina.calistenia) d.disciplina.calistenia=true;
  else{
    let p=d.pendientes.find(x=>!x.done);
    if(p) p.done=true;
  }

  save();
};

/* 📌 PENDIENTES */
btnPendiente.onclick=()=>{
  let txt=pendienteTexto.value.trim();
  let f=pendienteFecha.value;

  if(!txt||!f)return;

  let data=getData();

  if(!data[f]){
    data[f]={pendientes:[],eventos:[],checks:{},agua:0,disciplina:{},biblia:{}};
  }

  data[f].pendientes.push({texto:txt,done:false});

  saveData(data);
  pendienteTexto.value="";
  render();
};

function renderPendientes(){
  listaPendientes.innerHTML="";
  let d=getDia();

  d.pendientes.forEach((p)=>{
    let li=document.createElement("li");

    let cb=document.createElement("input");
    cb.type="checkbox";
    cb.checked=p.done;

    cb.onclick=()=>{
      p.done=!p.done;
      save();
    };

    let span=document.createElement("span");
    span.innerText=" "+p.texto;
    if(p.done) span.classList.add("done");

    li.appendChild(cb);
    li.appendChild(span);

    listaPendientes.appendChild(li);
  });
}

/* ⏰ EVENTOS */
function addEvento(){
  let h=horaEvento.value;
  let t=textoEvento.value;

  if(!h||!t)return;

  let data=getData();
  let f=getFecha();

  if(!data[f]){
    data[f]={pendientes:[],eventos:[],checks:{},agua:0,disciplina:{},biblia:{}};
  }

  data[f].eventos.push({hora:h,texto:t});
  data[f].eventos.sort((a,b)=>a.hora.localeCompare(b.hora));

  saveData(data);

  horaEvento.value="";
  textoEvento.value="";
  render();
}

function renderEventos(){
  agendaDia.innerHTML="";
  getDia().eventos.forEach(e=>{
    let li=document.createElement("li");
    li.innerHTML=`${e.hora} - ${e.texto}`;
    agendaDia.appendChild(li);
  });
}

/* 💧 AGUA */
btnAgua.onclick=()=>{
  let d=getDia();
  d.agua+=250;
  save();
};

/* 🧠 CHECKS */
function renderChecks(){
  checksDiv.innerHTML="";
  let d=getDia();

  checks.forEach(c=>{
    let cb=document.createElement("input");
    cb.type="checkbox";
    cb.checked=d.checks[c]||false;

    cb.onchange=()=>{
      d.checks[c]=cb.checked;
      save();
    };

    checksDiv.append(c,cb,document.createElement("br"));
  });
}

/* 📊 PROGRESO */
function progreso(){
  let d=getDia();

  let total=10;
  let done=0;

  d.pendientes.forEach(p=>{if(p.done)done++;});
  if(d.agua>=2000)done++;
  if(d.disciplina.resp)done++;
  if(d.disciplina.calistenia)done++;
  if(d.disciplina.baño)done++;

  let p=Math.round((done/total)*100);

  barra.style.width=p+"%";
  porcentaje.innerText=p+"%";

  estado.innerText=p<25?"BALGHAM":p<50?"MEDIO":p<75?"ASCENSO":"ÁGUILA";
}

/* 📖 BIBLIA EXEGÉTICA */
const plan = [
  "Génesis 1:1",
  "Génesis 1:3",
  "Génesis 1:26",
  "Génesis 2:7",
  "Génesis 3:9"
];

function biblia(){
  let index = new Date(getFecha()).getDate() % plan.length;
  versiculo.innerText = plan[index];

  let b=getDia().biblia||{};
  obs.value=b.obs||"";
  interp.value=b.interp||"";
  contexto.value=b.contexto||"";
  aplicacion.value=b.aplicacion||"";
  reflexion.value=b.reflexion||"";
}

function guardarBiblia(){
  let d=getDia();

  d.biblia={
    obs:obs.value,
    interp:interp.value,
    contexto:contexto.value,
    aplicacion:aplicacion.value,
    reflexion:reflexion.value
  };

  save();
}

/* 📅 CALENDARIO */
let currentDate=new Date();

function renderCalendar(){
  calendarGrid.innerHTML="";
  mesTitulo.innerText=currentDate.toLocaleString("es",{month:"long",year:"numeric"});

  let y=currentDate.getFullYear();
  let m=currentDate.getMonth();

  let days=new Date(y,m+1,0).getDate();

  for(let i=1;i<=days;i++){
    let f=`${y}-${String(m+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;

    let div=document.createElement("div");
    div.className="day-cell";
    div.innerText=i;

    div.onclick=()=>{
      fecha.value=f;
      render();
    };

    calendarGrid.appendChild(div);
  }
}

function prevMes(){currentDate.setMonth(currentDate.getMonth()-1);renderCalendar();}
function nextMes(){currentDate.setMonth(currentDate.getMonth()+1);renderCalendar();}

/* 🔄 */
function render(){
  misionActual.innerText=getMision();
  renderPendientes();
  renderEventos();
  renderChecks();
  progreso();
  biblia();
  renderCalendar();
  agua.innerText=getDia().agua+" ml";
}

function save(){
  let data=getData();
  data[getFecha()]=getDia();
  saveData(data);
  render();
}

/* INIT */
fecha.value=hoy();
pendienteFecha.value=hoy();
fecha.onchange=render;

render();
