const checks = ["WhatsApp","Gmail","Reservas","Gasolina","Cierre","Control"];

function hoy(){
  const d = new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,'0')+"-"+String(d.getDate()).padStart(2,'0');
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
    data[f]={pendientes:[],eventos:[],checks:{},agua:0,disciplina:{}};
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
  let d=getDia();

  if(d.pendientes.length>=5){
    alert("Ejecuta primero");
    return;
  }

  let txt=pendienteTexto.value;
  if(!txt) return;

  d.pendientes.push({texto:txt,done:false});
  pendienteTexto.value="";
  save();
};

function renderPendientes(){
  listaPendientes.innerHTML="";

  getDia().pendientes.forEach((p,i)=>{
    let li=document.createElement("li");

    let cb=document.createElement("input");
    cb.type="checkbox";
    cb.checked=p.done;

    cb.onchange=()=>{
      p.done=cb.checked;
      save();
    };

    let span=document.createElement("span");
    span.innerText=p.texto;
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

  let d=getDia();
  d.eventos.push({hora:h,texto:t});
  d.eventos.sort((a,b)=>a.hora.localeCompare(b.hora));

  horaEvento.value="";
  textoEvento.value="";
  save();
}

function renderEventos(){
  agendaDia.innerHTML="";
  getDia().eventos.forEach(e=>{
    let li=document.createElement("li");
    li.innerHTML=`<b>${e.hora}</b> - ${e.texto}`;
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

  let total=checks.length+d.pendientes.length+4;
  let done=0;

  checks.forEach(c=>{if(d.checks[c])done++;});
  d.pendientes.forEach(p=>{if(p.done)done++;});

  if(d.disciplina.resp)done++;
  if(d.disciplina.calistenia)done++;
  if(d.disciplina.baño)done++;
  if(d.agua>=2000)done++;

  let p=Math.round((done/total)*100);

  barra.style.width=p+"%";
  porcentaje.innerText=p+"%";

  estado.innerText=p<25?"BALGHAM":p<50?"MEDIO":p<75?"ASCENSO":"ÁGUILA";
}

/* 📖 BIBLIA */
function biblia(){
  let lista=["Génesis 1:1","Génesis 1:3","Génesis 1:26"];
  versiculo.innerText=lista[Math.floor(Math.random()*lista.length)];
}

/* 🔄 RENDER */
function render(){
  misionActual.innerText=getMision();
  renderPendientes();
  renderEventos();
  renderChecks();
  progreso();
  biblia();
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
