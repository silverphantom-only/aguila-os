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
      agua: 0,
      biblia: { pasaje: "", nota: "" }
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
  renderAgua();
  renderBiblia();
}

// ===== EVENTOS =====
function agregarEvento() {
  const hora = document.getElementById("hora").value;
  const texto = document.getElementById("evento").value;

  if (!texto) return;

  const { data, fecha, dia } = getDia();

  dia.eventos.push({
    id: Date.now(),
    hora,
    texto
  });

  saveData(data);
  renderEventos();
}

function eliminarEvento(id) {
  const { data, fecha, dia } = getDia();

  dia.eventos = dia.eventos.filter(e => e.id !== id);

  saveData(data);
  renderEventos();
}

function renderEventos() {
  const lista = document.getElementById("listaEventos");
  const { dia } = getDia();

  lista.innerHTML = "";

  dia.eventos.forEach(e => {
    const li = document.createElement("li");
    li.innerHTML = `${e.hora} - ${e.texto} 
    <button onclick="eliminarEvento(${e.id})">❌</button>`;
    lista.appendChild(li);
  });
}

// ===== PENDIENTES =====
function agregarPendiente() {
  const texto = document.getElementById("pendiente").value;
  if (!texto) return;

  const { data, dia } = getDia();

  dia.pendientes.push({
    id: Date.now(),
    texto
  });

  saveData(data);
  renderPendientes();
}

function eliminarPendiente(id) {
  const { data, dia } = getDia();

  dia.pendientes = dia.pendientes.filter(p => p.id !== id);

  saveData(data);
  renderPendientes();
}

function renderPendientes() {
  const lista = document.getElementById("listaPendientes");
  const { dia } = getDia();

  lista.innerHTML = "";

  dia.pendientes.forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `${p.texto} 
    <button onclick="eliminarPendiente(${p.id})">❌</button>`;
    lista.appendChild(li);
  });
}

// ===== CHECKLIST =====
function toggleCheck(id) {
  const { data, dia } = getDia();

  dia.checks[id] = !dia.checks[id];

  saveData(data);
}

// ===== AGUA =====
function sumarAgua() {
  const { data, dia } = getDia();

  dia.agua += 250;

  saveData(data);
  renderAgua();
}

function renderAgua() {
  const { dia } = getDia();
  document.getElementById("aguaTotal").textContent = dia.agua + " ml";
}

// ===== BIBLIA =====
function renderBiblia() {
  const { dia } = getDia();

  document.getElementById("pasaje").value = dia.biblia.pasaje;
  document.getElementById("nota").value = dia.biblia.nota;

  document.getElementById("pasaje").oninput = guardarBiblia;
  document.getElementById("nota").oninput = guardarBiblia;
}

function guardarBiblia() {
  const { data, dia } = getDia();

  dia.biblia.pasaje = document.getElementById("pasaje").value;
  dia.biblia.nota = document.getElementById("nota").value;

  saveData(data);
}
