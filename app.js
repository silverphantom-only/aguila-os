const KEY="aguila_final";

let db=JSON.parse(localStorage.getItem(KEY))||{
    semana:{},
    diario:"",
    gastos:[],
    checks:{},
    agua:0
};

function save(){
    localStorage.setItem(KEY,JSON.stringify(db));
}

// HOY
const dias=["domingo","lunes","martes","miercoles","jueves","viernes","sabado"];
let hoy=new Date();
document.getElementById("hoy").innerText=
dias[hoy.getDay()].toUpperCase()+" "+hoy.getDate();

// INPUTS
document.querySelectorAll("[data-key]").forEach(el=>{
    let k=el.dataset.key;
    el.value=db[k]||db.semana[k]||"";

    el.oninput=()=>{
        if(k==="diario") db.diario=el.value;
        else db.semana[k]=el.value;
        save();
    }
});

// CHECKLIST
document.querySelectorAll("[data-check]").forEach(el=>{
    let k=el.dataset.check;
    el.checked=db.checks[k]||false;

    el.onchange=()=>{
        db.checks[k]=el.checked;
        save();
        estado();
    }
});

// ESTADO
function estado(){
    let total=Object.values(db.checks).filter(v=>v).length;
    let txt=document.getElementById("estadoTexto");
    let img=document.getElementById("estadoImg");

    if(total>=6){
        txt.innerText="🔥 Águila";
        img.src="aguila.png";
    }else if(total>=3){
        txt.innerText="⚖️ Medio";
        img.src="medio.png";
    }else{
        txt.innerText="❄️ Balgham";
        img.src="balgham.png";
    }
}
estado();

// GASTOS
function addGasto(){
    let m=parseFloat(monto.value);
    let c=categoria.value;
    if(!m)return;

    db.gastos.push({m,c});
    save();
    render();

    monto.value="";
    categoria.value="";
}

function render(){
    let ul=document.getElementById("lista");
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
render();

// AGUA
function sumarAgua(){
    db.agua+=250;
    save();
    document.getElementById("agua").innerText=db.agua+" ml";
}
function resetAgua(){
    db.agua=0;
    save();
    document.getElementById("agua").innerText="0 ml";
}

// ENTRENAMIENTO
let fases=["Activación","Fuerza","Intensidad"];
function entreno(){
    let i=0;
    function run(){
        if(i>=fases.length){
            fase.innerText="✔";
            timer.innerText="";
            return;
        }
        fase.innerText=fases[i];
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
    window.open("https://open.spotify.com/search/funk%20workout");
}

// RESET
function reset(){
    localStorage.clear();
    location.reload();
}
