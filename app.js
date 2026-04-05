const habits = ["Respiración","Calistenia","Baño","Desayuno"];

let currentDate = new Date();

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
  const data=getData();
  const f=getFecha();

  if(!data[f]){
    data[f]={tasks:[],habits:{}};
    saveData(data);
  }

  return data[f];
}

/* NAV */
function goTo(screen){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(screen).classList.add("active");
}

/* CALENDAR */
function renderCalendar(){
  const cal=document.getElementById("calendar");
  cal.innerHTML="";

  const y=currentDate.getFullYear();
  const m=currentDate.getMonth();

  const first=new Date(y,m,1).getDay();
  const total=new Date(y,m+1,0).getDate();

  const meses=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  document.getElementById("mesTitulo").innerText=meses[m]+" "+y;

  let start = first===0?6:first-1;

  for(let i=0;i<start;i++){
    cal.appendChild(document.createElement("div"));
  }

  for(let d=1;d<=total;d++){
    const fecha=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    const div=document.createElement("div");
    div.className="day";
    div.innerText=d;

    if(fecha===getFecha()) div.classList.add("selected");

    div.onclick=()=>{
      document.getElementById("fecha").value=fecha;
      renderAll();
    };

    cal.appendChild(div);
  }
}

/* TASKS */
function addTask(){
  const input=document.getElementById("inputPendiente");
  if(!input.value) return;

  const data=getData();
  const dia=getDia();

  dia.tasks.push({text:input.value,done:false});
  data[getFecha()]=dia;
  saveData(data);

  input.value="";
  renderAll();
}

function renderTasks(){
  const ul=document.getElementById("lista");
  ul.innerHTML="";

  const dia=getDia();

  dia.tasks.forEach((t,i)=>{
    const li=document.createElement("li");

    li.innerHTML=`
      <input type="checkbox" ${t.done?"checked":""}
      onclick="toggleTask(${i})">
      <span class="${t.done?"done":""}">${t.text}</span>
    `;

    ul.appendChild(li);
  });
}

function toggleTask(i){
  const data=getData();
  const dia=getDia();

  dia.tasks[i].done=!dia.tasks[i].done;
  data[getFecha()]=dia;
  saveData(data);

  renderAll();
}

/* HABITS */
function renderHabits(){
  const cont=document.getElementById("habitosList");
  cont.innerHTML="";

  const dia=getDia();

  habits.forEach(h=>{
    const div=document.createElement("div");

    div.innerHTML=`
      <input type="checkbox" ${dia.habits[h]?"checked":""}
      onclick="toggleHabit('${h}')"> ${h}
    `;

    cont.appendChild(div);
  });
}

function toggleHabit(h){
  const data=getData();
  const dia=getDia();

  dia.habits[h]=!dia.habits[h];
  data[getFecha()]=dia;
  saveData(data);

  renderAll();
}

/* PROGRESS */
function updateProgress(){
  const dia=getDia();

  let total=habits.length + dia.tasks.length;
  let done=0;

  habits.forEach(h=>{ if(dia.habits[h]) done++; });
  dia.tasks.forEach(t=>{ if(t.done) done++; });

  const p = total?Math.round((done/total)*100):0;

  document.getElementById("barra").style.width=p+"%";
  document.getElementById("porcentaje").innerText=p+"%";
}

/* MAIN */
function renderAll(){
  renderCalendar();
  renderTasks();
  renderHabits();
  updateProgress();
}

/* INIT */
document.getElementById("fecha").valueAsDate=new Date();
renderAll();
