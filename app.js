const checks = ["WhatsApp","Gmail","Reservas","Gasolina","Cierre","Control"];

const bibliaPlan = [
  "Génesis 1:1","Génesis 1:3","Génesis 1:26","Génesis 2:7","Génesis 3:9"
];

/* FIX FECHA */
function hoy(){
  let d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}

/* STORAGE */
function getData(){
  return JSON.parse(localStorage.getItem("aguila")) || {};
}

function saveData(data){
  localStorage.setItem("aguila", JSON.stringify(data));
}

function getFecha(){
  return document.getElementById("fecha").value;
}

function getDia(){
  let data = getData();
  let f = getFecha();

  if(!data[f]){
    data[f] = {
      pendientes: [],
      checks: {},
      agua: 0,
      disciplina: {},
      biblia: ""
    };
    saveData(data);
  }

  return data[f];
}

/* CALENDARIO */
function renderCalendarBar(){
  let bar = document.getElementById("calendarBar");
  bar.innerHTML = "";

  let base = new Date(getFecha());

  for(let i=-3;i<=3;i++){
    let d = new Date(base);
    d.setDate(d.getDate()+i);

    let fecha = d.toISOString().split("T")[0];

    let div = document.createElement("div");
    div.className = "day";
    if(fecha === getFecha()) div.classList.add("active-day");

    div.innerText = d.getDate();

    div.onclick = ()=>{
      document.getElementById("fecha").value = fecha;
      renderTodo();
    };

    bar.appendChild(div);
  }
}

/* PENDIENTES */
document.getElementById("btnPendiente").onclick = ()=>{
  let data = getData();
  let f = pendienteFecha.value;

  if(!f) return;

  if(!data[f]){
    data[f] = {pendientes:[],checks:{},agua:0,disciplina:{}};
  }

  data[f].pendientes.push({
    texto: pendienteTexto.value,
    done:false
  });

  saveData(data);
  renderTodo();
};

function renderPendientes(){
  let ul = document.getElementById("listaPendientes");
  ul.innerHTML = "";

  getDia().pendientes.forEach((p,i)=>{
    let li = document.createElement("li");

    let cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = p.done;

    cb.addEventListener("change",()=>{
      let dia = getDia();
      dia.pendientes[i].done = !dia.pendientes[i].done;
      save();
    });

    let span = document.createElement("span");
    span.innerText = p.texto;

    if(p.done) span.classList.add("done");

    li.appendChild(cb);
    li.appendChild(span);

    ul.appendChild(li);
  });
}

/* CHECKS */
function renderChecks(){
  let cont = document.getElementById("checks");
  cont.innerHTML = "";

  let dia = getDia();

  checks.forEach(c=>{
    let label = document.createElement("label");

    let cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = dia.checks[c] || false;

    cb.addEventListener("change",()=>{
      dia.checks[c] = cb.checked;
      save();
    });

    label.appendChild(cb);
    label.append(" " + c);
    cont.appendChild(label);
    cont.appendChild(document.createElement("br"));
  });
}

/* AGUA */
document.getElementById("btnAgua").onclick = ()=>{
  let dia = getDia();
  dia.agua += 250;
  save();
};

/* DISCIPLINA */
document.querySelectorAll("[data-disc]").forEach(el=>{
  el.addEventListener("change",()=>{
    let dia = getDia();
    dia.disciplina[el.dataset.disc] = el.checked;
    save();
  });
});

/* AGENDA */
function renderAgendaDia(){
  let ul = document.getElementById("agendaDia");
  ul.innerHTML = "";

  let base = ["Respiración","Baño caliente","Trabajo","Familia"];

  base.forEach(t=>{
    let li = document.createElement("li");
    li.innerText = t;
    ul.appendChild(li);
  });

  getDia().pendientes.forEach(p=>{
    let li = document.createElement("li");
    li.innerText = p.texto;
    ul.appendChild(li);
  });
}

/* PROGRESO */
function actualizarProgreso(){
  let dia = getDia();

  let total = checks.length + dia.pendientes.length + 4;
  let done = 0;

  checks.forEach(c=>{ if(dia.checks[c]) done++; });
  dia.pendientes.forEach(p=>{ if(p.done) done++; });

  if(dia.disciplina.resp) done++;
  if(dia.disciplina.calistenia) done++;
  if(dia.disciplina.baño) done++;
  if(dia.agua >= 2000) done++;

  let p = Math.round((done / total) * 100);

  document.getElementById("barra").style.width = p+"%";
  document.getElementById("porcentaje").innerText = p+"%";

  document.getElementById("estado").innerText =
    p<25?"BALGHAM":
    p<50?"MEDIO":
    p<75?"ASCENSO":"ÁGUILA";
}

/* BIBLIA */
function renderBiblia(){
  let index = Object.keys(getData()).indexOf(getFecha());
  document.getElementById("versiculo").innerText =
    bibliaPlan[index % bibliaPlan.length];
}

/* SAVE */
function save(){
  let data = getData();
  data[getFecha()] = getDia();
  saveData(data);
  renderTodo();
}

/* MAIN */
function renderTodo(){
  renderCalendarBar();
  renderPendientes();
  renderChecks();
  renderAgendaDia();
  renderBiblia();
  actualizarProgreso();

  document.getElementById("agua").innerText =
    getDia().agua + " ml";
}

/* INIT */
document.getElementById("fecha").value = hoy();
document.getElementById("pendienteFecha").value = hoy();

document.getElementById("fecha").addEventListener("change",renderTodo);

renderTodo();
