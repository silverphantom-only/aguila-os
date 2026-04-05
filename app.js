let fechaActual = new Date().toISOString().split("T")[0];

/* ================= BASE ================= */
function getData(){
  return JSON.parse(localStorage.getItem("aguila")) || {};
}

function saveData(data){
  localStorage.setItem("aguila", JSON.stringify(data));
}

function getDia(){
  let data = getData();

  if(!data[fechaActual]){
    data[fechaActual] = {
      pendientes: [],
      eventos: [],
      checks: {},
      agua: 0,
      disciplina: {},
      biblia: ""
    };
    saveData(data);
  }

  return data[fechaActual];
}

function save(){
  let data = getData();
  data[fechaActual] = getDia();
  saveData(data);
  render();
}

/* ================= FECHA ================= */
function formatearFecha(f){
  return new Date(f).toLocaleDateString("es", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
}

function diaAnterior(){
  let d = new Date(fechaActual);
  d.setDate(d.getDate() - 1);
  fechaActual = d.toISOString().split("T")[0];
  render();
}

function diaSiguiente(){
  let d = new Date(fechaActual);
  d.setDate(d.getDate() + 1);
  fechaActual = d.toISOString().split("T")[0];
  render();
}

/* ================= MISION ================= */
function getMision(){
  let d = getDia();

  if(!d.disciplina.resp) return "Respiración";
  if(!d.disciplina.baño) return "Baño caliente";
  if(!d.disciplina.calistenia) return "Calistenia";

  let p = d.pendientes.find(x => !x.done);
  if(p) return p.texto;

  return "Día completado";
}

btnCompletar.onclick = () => {
  let d = getDia();

  if(!d.disciplina.resp) d.disciplina.resp = true;
  else if(!d.disciplina.baño) d.disciplina.baño = true;
  else if(!d.disciplina.calistenia) d.disciplina.calistenia = true;
  else {
    let p = d.pendientes.find(x => !x.done);
    if(p) p.done = true;
  }

  save();
};

/* ================= PENDIENTES ================= */
function addPendiente(){
  let txt = pendienteTexto.value.trim();
  if(!txt) return;

  let d = getDia();
  d.pendientes.push({texto: txt, done: false});

  pendienteTexto.value = "";
  save();
}

function renderPendientes(){
  listaPendientes.innerHTML = "";

  getDia().pendientes.forEach((p,i)=>{
    let li = document.createElement("li");

    let cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = p.done;
    cb.onclick = () => {
      p.done = !p.done;
      save();
    };

    let span = document.createElement("span");
    span.innerText = " " + p.texto;
    if(p.done) span.classList.add("done");

    let del = document.createElement("button");
    del.innerText = "❌";
    del.onclick = ()=>{
      let d = getDia();
      d.pendientes.splice(i,1);
      save();
    };

    li.append(cb, span, del);
    listaPendientes.appendChild(li);
  });
}

/* ================= EVENTOS ================= */
function addEvento(){
  let f = fechaEvento.value;
  let h = horaEvento.value;
  let t = textoEvento.value;

  if(!f || !h || !t){
    alert("Completa todo");
    return;
  }

  let data = getData();

  if(!data[f]){
    data[f] = {
      pendientes: [],
      eventos: [],
      checks: {},
      agua: 0,
      disciplina: {}
    };
  }

  data[f].eventos.push({hora: h, texto: t});

  saveData(data);

  fechaEvento.value = "";
  horaEvento.value = "";
  textoEvento.value = "";

  render();
}

/* ================= TIMELINE ================= */
function renderTimeline(){
  timeline.innerHTML = "";

  let eventos = getDia().eventos;

  for(let h=6; h<=22; h++){
    let hora = (h<10?"0"+h:h)+":00";

    let row = document.createElement("div");
    row.className = "hora";

    let label = document.createElement("span");
    label.innerText = hora;

    let cont = document.createElement("div");

    eventos
      .filter(e => e.hora.startsWith(hora))
      .forEach(e=>{
        let div = document.createElement("div");
        div.className = "evento";
        div.innerText = e.texto;
        cont.appendChild(div);
      });

    row.append(label, cont);
    timeline.appendChild(row);
  }
}

/* ================= AGUA ================= */
function sumarAgua(){
  let d = getDia();
  d.agua += 250;
  save();
}

function renderAgua(){
  let total = getDia().agua;
  agua.innerText = total + " ml";
  barraAgua.style.width = Math.min(total/2000*100,100)+"%";
}

/* ================= PROGRESO ================= */
function progreso(){
  let d = getDia();

  let total = 8;
  let done = 0;

  d.pendientes.forEach(p=> p.done && done++);
  if(d.agua >= 2000) done++;
  if(d.disciplina.resp) done++;
  if(d.disciplina.baño) done++;
  if(d.disciplina.calistenia) done++;

  let p = Math.round((done/total)*100);

  barraPro.style.width = p+"%";
  porcentaje.innerText = p+"%";

  estado.innerText =
    p < 25 ? "BALGHAM" :
    p < 50 ? "MEDIO" :
    p < 75 ? "ASCENSO" :
    "AGUILA";
}

/* ================= BIBLIA ================= */
const plan = [
  "Génesis 1:1",
  "Génesis 1:3",
  "Génesis 1:26",
  "Génesis 2:7",
  "Génesis 3:9"
];

function biblia(){
  let i = new Date(fechaActual).getDate() % plan.length;
  versiculo.innerText = plan[i];

  let d = getDia();
  reflexion.value = d.biblia || "";
}

function guardarBiblia(){
  let d = getDia();
  d.biblia = reflexion.value;
  save();
}

/* ================= RENDER ================= */
function render(){
  fechaTexto.innerText = formatearFecha(fechaActual);
  misionActual.innerText = getMision();

  renderPendientes();
  renderTimeline();
  renderAgua();
  progreso();
  biblia();
}

render();
