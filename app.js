const KEY="aguila_total";

let db=JSON.parse(localStorage.getItem(KEY))||{
  checks:{},
  eventos:[],
  gastos:[]
};

// HORARIO DINÁMICO
let horario=JSON.parse(localStorage.getItem("horario"))||{
  trabajoInicio:9,
  trabajoFin:14,
  trabajo2Inicio:16,
  trabajo2Fin:18
};

function save(){
  localStorage.setItem(KEY,JSON.stringify(db));
}

// HOY + EVENTOS
function renderHoy(){
  let hoy=new Date();
  let fecha=hoy.toISOString().split("T")[0];

  let eventosHoy=db.eventos.filter(e=>e.fecha===fecha);

  let txt=hoy.toLocaleDateString();

  if(eventosHoy.length){
    txt+=" → "+eventosHoy.map(e=>e.evento).join(", ");
  }else{
    txt+=" → Sin pendientes";
  }

  document.getElementById("hoy").innerText=txt;
}
renderHoy();

// CHECKLIST
document.querySelectorAll("[data-check]").forEach(el=>{
  let k=el.dataset.check;
  el.checked=db.checks[k]||false;

  el.onchange=()=>{
    db.checks[k]=el.checked;
    save();
    estado();
    mensaje();
  }
});

// ESTADO
function estado(){
  let c=Object.values(db.checks).filter(v=>v).length;

  let txt=document.getElementById("estadoTexto");
  let img=document.getElementById("estadoImg");

  if(c>=6){
    txt.innerText="🔥 Águila";
    img.src="img/aguila.png";
  }else if(c>=3){
    txt.innerText="⚖️ Medio";
    img.src="img/medio.png";
  }else{
    txt.innerText="❄️ Balgham";
    img.src="img/balgham.png";
  }
}
estado();

// BLOQUE DEL DÍA
function bloqueActual(){
  let h=new Date().getHours();

  if(h<horario.trabajoInicio) return "mañana";
  if(h<horario.trabajoFin) return "trabajo";
  if(h<horario.trabajo2Inicio) return "descanso";
  if(h<horario.trabajo2Fin) return "trabajo2";
  return "noche";
}

// MENSAJE INTELIGENTE
function mensaje(){
  let b=bloqueActual();
  let c=Object.values(db.checks).filter(v=>v).length;

  let msg="";

  if(b==="mañana") msg="Tonatiuh: Actívate. Entrena.";
  else if(b==="trabajo") msg="Tonatiuh: Enfócate.";
  else if(b==="descanso") msg="Tonatiuh: Recupera control.";
  else if(b==="trabajo2") msg="Tonatiuh: Cierra fuerte.";
  else msg="Tonatiuh: Descansa.";

  if(c<=2) msg+=" ⚠️ Bajo";
  if(c>=6) msg+=" 🔥 Águila";

  document.getElementById("mensaje").innerText=msg;
}
mensaje();

// AGENDA
function agregarEvento(){
  let f=fecha.value;
  let e=evento.value;
  if(!f||!e)return;

  db.eventos.push({fecha:f,evento:e});
  save();
  renderEventos();
  renderHoy();

  evento.value="";
}

function renderEventos(){
  let ul=document.getElementById("listaEventos");
  ul.innerHTML="";

  db.eventos.forEach(ev=>{
    let li=document.createElement("li");
    li.innerText=ev.fecha+" → "+ev.evento;
    ul.appendChild(li);
  });
}
renderEventos();

// GASTOS
function addGasto(){
  let m=parseFloat(monto.value);
  let c=categoria.value;
  if(!m)return;

  db.gastos.push({m,c});
  save();
  renderGastos();

  monto.value="";
  categoria.value="";
}

function renderGastos(){
  let ul=document.getElementById("listaGastos");
  ul.innerHTML="";
  let t=0;

  db.gastos.forEach(g=>{
    let li=document.createElement("li");
    li.innerText=g.c+" $"+g.m;
    ul.appendChild(li);
    t+=g.m;
  });

  total.innerText=t;
}
renderGastos();

// ENTRENAMIENTO
let rutina=[
"Rotaciones brazos",
"Flexiones laterales",
"Plancha",
"Fondos tríceps",
"Flexiones diamante",
"Elevaciones piernas"
];

function iniciarRutina(){
  let i=0;

  function run(){
    if(i>=rutina.length){
      ejercicio.innerText="🔥 TERMINADO";
      timer.innerText="";
      return;
    }

    ejercicio.innerText=rutina[i];
    let t=30;

    let int=setInterval(()=>{
      timer.innerText=t;
      t--;

      if(t<0){
        clearInterval(int);
        i++;
        run();
      }
    },1000);
  }

  run();
}

// MUSICA
function musica(){
  window.open("https://open.spotify.com/search/funk%20focus");
}
