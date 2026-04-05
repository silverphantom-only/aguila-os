const checks = ["WhatsApp","Gmail","Reservas","Gasolina","Cierre","Control"];

const bibliaPlan = [
  "Génesis 1:1",
  "Génesis 1:3",
  "Génesis 1:26",
  "Génesis 2:7",
  "Génesis 3:9"
];

/* STORAGE */
function getData(){
  return JSON.parse(localStorage.getItem("aguila"))||{};
}
function saveData(d){
  localStorage.setItem("aguila",JSON.stringify(d));
}

function getFecha(){
  return document.getElementById("fecha").value;
}

function getDia(){
  let data=getData();
  let f=getFecha();

  if(!data[f]){
    data[f]={
      pendientes:[],
      checks:{},
      agua:0,
      disciplina:{},
      biblia:""
    };
    saveData(data);
  }

  return data[f];
}

/* CALENDARIO */
function renderCalendarBar(){
  const bar=document.getElementById("calendarBar");
  bar.innerHTML="";
  let base=new Date(getFecha());

  for(let i=-3;i<=3;i++){
    let d=new Date(base);
    d.setDate(d.getDate()+i);

    let fecha=d.toISOString().split("T")[0];

    let div=document.createElement("div");
    div.className="day";
    if(fecha===getFecha()) div.classList.add("active-day");

    div.innerText=d.getDate();

    div.onclick=()=>{
      fechaInput.value=fecha;
      renderTodo();
    };

    bar.appendChild(div);
  }
}

/* PENDIENTES */
function addPendiente(){
  let data=getData();
  let fecha=pendienteFecha.value;

  if(!data[fecha]){
    data[fecha]={pendientes:[],checks:{},agua:0,disciplina:{}};
  }

  data[fecha].pendientes.push({
    texto:pendienteTexto.value,
    done:false
  });

  saveData(data);
  renderTodo();
}

function renderPendientes(){
  let ul=document.getElementById("listaPendientes");
  ul.innerHTML="";

  getDia().pendientes.forEach((p,i)=>{
    let li=document.createElement("li");

    li.innerHTML=`
      <input type="checkbox" ${p.done?"checked":""} onclick="togglePendiente(${i})">
      ${p.texto}
    `;

    ul.appendChild(li);
  });
}

function togglePendiente(i){
  let dia=getDia();
  dia.pendientes[i].done=!dia.pendientes[i].done;
  save();
}

/* CHECKS */
function renderChecks(){
  let cont=document.getElementById("checks");
  cont.innerHTML="";

  let dia=getDia();

  checks.forEach(c=>{
    cont.innerHTML+=`
      <label>
      <input type="checkbox" ${dia.checks[c]?"checked":""}
      onchange="toggleCheck('${c}')"> ${c}
      </label><br>
    `;
  });
}

function toggleCheck(c){
  let dia=getDia();
  dia.checks[c]=!dia.checks[c];
  save();
}

/* DISCIPLINA */
function toggleDisc(t){
  let dia=getDia();
  dia.disciplina[t]=!dia.disciplina[t];
  save();
}

function sumarAgua(){
  let dia=getDia();
  dia.agua+=250;
  save();
}

/* AGENDA AUTOMÁTICA */
function renderAgendaDia(){
  let ul=document.getElementById("agendaDia");
  ul.innerHTML="";

  let dia=getDia();

  // hábitos automáticos
  let base = [
    "Respiración",
    "Baño caliente",
    "Trabajo",
    "Tiempo familia"
  ];

  base.forEach(t=>{
    let li=document.createElement("li");
    li.innerText=t;
    ul.appendChild(li);
  });

  dia.pendientes.forEach(p=>{
    let li=document.createElement("li");
    li.innerText=p.texto;
    ul.appendChild(li);
  });
}

/* PROGRESO */
function actualizarProgreso(){
  let dia=getDia();

  let total = checks.length + dia.pendientes.length + 4;
  let done = 0;

  checks.forEach(c=>{ if(dia.checks[c]) done++; });
  dia.pendientes.forEach(p=>{ if(p.done) done++; });

  if(dia.disciplina.resp) done++;
  if(dia.disciplina.calistenia) done++;
  if(dia.disciplina.baño) done++;
  if(dia.agua>=2000) done++;

  let p = Math.round((done/total)*100);

  barra.style.width=p+"%";
  porcentaje.innerText=p+"%";

  estado.innerText =
    p<25?"BALGHAM":
    p<50?"MEDIO":
    p<75?"ASCENSO":"ÁGUILA";
}

/* BIBLIA */
function renderBiblia(){
  let index = Object.keys(getData()).indexOf(getFecha());
  let v = bibliaPlan[index % bibliaPlan.length];
  document.getElementById("versiculo").innerText=v;
}

/* SAVE */
function save(){
  let data=getData();
  data[getFecha()]=getDia();
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

  agua.innerText=getDia().agua+" ml";
}

/* INIT */
fecha.valueAsDate=new Date();
fecha.addEventListener("change",renderTodo);

renderTodo();
