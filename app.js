const checksBase = ["WhatsApp", "Gmail", "Reservas", "Gasolina", "Cierre", "Control"];

/* =====================
   UTILIDADES
===================== */
function getFecha() {
  return document.getElementById("fecha").value;
}

function getData() {
  return JSON.parse(localStorage.getItem("aguilaOS")) || {};
}

function saveData(data) {
  localStorage.setItem("aguilaOS", JSON.stringify(data));
}

function getDia() {
  const fecha = getFecha();
  const data = getData();

  if (!data[fecha]) {
    data[fecha] = {
      eventos: [],
      pendientes: [],
      checks: {},
      agua: 0,
      biblia: {}
    };
    saveData(data);
  }

  return data[fecha];
}

/* =====================
   RENDER
===================== */
function renderTodo() {
  renderEventos();
  renderPendientes();
  renderChecklist();
  renderAgua();
  renderBiblia();
  actualizarProgreso();
}

/* =====================
   EVENTOS
===================== */
function agregarEvento() {
  const hora = document.getElementById("horaEvento").value;
  const texto = document.getElementById("textoEvento").value;

  if (!texto) return;

  const data = getData();
  const dia = getDia();

  dia.eventos.push({ hora, texto });

  data[getFecha()] = dia;
  saveData(data);

  renderEventos();
}

function eliminarEvento(i) {
  const data = getData();
  const dia = getDia();

  dia.eventos.splice(i, 1);
  data[getFecha()] = dia;
  saveData(data);

  renderEventos();
}

function renderEventos() {
  const lista = document.getElementById("listaEventos");
  lista.innerHTML = "";

  const dia = getDia();

  dia.eventos.forEach((e, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${e.hora} - ${e.texto} <button onclick="eliminarEvento(${i})">X</button>`;
    lista.appendChild(li);
  });
}

/* =====================
   PENDIENTES
===================== */
function agregarPendiente() {
  const input = document.getElementById("inputPendiente");
  const texto = input.value;

  if (!texto) return;

  const data = getData();
  const dia = getDia();

  dia.pendientes.push({
    id: Date.now(),
    texto,
    done: false
  });

  data[getFecha()] = dia;
  saveData(data);

  input.value = "";
  renderPendientes();
}

function togglePendiente(id) {
  const data = getData();
  const dia = getDia();

  dia.pendientes = dia.pendientes.map(p =>
    p.id === id ? { ...p, done: !p.done } : p
  );

  data[getFecha()] = dia;
  saveData(data);

  renderPendientes();
  actualizarProgreso();
}

function eliminarPendiente(id) {
  const data = getData();
  const dia = getDia();

  dia.pendientes = dia.pendientes.filter(p => p.id !== id);

  data[getFecha()] = dia;
  saveData(data);

  renderPendientes();
}

function renderPendientes() {
  const lista = document.getElementById("listaPendientes");
  lista.innerHTML = "";

  const dia = getDia();

  dia.pendientes.forEach(p => {
    const li = document.createElement("li");

    li.innerHTML = `
      <input type="checkbox" ${p.done ? "checked" : ""} 
      onchange="togglePendiente(${p.id})">
      <span class="${p.done ? "done" : ""}">${p.texto}</span>
      <button onclick="eliminarPendiente(${p.id})">X</button>
    `;

    lista.appendChild(li);
  });
}

/* =====================
   CHECKLIST
===================== */
function renderChecklist() {
  const cont = document.getElementById("checklist");
  cont.innerHTML = "";

  const dia = getDia();

  checksBase.forEach(c => {
    const checked = dia.checks[c] || false;

    const div = document.createElement("div");
    div.innerHTML = `
      <label>
        <input type="checkbox" ${checked ? "checked" : ""}
        onchange="toggleCheck('${c}')"> ${c}
      </label>
    `;
    cont.appendChild(div);
  });
}

function toggleCheck(nombre) {
  const data = getData();
  const dia = getDia();

  dia.checks[nombre] = !dia.checks[nombre];

  data[getFecha()] = dia;
  saveData(data);

  actualizarProgreso();
}

/* =====================
   AGUA
===================== */
function sumarAgua() {
  const data = getData();
  const dia = getDia();

  dia.agua += 250;

  data[getFecha()] = dia;
  saveData(data);

  renderAgua();
  actualizarProgreso();
}

function renderAgua() {
  const dia = getDia();
  document.getElementById("aguaTotal").innerText = dia.agua + " ml";
}

/* =====================
   BIBLIA
===================== */
function guardarBiblia() {
  const pasaje = document.getElementById("pasaje").value;
  const nota = document.getElementById("nota").value;

  const data = getData();
  const dia = getDia();

  dia.biblia = { pasaje, nota };

  data[getFecha()] = dia;
  saveData(data);
}

function renderBiblia() {
  const dia = getDia();

  document.getElementById("pasaje").value = dia.biblia.pasaje || "";
  document.getElementById("nota").value = dia.biblia.nota || "";
}

/* =====================
   PROGRESO
===================== */
function actualizarProgreso() {
  const dia = getDia();

  // checklist
  const totalChecks = checksBase.length;
  const doneChecks = checksBase.filter(c => dia.checks[c]).length;

  // pendientes
  const totalPend = dia.pendientes.length;
  const donePend = dia.pendientes.filter(p => p.done).length;

  // agua
  const agua = Math.min(dia.agua, 2000);

  let progreso = 0;

  if (totalChecks) progreso += (doneChecks / totalChecks) * 40;
  if (totalPend) progreso += (donePend / totalPend) * 40;
  progreso += (agua / 2000) * 20;

  progreso = Math.round(progreso);

  document.getElementById("barra").style.width = progreso + "%";
  document.getElementById("porcentaje").innerText = progreso + "%";
}

/* =====================
   INIT
===================== */
document.getElementById("fecha").valueAsDate = new Date();

document.getElementById("fecha").addEventListener("change", renderTodo);

renderTodo();
