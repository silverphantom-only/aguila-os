const KEY = "aguila_base";

let db = JSON.parse(localStorage.getItem(KEY)) || {
  eventos: [],
  checks: {}
};

function save(){
  localStorage.setItem(KEY, JSON.stringify(db));
}

/* FECHA SEGURA */
function fechaISO(d = new Date()){
  d.setHours(12);
  return d.toISOString().split("T")[0];
}

let fechaSeleccionada = fechaISO();

/* SEMANA */
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
    if(f === fechaSeleccionada) div.classList.add("activo");

    div.innerText = d.getDate();

    div.onclick = ()=>{
      fechaSeleccionada = f;
      renderSemana();
      renderDia();
    };

    semana.appendChild(div);
  }
}

/* DIA */
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
  }else{
    listaEventos.innerText = "Sin pendientes";
  }
}

/* AGREGAR EVENTO */
function agregarEvento(){
  if(!fecha.value || !hora.value || !texto.value) return;

  let existe = db.eventos.find(e =>
    e.fecha === fecha.value &&
    e.hora === hora.value &&
    e.texto === texto.value
  );

  if(existe){
    alert("Este evento ya existe");
    return;
  }

  db.eventos.push({
    id: Date.now(),
    fecha: fecha.value,
    hora: hora.value,
    texto: texto.value,
    done: false
  });

  save();
  renderDia();
}

/* TOGGLE */
function toggleEvento(id){
  let ev = db.eventos.find(e => e.id === id);
  ev.done = !ev.done;
  save();
}

/* ELIMINAR */
function eliminarEvento(id){
  if(!confirm("¿Eliminar este evento?")) return;

  db.eventos = db.eventos.filter(e => e.id !== id);
  save();
  renderDia();
}

/* CHECKLIST */
document.querySelectorAll("[data-id]").forEach(el=>{
  let id = el.dataset.id;

  el.checked = db.checks[id] || false;

  el.onchange = ()=>{
    db.checks[id] = el.checked;
    save();
  };
});

/* INIT */
renderSemana();
renderDia();
