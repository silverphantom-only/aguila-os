const KEY="aguila_full";

let db=JSON.parse(localStorage.getItem(KEY))||{
  checks:{},
  eventos:[],
  gastos:[],
  agua:0,
  streak:0,
  lastCheck:null
};

function save(){
  localStorage.setItem(KEY,JSON.stringify(db));
}

// 🔥 FECHA LOCAL REAL (SIN UTC BUG)
function getFechaLocal(date = new Date()) {
  let d = new Date(date);
  d.setHours(12,0,0,0);
  return d.toISOString().split('T')[0];
}

let fechaSeleccionada = getFechaLocal();

// 📆 SEMANA
function generarSemana(){
  let cont=document.getElementById("semana");
  cont.innerHTML="";

  let hoy=new Date();
  hoy.setHours(12);

  let inicio=new Date(hoy);
  inicio.setDate(hoy.getDate()-hoy.getDay());

  for(let i=0;i<7;i++){
    let d=new Date(inicio);
    d.setDate(inicio.getDate()+i);

    let fecha=getFechaLocal(d);

    let div=document.createElement("div");
    div.className="dia";
    if(fecha===fechaSeleccionada) div.classList.add("activo");

    div.innerText=d.getDate();

    div.onclick=()=>{
      fechaSeleccionada=fecha;
      generarSemana();
      mostrarFecha();
      renderDia();
    };

    cont.appendChild(div);
  }
}

// 📅 TEXTO DÍA (SIN ERROR)
function mostrarFecha(){
  let p = fechaSeleccionada.split("-");
  let fecha = new Date(p[0], p[1]-1, p[2]);

  let texto = fecha.toLocaleDateString("es-MX",{
    weekday:"long",
    day:"numeric",
    month:"long"
  });

  document.getElementById("fechaTexto").innerText = texto;
}

// 📋 EVENTOS
function renderDia(){
  let cont=document.getElementById("hoy");
  cont.innerHTML="";

  let eventos=db.eventos.filter(e=>e.fecha===fechaSeleccionada);

  if(eventos.length){
    eventos.forEach(ev=>{
      let div=document.createElement("div");

      div.innerHTML=`
      <label>
      <input type="checkbox" ${ev.done?"checked":""}
      onclick="toggleEvento('${ev.id}')">
      ${ev.hora} ${ev.evento}
      </label>`;

      cont.appendChild(div);
    });
  }else{
    cont.innerText="Sin pendientes";
  }
}

// ✔ toggle
function toggleEvento(id){
  let ev=db.eventos.find(e=>e.id===id);
  ev.done=!ev.done;
  save();
}

// ➕ agregar
function agregarEvento(){
  let f=fecha.value;
  let h=hora.value;
  let e=evento.value;

  if(!f||!h||!e){
    alert("Completa todo");
    return;
  }

  db.eventos.push({
    id:Date.now(),
    fecha:f,
    hora:h,
    evento:e,
    done:false
  });

  save();
  renderDia();
}

// ✔ CHECKLIST + RACHA
document.querySelectorAll("[data-check]").forEach(el=>{
  let k=el.dataset.check;
  el.checked=db.checks[k]||false;

  el.onchange=()=>{
    db.checks[k]=el.checked;

    let today=new Date().toDateString();

    if(today!==db.lastCheck){
      db.streak++;
      db.lastCheck=today;
    }

    save();
    estado();
    mensaje();
    streak.innerText=db.streak;
  }
});

// 📊 ESTADO
function estado(){
  let c=Object.values(db.checks).filter(v=>v).length;

  if(c>=6){
    estadoTexto.innerText="🔥 Águila";
    estadoImg.src="aguila.png";
  }else if(c>=3){
    estadoTexto.innerText="⚖️ Medio";
    estadoImg.src="medio.png";
  }else{
    estadoTexto.innerText="❄️ Balgham";
    estadoImg.src="balgham.png";
  }
}
estado();

// 🧠 MENSAJE
function mensaje(){
  let h=new Date().getHours();

  if(h<12) mensaje.innerText="Actívate";
  else if(h<18) mensaje.innerText="Enfócate";
  else mensaje.innerText="Descansa";
}
mensaje();

// 💧 AGUA
function agregarAgua(){
  db.agua+=250;
  save();
  agua.innerText=db.agua+" ml";
}
agua.innerText=db.agua+" ml";

// 💰 GASTOS
function addGasto(){
  let m=parseFloat(monto.value);
  let c=categoria.value;

  if(!m)return;

  db.gastos.push({m,c});
  save();
  renderGastos();
}

function renderGastos(){
  listaGastos.innerHTML="";
  let t=0;

  db.gastos.forEach(g=>{
    let li=document.createElement("li");
    li.innerText=g.c+" $"+g.m;
    listaGastos.appendChild(li);
    t+=g.m;
  });

  total.innerText=t;
}
renderGastos();

// 🚀 INIT
generarSemana();
mostrarFecha();
renderDia();
streak.innerText=db.streak;
