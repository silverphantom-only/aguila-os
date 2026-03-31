const DB_KEY = "aguila_pro";

// BASE DE DATOS
let db = JSON.parse(localStorage.getItem(DB_KEY)) || {
    semana:{},
    diario:"",
    gastos:[]
};

function save(){
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// INPUTS
document.querySelectorAll("[data-key]").forEach(el=>{
    let key = el.dataset.key;

    el.value = db.semana[key] || db.diario || "";

    el.oninput = ()=>{
        if(key === "diario"){
            db.diario = el.value;
        } else {
            db.semana[key] = el.value;
        }
        save();
        renderHoy();
    };
});

// HOY
function renderHoy(){
    const dias=["domingo","lunes","martes","miercoles","jueves","viernes","sabado"];
    let hoy = new Date();
    let d = dias[hoy.getDay()];

    document.getElementById("hoyBox").innerText =
        d.toUpperCase()+" "+hoy.getDate()+" → "+(db.semana[d] || "Sin pendientes");
}
renderHoy();

// GASTOS
function addGasto(){
    let m = parseFloat(document.getElementById("monto").value);
    let c = document.getElementById("categoria").value;

    if(!m) return;

    db.gastos.push({monto:m,categoria:c});
    save();
    renderGastos();

    document.getElementById("monto").value="";
    document.getElementById("categoria").value="";
}

function renderGastos(){
    let ul = document.getElementById("gastos");
    ul.innerHTML="";
    let total=0;

    db.gastos.forEach(g=>{
        let li=document.createElement("li");
        li.innerText=g.categoria+" $"+g.monto;
        ul.appendChild(li);
        total+=g.monto;
    });

    document.getElementById("total").innerText=total;
}
renderGastos();

// ESTADO + IMAGEN
function evaluar(){
    let total = db.gastos.length;

    let estado = document.getElementById("estadoDia");
    let img = document.getElementById("estadoImg");

    if(total >= 5){
        estado.innerText="🔥 Águila";
        img.src="img/aguila.png";
    } else if(total >= 2){
        estado.innerText="⚖️ Medio";
        img.src="img/medio.png";
    } else {
        estado.innerText="❄️ Balgham";
        img.src="img/balgham.png";
    }
}
evaluar();

// ENTRENAMIENTO
let fases=["🔥 Activación","💪 Fuerza","⚡ Intensidad"];
let i=0;

function iniciarEntreno(){
    i=0;
    run();
}

function run(){
    if(i>=fases.length){
        document.getElementById("fase").innerText="🔥 TERMINA";
        document.getElementById("timer").innerText="✔";
        return;
    }

    document.getElementById("fase").innerText=fases[i];
    let t=30;

    let int=setInterval(()=>{
        document.getElementById("timer").innerText=t;
        t--;

        if(t<0){
            clearInterval(int);
            i++;
            run();
        }
    },1000);
}

// MUSICA
function abrirMusica(){
    window.open("https://open.spotify.com/search/funk%20workout");
}

// RESET
function resetAll(){
    localStorage.removeItem(DB_KEY);
    location.reload();
}
