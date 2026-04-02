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

/* FECHA CORRECTA */
function getFechaLocal(date = new Date()) {
  let d = new Date(date);
  d.setHours(12,0,0,0);
  return d.toISOString().split('T')[0];
}

let fechaSeleccionada = getFechaLocal();

/* SEMANA */
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

/* TEXTO DÍA */
function mostrarFecha(){
  let p=fechaSeleccionada.split("-");
  let f=new Date(p[0],p[1]-1,p[2]);

  fechaTexto.innerText=f.toLocaleDateString("es-MX",{
    weekday:"long",
    day:"numeric",
    month:"long"
  });
}

/* EVENTOS */
function renderDia(){
  hoy.innerHTML="";

  let eventos=db.eventos.filter(e=>e.fecha===fechaSeleccionada);

  if(eventos.length){
    eventos.forEach(ev=>{
      let div=document.createElement("div");

      div.innerHTML=`
      <label>
      <span>${ev.hora} ${ev.evento}</span>
      <input type="checkbox" ${ev.done?"checked":""}
      onclick="toggleEvento('${ev.id}')">
      </label>`;

      hoy.appendChild(div);
    });
  }else{
    hoy.innerText="Sin pendientes";
  }
}

function toggleEvento(id){
  let ev=db.eventos.find(e=>e.id==id);
  ev.done=!ev.done;
  save();
}

/* AGREGAR EVENTO */
function agregarEvento(){
  if(!fecha.value||!hora.value||!evento.value)return;

  db.eventos.push({
    id:Date.now(),
    fecha:fecha.value,
    hora:hora.value,
    evento:evento.value,
    done:false
  });

  save();
  renderDia();
}

/* CHECKLIST */
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

/* ESTADO PRO */
function estado(){
  let c=Object.values(db.checks).filter(v=>v).length;

  estadoCard.className="card";

  if(c>=6){
    estadoTexto.innerText="🔥 Águila";
    estadoImg.src="aguila.png";
    estadoCard.classList.add("aguila");
  }else if(c>=3){
    estadoTexto.innerText="⚖️ Medio";
    estadoImg.src="medio.png";
    estadoCard.classList.add("medio");
  }else{
    estadoTexto.innerText="❄️ Balgham";
    estadoImg.src="balgham.png";
    estadoCard.classList.add("balgham");
  }
}

estado();

/* MENSAJE */
function mensaje(){
  let h=new Date().getHours();

  if(h<12) mensaje.innerText="Actívate";
  else if(h<18) mensaje.innerText="Enfócate";
  else mensaje.innerText="Descansa";
}

mensaje();

/* AGUA */
function agregarAgua(){
  db.agua+=250;
  save();
  agua.innerText=db.agua+" ml";
}

agua.innerText=db.agua+" ml";

/* GASTOS */
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

/* INIT */
generarSemana();
mostrarFecha();
renderDia();
streak.innerText=db.streak;
