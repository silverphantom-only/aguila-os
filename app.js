const KEY="aguila_full";

let db=JSON.parse(localStorage.getItem(KEY))||{
  checks:{},
  eventos:[],
  gastos:[],
  agua:0,
  streak:0,
  lastCheck:null
};

// 🔥 FECHA LOCAL CORRECTA
function getFechaLocal(date = new Date()) {
  let offset = date.getTimezoneOffset();
  let local = new Date(date.getTime() - (offset * 60000));
  return local.toISOString().split('T')[0];
}

let fechaSeleccionada = getFechaLocal();

function save(){
  localStorage.setItem(KEY,JSON.stringify(db));
}

// 📆 SEMANA
function generarSemana(){
  let cont=document.getElementById("semana");
  cont.innerHTML="";

  let hoy=new Date();

  for(let i=0;i<7;i++){
    let d=new Date();
    d.setDate(hoy.getDate()-hoy.getDay()+i);

    let fecha=getFechaLocal(d);

    let div=document.createElement("div");
    div.className="dia";

    if(fecha===fechaSeleccionada) div.classList.add("activo");

    div.innerText=d.getDate();

    div.onclick=()=>{
      fechaSeleccionada=fecha;
      generarSemana();
      renderDia();
      mostrarFecha();
    };

    cont.appendChild(div);
  }
}

// 📅 TEXTO FECHA
function mostrarFecha(){
  let f=new Date(fechaSeleccionada);

  let texto=f.toLocaleDateString("es-MX",{
    weekday:"long",
    day:"numeric",
    month:"long"
  });

  document.getElementById("fechaTexto").innerText=texto;
}

// 📋 EVENTOS DEL DÍA
function renderDia(){
  let eventos=db.eventos.filter(e=>e.fecha===fechaSeleccionada);
  let cont=document.getElementById("hoy");
  cont.innerHTML="";

  if(eventos.length){
    eventos.forEach((ev,i)=>{
      let div=document.createElement("div");

      div.innerHTML=`
      <label>
      <input type="checkbox" ${ev.done?"checked":""} onclick="toggleEvento(${i})">
      ${ev.hora} ${ev.evento}
      </label>`;

      cont.appendChild(div);
    });
  }else{
    cont.innerText="Sin pendientes";
  }
}

// ✔ TOGGLE EVENTO
function toggleEvento(i){
  let eventos=db.eventos.filter(e=>e.fecha===fechaSeleccionada);
  let ev=eventos[i];

  let real=db.eventos.find(e=>e.fecha===ev.fecha && e.hora===ev.hora && e.evento===ev.evento);

  real.done=!real.done;
  save();
}

// ➕ EVENTO
function agregarEvento(){
  let f=fecha.value;
  let h=hora.value;
  let e=evento.value;

  if(!f||!h||!e){
    alert("Completa todo");
    return;
  }

  db.eventos.push({fecha:f,hora:h,evento:e,done:false});

  save();
  renderDia();
}

// ✔ CHECKLIST + STREAK
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
    renderStreak();
  }
});

// 🔥 STREAK
function renderStreak(){
  streak.innerText=db.streak;
}
renderStreak();

// 📊 ESTADO
function estado(){
  let c=Object.values(db.checks).filter(v=>v).length;

  if(c>=6){
    estadoTexto.innerText="🔥 Águila";
    estadoImg.src="img/aguila.png";
  }else if(c>=3){
    estadoTexto.innerText="⚖️ Medio";
    estadoImg.src="img/medio.png";
  }else{
    estadoTexto.innerText="❄️ Balgham";
    estadoImg.src="img/balgham.png";
  }
}
estado();

// 🧠 MENSAJE
function mensaje(){
  let h=new Date().getHours();

  if(h<12) mensaje.innerText="Tonatiuh: Actívate";
  else if(h<18) mensaje.innerText="Tonatiuh: Enfócate";
  else mensaje.innerText="Tonatiuh: Descansa";
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
