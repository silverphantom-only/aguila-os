let fecha = new Date().toISOString().split("T")[0];

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
      agua: 0
    };
    saveData(data);
  }

  return data[fecha];
}

function render(){
  document.getElementById("fechaTexto").innerText = fecha;

  renderPendientes();
  renderEventos();
  renderAgua();
  progreso();
  mision();
}

/* 📌 Pendientes */
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
    cb.type = "checkbox";
    cb.checked = p.done;
    cb.onclick = ()=>{
      p.done = !p.done;
      save();
    };

    let span = document.createElement("span");
    span.innerText = p.texto;

    let del = document.createElement("button");
    del.innerText = "X";
    del.onclick = ()=>{
      let d = getDia();
      d.pendientes.splice(i,1);
      save();
    };

    li.append(cb, span, del);
    ul.appendChild(li);
  });
}

/* ⏰ Eventos */
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
    data[f] = {pendientes:[],eventos:[],agua:0};
  }

  data[f].eventos.push({hora:h,texto:t});
  saveData(data);

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

/* 💧 Agua */
function sumarAgua(){
  let d = getDia();
  d.agua += 250;
  save();
}

function renderAgua(){
  document.getElementById("agua").innerText = getDia().agua + " ml";
}

/* 📊 Progreso */
function progreso(){
  let d = getDia();
  let total = d.pendientes.length || 1;
  let done = d.pendientes.filter(p=>p.done).length;

  let p = Math.round((done/total)*100);

  document.getElementById("progresoBarra").style.width = p+"%";
  document.getElementById("porcentaje").innerText = p+"%";
}

/* 🔥 Mision */
function mision(){
  let p = getDia().pendientes.find(x=>!x.done);
  document.getElementById("mision").innerText = p ? p.texto : "Todo completo";
}

function completarMision(){
  let d = getDia();
  let p = d.pendientes.find(x=>!x.done);
  if(p) p.done = true;
  save();
}

/* 🔄 Navegación */
function cambiarDia(n){
  let d = new Date(fecha);
  d.setDate(d.getDate()+n);
  fecha = d.toISOString().split("T")[0];
  render();
}

function save(){
  let data = getData();
  data[fecha] = getDia();
  saveData(data);
  render();
}

render();
