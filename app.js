let fecha = new Date().toISOString().split("T")[0];

/* DATA */

function getData(){
  return JSON.parse(localStorage.getItem("data")) || {};
}

function saveData(d){
  localStorage.setItem("data", JSON.stringify(d));
}

function getDia(){
  let data = getData();

  if(!data[fecha]){
    data[fecha] = {
      pendientes: [],
      eventos: [],
      agua: 0,
      progreso: 0,
      disciplina:{respiracion:false,calistenia:false,baño:false},
      biblia:{reflexion:""}
    };
    saveData(data);
  }

  return data[fecha];
}

/* RENDER */

function render(){
  document.getElementById("fechaTexto").innerText = fecha;
  document.getElementById("fechaEvento").value = fecha;

  renderPendientes();
  renderEventos();
  renderAgua();
  renderDisciplina();
  progreso();
  mision();
  renderGrafica();
  renderCalendar();
  renderBiblia();
}

/* EVENTOS */

function agregarEvento(){
  let f = document.getElementById("fechaEvento").value;
  let h = document.getElementById("horaEvento").value;
  let t = document.getElementById("textoEvento").value;

  if(!f || !h || !t){
    alert("Completa todo");
    return;
  }

  let data = getData();

  if(!data[f]){
    data[f] = {
      pendientes:[],
      eventos:[],
      agua:0,
      progreso:0,
      disciplina:{respiracion:false,calistenia:false,baño:false},
      biblia:{reflexion:""}
    };
  }

  data[f].eventos.push({hora:h,texto:t});
  saveData(data);

  fecha = f;
  render();
}

function renderEventos(){
  let cont = document.getElementById("timeline");
  cont.innerHTML = "";

  let ev = getDia().eventos;

  for(let h=6;h<=22;h++){
    let div = document.createElement("div");
    div.className = "hora";

    let hora = (h<10?"0"+h:h)+":00";
    div.innerText = hora;

    ev.forEach(e=>{
      if(e.hora.startsWith(hora)){
        let evento = document.createElement("div");
        evento.className = "evento";
        evento.innerText = e.texto;
        div.appendChild(evento);
      }
    });

    cont.appendChild(div);
  }
}

/* PENDIENTES */

function agregarPendiente(){
  let txt = document.getElementById("inputPendiente").value;
  if(!txt) return;

  let d = getDia();
  d.pendientes.push({texto:txt, done:false});
  save();
}

function renderPendientes(){
  let ul = document.getElementById("lista");
  ul.innerHTML = "";

  getDia().pendientes.forEach((p,i)=>{
    let li = document.createElement("li");

    let cb = document.createElement("input");
    cb.type="checkbox";
    cb.checked=p.done;
    cb.onclick=()=>{p.done=!p.done; save();};

    let span = document.createElement("span");
    span.innerText=p.texto;

    let del = document.createElement("button");
    del.innerText="❌";
    del.onclick=()=>{
      let d=getDia();
      d.pendientes.splice(i,1);
      save();
    };

    li.append(cb,span,del);
    ul.appendChild(li);
  });
}

/* AGUA */

function sumarAgua(){
  let d=getDia();
  d.agua+=250;
  save();
}

function renderAgua(){
  document.getElementById("agua").innerText=getDia().agua+" ml";
}

/* DISCIPLINA */

function toggleDisciplina(tipo){
  let d=getDia();
  d.disciplina[tipo]=!d.disciplina[tipo];
  save();
}

function renderDisciplina(){
  let d=getDia().disciplina;
  document.getElementById("resp").checked=d.respiracion;
  document.getElementById("cal").checked=d.calistenia;
  document.getElementById("ban").checked=d.baño;
}

/* PROGRESO */

function progreso(){
  let d=getDia();

  let total=d.pendientes.length+4;
  let done=d.pendientes.filter(p=>p.done).length;

  if(d.disciplina.respiracion) done++;
  if(d.disciplina.calistenia) done++;
  if(d.disciplina.baño) done++;
  if(d.agua>=2000) done++;

  let p= total? Math.round((done/total)*100):0;
  d.progreso=p;

  document.getElementById("progresoBarra").style.width=p+"%";
  document.getElementById("porcentaje").innerText=p+"%";
}

/* MISIÓN */

function mision(){
  let p=getDia().pendientes.find(x=>!x.done);
  document.getElementById("mision").innerText=p?p.texto:"Todo completo";
}

function completarMision(){
  let d=getDia();
  let p=d.pendientes.find(x=>!x.done);
  if(p) p.done=true;
  save();
}

/* CALENDARIO */

function renderCalendar(){
  let cont=document.getElementById("calendar");
  cont.innerHTML="";

  let hoy=new Date(fecha);
  let year=hoy.getFullYear();
  let month=hoy.getMonth();

  let first=new Date(year,month,1).getDay();
  let days=new Date(year,month+1,0).getDate();

  for(let i=0;i<first;i++){
    cont.innerHTML+="<div></div>";
  }

  for(let d=1;d<=days;d++){
    let f=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    let prog=getData()[f]?.progreso||0;

    let color="#020617";
    if(prog>70) color="green";
    else if(prog>30) color="orange";
    else if(prog>0) color="red";

    let div=document.createElement("div");
    div.innerText=d;
    div.style.background=color;
    div.onclick=()=>{fecha=f; render();};

    cont.appendChild(div);
  }
}

/* GRAFICA */

function renderGrafica(){
  let ctx=document.getElementById("grafica").getContext("2d");
  ctx.clearRect(0,0,300,100);

  let data=getData();

  for(let i=6;i>=0;i--){
    let d=new Date();
    d.setDate(d.getDate()-i);
    let f=d.toISOString().split("T")[0];
    let v=data[f]?.progreso||0;

    ctx.fillRect((6-i)*40,100-v,20,v);
  }
}

/* BIBLIA */

let plan=["Génesis 1","Génesis 2","Génesis 3","Génesis 4","Génesis 5"];

function renderBiblia(){
  let index=Math.floor((new Date(fecha)-new Date("2026-01-01"))/86400000);
  let vers=plan[index%plan.length];

  document.getElementById("versiculo").innerText=vers;
  document.getElementById("reflexion").value=getDia().biblia.reflexion||"";
}

function guardarBiblia(){
  let d=getDia();
  d.biblia.reflexion=document.getElementById("reflexion").value;
  save();
}

/* FECHA */

function cambiarDia(n){
  let d=new Date(fecha);
  d.setDate(d.getDate()+n);
  fecha=d.toISOString().split("T")[0];
  render();
}

/* SAVE */

function save(){
  let data=getData();
  data[fecha]=getDia();
  saveData(data);
  render();
}

window.onload=()=>{render();};
