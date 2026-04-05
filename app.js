const trabajo = ["WhatsApp","Gmail","Reservas","Gasolina","Cierre","Control"];
const fisico = ["Agua","Respiración","Calistenia","Baño","Desayuno"];
const vida = ["Esposa","Familia","Proyectos"];

/* STORAGE */
function getData(){
  return JSON.parse(localStorage.getItem("aguila"))||{};
}

function saveData(d){
  localStorage.setItem("aguila", JSON.stringify(d));
}

function getFecha(){
  return document.getElementById("fecha").value;
}

function getDia(){
  const data = getData();
  const f = getFecha();

  if(!data[f]){
    data[f]={trabajo:{},fisico:{},vida:{},nota:"",biblia:""};
    saveData(data);
  }

  return data[f];
}

/* RENDER */
function renderGrupo(lista,id,tipo){
  const cont=document.getElementById(id);
  cont.innerHTML="";

  const dia=getDia();

  lista.forEach(item=>{
    const div=document.createElement("div");

    div.innerHTML=`
      <input type="checkbox"
      ${dia[tipo][item]?"checked":""}
      onchange="toggle('${tipo}','${item}')">
      ${item}
    `;

    cont.appendChild(div);
  });
}

/* TOGGLE */
function toggle(tipo,item){
  const data=getData();
  const dia=getDia();

  dia[tipo][item]=!dia[tipo][item];

  data[getFecha()]=dia;
  saveData(data);

  actualizarTodo();
}

/* NOTAS */
function guardarNotas(){
  const data=getData();
  const dia=getDia();

  dia.biblia=document.getElementById("biblia").value;
  dia.nota=document.getElementById("nota").value;

  data[getFecha()]=dia;
  saveData(data);
}

/* PROGRESO */
function calcularProgreso(){
  const dia=getDia();

  let total = trabajo.length + fisico.length + vida.length;
  let done = 0;

  trabajo.forEach(t=>{ if(dia.trabajo[t]) done++; });
  fisico.forEach(f=>{ if(dia.fisico[f]) done++; });
  vida.forEach(v=>{ if(dia.vida[v]) done++; });

  return Math.round((done/total)*100);
}

/* NIVEL */
function getNivel(p){
  if(p<30) return "🧬 Balgham";
  if(p<60) return "⚡ En progreso";
  if(p<85) return "🔥 Fuerte";
  return "🦅 Águila";
}

/* RACHA */
function calcularRacha(){
  const data=getData();
  const fechas=Object.keys(data).sort().reverse();

  let racha=0;

  for(let f of fechas){
    const d=data[f];

    let total = trabajo.length + fisico.length + vida.length;
    let done = 0;

    trabajo.forEach(t=>{ if(d.trabajo[t]) done++; });
    fisico.forEach(h=>{ if(d.fisico[h]) done++; });
    vida.forEach(v=>{ if(d.vida[v]) done++; });

    let p = (done/total)*100;

    if(p>=70) racha++;
    else break;
  }

  document.getElementById("racha").innerText="🔥 "+racha;
}

/* UI */
function actualizarTodo(){
  renderGrupo(trabajo,"trabajo","trabajo");
  renderGrupo(fisico,"fisico","fisico");
  renderGrupo(vida,"vida","vida");

  const p = calcularProgreso();

  document.getElementById("barra").style.width=p+"%";
  document.getElementById("porcentaje").innerText=p+"%";

  document.getElementById("nivel").innerText=getNivel(p);

  calcularRacha();
}

/* INIT */
document.getElementById("fecha").valueAsDate=new Date();
document.getElementById("fecha").addEventListener("change", actualizarTodo);

actualizarTodo();
