// ===== STORAGE =====
function getFecha() {
  const input = document.getElementById("fecha");
  return input.value || new Date().toISOString().split("T")[0];
}

function getData() {
  return JSON.parse(localStorage.getItem("aguila") || "{}");
}

function saveData(data) {
  localStorage.setItem("aguila", JSON.stringify(data));
}

function getDia() {
  const data = getData();
  const fecha = getFecha();

  if (!data[fecha]) {
    data[fecha] = {
      eventos: [],
      pendientes: [],
      checks: {},
      agua: 0
    };
  }

  return { data, fecha, dia: data[fecha] };
}

// ===== INICIO =====
document.addEventListener("DOMContentLoaded", () => {
  const fechaInput = document.getElementById("fecha");
  const hoy = new Date().toISOString().split("T")[0];

  fechaInput.value = hoy;

  fechaInput.addEventListener("change", () => {
    renderTodo();
  });

  renderTodo();
});

// ===== RENDER =====
function renderTodo() {
  renderEventos();
  renderPendientes();
  renderChecks();
  renderAgua();
  actualizarProgreso();
}

// ===== EVENTOS =====
function agregarEvento() {
  const hora = document.getElementById("hora").value;
  const texto = document.getElementById("evento").value;

  if (!texto) return;

  const { data, dia } = getDia();

  dia.eventos.push({
    id: Date.now(),
    hora,
    texto
  });

  saveData(data);
  renderEventos();
  actualizarProgreso();
}

function eliminarEvento(id) {
  const { data, dia } = getDia();

  dia.eventos = dia.eventos.filter(e => e.id !== id);

  saveData(data);
  renderEventos();
  actualizarProgreso();
}

function renderEventos() {
  const lista = document.getElementById("listaEventos");
  const { dia } = getDia();

  lista.innerHTML = "";

  dia.eventos.forEach(e => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${e.hora || "--"} - ${e.texto}</span>
      <button onclick="eliminarEvento(${e.id})">❌</button>
    `;

    lista.appendChild(li);
  });
}

// ===== PENDIENTES CON CHECK =====
function agregarPendiente() {
  const texto = document.getElementById("pendiente").value;
  if (!texto) return;

  const { data, dia } = getDia();

  dia.pendientes.push({
    id: Date.now(),
    texto,
    done: false
  });

  saveData(data);
  renderPendientes();
  actualizarProgreso();
}

function togglePendiente(id) {
  const { data, dia } = getDia();

  const p = dia.pendientes.find(x => x.id === id);
  if (p) p.done = !p.done;

  saveData(data);
  renderPendientes();
  actualizarProgreso();
}

function eliminarPendiente(id) {
  const { data, dia } = getDia();

  dia.pendientes = dia.pendientes.filter(p => p.id !== id);

  saveData(data);
  renderPendientes();
  actualizarProgreso();
}

function renderPendientes() {
  const lista = document.getElementById("listaPendientes");
  const { dia } = getDia();

  lista.innerHTML = "";

  dia.pendientes.forEach(p => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="item ${p.done ? 'done' : ''}">
        <input type="checkbox" ${p.done ? "checked" : ""}
          onchange="togglePendiente(${p.id})">
        <span>${p.texto}</span>
      </div>
      <button onclick="eliminarPendiente(${p.id})">❌</button>
    `;

    lista.appendChild(li);
  });
}

// ===== CHECK TRABAJO =====
function toggleCheck(id) {
  const { data, dia } = getDia();

  dia.checks[id] = !dia.checks[id];

  saveData(data);
  actualizarProgreso();
}

function renderChecks() {
  const { dia } = getDia();

  document.querySelectorAll(".checklist input").forEach(input => {
    const id = input.getAttribute("onchange").match(/'(.*?)'/)[1];
    input.checked = !!dia.checks[id];
  });
}

// ===== AGUA =====
function sumarAgua() {
  const { data, dia } = getDia();

  dia.agua += 250;

  saveData(data);
  renderAgua();
  actualizarProgreso();
}

function renderAgua() {
  const { dia } = getDia();
  document.getElementById("aguaTotal").textContent = dia.agua + " ml";
}

// ===== PROGRESO =====
function actualizarProgreso() {
  const { dia } = getDia();

  let total = 0;
  let completado = 0;

  // CHECKS TRABAJO
  const checksKeys = ["whatsapp","gmail","reservas","gasolina","cierre","control"];
  total += checksKeys.length;

  checksKeys.forEach(k => {
    if (dia.checks[k]) completado++;
  });

  // PENDIENTES
  total += dia.pendientes.length;
  dia.pendientes.forEach(p => {
    if (p.done) completado++;
  });

  // AGUA (meta 2000 ml)
  total += 1;
  if (dia.agua >= 2000) completado++;

  const porcentaje = total === 0 ? 0 : Math.round((completado / total) * 100);

  document.getElementById("barra").style.width = porcentaje + "%";
  document.getElementById("porcentaje").textContent = porcentaje + "%";
}
