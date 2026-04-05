let fechaActual = hoy();

function hoy(){
  return new Date().toISOString().split("T")[0];
}

function getData(){
  return JSON.parse(localStorage.getItem("aguila"))||{};
}

function saveData(d){
  localStorage.setItem("aguila",JSON.stringify(d));
}

function getDia(){
  let data=getData();
  if(!data[fechaActual]){
    data[fechaActual]={pendientes:[],eventos:[],checks:{},agua:0,disciplina:{},descanso:false};
    saveData(data);
  }
  return data[fechaActual];
}

function save(){
  let data=getData();
  data[fechaActual]=getDia();
  saveData(data);
  render();
}

/* NAV */
function diaAnterior(){
  let d=new Date(fechaActual);
  d.setDate(d.getDate()-1);
  fechaActual=d.toISOString().split("T")[0];
  render();
}

function diaSiguiente(){
  let d=new Date(fechaActual);
  d.setDate(d.getDate()+1);
  fechaActual=d.toISOString().split("T")[0];
  render();
}

/* PENDIENTES */
function addPendiente(){
  let txt=pendienteTexto.value;
  if(!txt)return;
  let d=getDia();
  d.pendientes.push({texto:txt,done:false});
  pendienteTexto.value="";
  save();
}

function renderPendientes(){
  listaPendientes.innerHTML="";
  getDia().pendientes.forEach((p,i)=>{
    let li=document.createElement("li");

    let cb=document.createElement("input");
    cb.type="checkbox";
    cb.checked=p.done;
    cb.onclick=()=>{p.done=!p.done;save();};

    let span=document.createElement("span");
    span.innerText=" "+p.texto;
    if(p.done) span.classList.add("done");

    let del=document.createElement("button");
    del.innerText="X";
    del.onclick=()=>{
      let d=getDia();
      d.pendientes.splice(i,1);
      save();
    };

    li.append(cb,span,del);
    listaPendientes.appendChild(li);
  });
}

/* EVENTOS */
function addEvento(){
  let f=fechaEvento.value;
  let h=horaEvento.value;
  let t=textoEvento.value;

  if(!f||!h||!t)return;

  let data=getData();
  if(!data[f]) data[f]={pendientes:[],eventos:[],checks:{},agua:0,disciplina:{}};

  data[f].eventos.push({hora:h,texto:t});
  saveData(data);
  render();
}

function renderTimeline(){
  timeline.innerHTML="";
  let ev=getDia().eventos;

  for(let h=6;h<=22;h++){
    let row=document.createElement("div");
    row.className="hora";

    let label=document.createElement("span");
    label.innerText=(h<10?"0"+h:h)+":00";

    let cont=document.createElement("div");

    ev.filter(e=>e.hora.startsWith(label.innerText))
      .forEach(e=>{
        let div=document.createElement("div");
        div.className="evento";
        div.innerText=e.texto;
        cont.appendChild(div);
      });

    row.append(label,cont);
    timeline.appendChild(row);
  }
}

/* AGUA */
function sumarAgua(){
  let d=getDia();
  d.agua+=250;
  save();
}

/* PROGRESO */
function progreso(){
  let d=getDia();
  let total=10,done=0;

  d.pendientes.forEach(p=>p.done&&done++);
  if(d.agua>=2000)done++;

  let p=Math.round(done/total*100);
  barraPro.style.width=p+"%";
  porcentaje.innerText=p+"%";
}

/* BIBLIA */
const plan=["Génesis 1:1","Génesis 1:3","Génesis 1:26"];

function biblia(){
  let i=new Date(fechaActual).getDate()%plan.length;
  versiculo.innerText=plan[i];
}

function guardarBiblia(){
  let d=getDia();
  d.biblia=reflexion.value;
  save();
}

/* RENDER */
function render(){
  fechaTexto.innerText=fechaActual;
  renderPendientes();
  renderTimeline();
  progreso();
  biblia();
}

render();
