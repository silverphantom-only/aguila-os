const KEY = "aguila_pro";

let db = JSON.parse(localStorage.getItem(KEY)) || {
  eventos: [],
  checks: {},
  notas: {},
  trabajo: {}
};

function save(){
  localStorage.setItem(KEY, JSON.stringify(db));
}

/* ===== FECHA SEGURA ===== */
function fechaISO(d = new Date()){
  d.setHours(12);
  return d.toISOString().split("T")[0];
}

let fechaSeleccionada = fechaISO();

/* ===== SEMANA ===== */
function renderSemana(){
  semana.innerHTML = "";

  let hoy = new Date();
  hoy.setHours(12);

  let inicio = new Date(hoy);
  inicio.setDate(hoy.getDate() - hoy.getDay());

  for(let i=0;i<7;i++){
    let d = new Date(inicio);
    d.setDate(inicio.getDate() + i);

    let f = fechaISO(d);

    let div = document.createElement("div");
    div.className = "dia";

    if(f === fechaSeleccionada){
      div.classList.add("activo");
    }

    div.innerText = d.getDate();

    div.onclick = ()=>{
      fechaSeleccionada = f;
      renderSemana();
      renderDia();
      renderNotas();
      renderTrabajo();
    };

    semana.appendChild(div);
  }
}

/* ===== DIA ===== */
function renderDia(){
  let p = fechaSeleccionada.split("-");
  let f = new Date(p[0], p[1]-1, p[2]);

  fechaTexto.innerText = f.toLocaleDateString("es-MX", {
    weekday:"long",
    day:"numeric",
    month:"long"
  });

  listaEventos.innerHTML = "";

  let eventos = db.eventos
    .filter(e => e.fecha === fechaSeleccionada)
    .sort((a,b)=> a.hora.localeCompare(b.hora));

  if(eventos.length){
    eventos.forEach(ev=>{
      let div = document.createElement("div");
      div.className = "evento";

      div.innerHTML = `
        <span>${ev.hora} ${ev.texto}</span>
        <div style="display:flex; gap:8px;">
          <input type="checkbox" ${ev.done?"checked":""}
          onchange="toggleEvento(${ev.id})">

          <button onclick="eliminarEvento(${ev.id})" class="btn-delete">✕</button>
        </div>
      `;

      listaEventos.appendChild(div);
    });
  } else {
    listaEventos.innerText = "Sin eventos para este día";
  }
}

/* ===== EVENTOS ===== */
function agregarEvento(){
  let f = document.getElementById("fecha").value;
  let h = document.getElementById("hora").value;
  let t = document.getElementById("texto").value;

  if(!f || !h || !t) return;

  let existe = db.eventos.find(e =>
    e.fecha === f && e.hora === h && e.texto === t
  );

  if(existe){
    alert("Evento duplicado");
    return;
  }

  db.eventos.push({
    id: Date.now(),
    fecha: f,
    hora: h,
    texto: t,
    done: false
  });

  save();

  renderDia();
}

/* ===== TOGGLE ===== */
function toggleEvento(id){
  let ev = db.eventos.find(e => e.id === id);
  ev.done = !ev.done;
  save();
}

/* ===== ELIMINAR ===== */
function eliminarEvento(id){
  if(!confirm("Eliminar evento?")) return;

  db.eventos = db.eventos.filter(e => e.id !== id);
  save();
  renderDia();
}

/* ===== NOTAS ===== */
function renderNotas(){
  if(!nota) return;

  nota.value = db.notas[fechaSeleccionada] || "";

  nota.oninput = ()=>{
    db.notas[fechaSeleccionada] = nota.value;
    save();
  };
}

/* ===== TRABAJO ===== */
const tareasTrabajo = [
  "whatsapp","gmail","reservas",
  "gasolina","cierre","control"
];

function renderTrabajo(){
  if(!trabajoContainer) return;

  let d = new Date(fechaSeleccionada);
  let dia = d.getDay();

  if(dia === 0){
    trabajoContainer.style.display = "none";
    return;
  }

  trabajoContainer.style.display = "block";

  trabajoContainer.innerHTML = "";

  if(!db.trabajo[fechaSeleccionada]){
    db.trabajo[fechaSeleccionada] = {};
  }

  tareasTrabajo.forEach(t=>{
    let div = document.createElement("label");

    div.innerHTML = `
      <span>${t}</span>
      <input type="checkbox"
      ${db.trabajo[fechaSeleccionada][t]?"checked":""}
      onchange="toggleTrabajo('${t}')">
    `;

    trabajoContainer.appendChild(div);
  });
}

function toggleTrabajo(t){
  db.trabajo[fechaSeleccionada][t] =
    !db.trabajo[fechaSeleccionada][t];

  save();
}

/* ===== INIT ===== */
renderSemana();
renderDia();
renderNotas();
renderTrabajo();
