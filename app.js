/* ══════════════════════════════════════════════════════════
   ÁGUILA OS — app.js
   ══════════════════════════════════════════════════════════ */

/* ── ESTADO GLOBAL ── */
var fechaActiva; // "YYYY-MM-DD"

/* ── DEFINICIONES ── */
var ACTIVACION_ITEMS = [
  { id: 'respiracion', label: '🌬️ Respiración' },
  { id: 'calistenia',  label: '💪 Calistenia'  },
  { id: 'desayuno',    label: '🍳 Desayuno'     }
];

var SALUD_ITEMS = [
  { id: 'fluoxetina',  label: '💊 Tomé fluoxetina' },
  { id: 'hidratacion', label: '💧 Hidratación'      }
];

var TRABAJO_ITEMS = [
  { id: 'whatsapp', label: '💬 WhatsApp'  },
  { id: 'gmail',    label: '📧 Gmail'     },
  { id: 'reservas', label: '📋 Reservas'  },
  { id: 'gasolina', label: '⛽ Gasolina'  },
  { id: 'cierre',   label: '🔒 Cierre'    },
  { id: 'control',  label: '📊 Control'   }
];

var VIDA_ITEMS = [
  { id: 'esposa',  label: '👫 Tiempo con esposa' },
  { id: 'familia', label: '👨‍👩‍👧 Familia'           },
  { id: 'social',  label: '🤝 Social'             }
];

var MODOS = {
  manana:  { icon: '🌅', label: 'Modo Mañana',  msg: 'Activa tu cuerpo y mente' },
  trabajo: { icon: '💼', label: 'Modo Trabajo',  msg: 'Enfoca tu energía laboral' },
  noche:   { icon: '🌙', label: 'Modo Noche',    msg: 'Estudia y reflexiona' },
  dia:     { icon: '☀️', label: 'Modo Día',      msg: 'Mantén el ritmo' }
};

var ESTADOS = [
  { min: 0,  icon: '❄️', label: 'Balgham', sub: 'Activa tus hábitos del día',     cls: '' },
  { min: 35, icon: '⚖️', label: 'Medio',   sub: 'Buen avance, sigue adelante',     cls: '' },
  { min: 70, icon: '🦅', label: 'Águila',  sub: '¡Modo Águila activado!',          cls: 'aguila' }
];

/* ══════════════════════════════════════════════════════════
   UTILIDADES DE FECHA (sin bugs de zona horaria)
   ══════════════════════════════════════════════════════════ */

function pad(n) { return String(n).padStart(2, '0'); }

function hoy() {
  var d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function fechaDesdeISO(iso) {
  var p = iso.split('-');
  return new Date(+p[0], +p[1] - 1, +p[2], 12, 0, 0);
}

function formatearFecha(iso) {
  var d = fechaDesdeISO(iso);
  var dias   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  var meses  = ['enero','febrero','marzo','abril','mayo','junio',
                'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return dias[d.getDay()] + ', ' + d.getDate() + ' de ' + meses[d.getMonth()] + ' ' + d.getFullYear();
}

/* ══════════════════════════════════════════════════════════
   LOCALSTORAGE
   ══════════════════════════════════════════════════════════ */

function guardar(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch(e) {}
}

function obtener(clave, porDefecto) {
  try {
    var raw = localStorage.getItem(clave);
    return raw !== null ? JSON.parse(raw) : porDefecto;
  } catch(e) { return porDefecto; }
}

// Helpers para datos por fecha
function getDia(seccion) {
  var all = obtener('aguila_' + seccion, {});
  return all[fechaActiva] || {};
}

function setDia(seccion, data) {
  var all = obtener('aguila_' + seccion, {});
  all[fechaActiva] = data;
  guardar('aguila_' + seccion, all);
}

function getGlobal(clave, porDefecto) {
  return obtener('aguila_' + clave, porDefecto);
}

function setGlobal(clave, valor) {
  guardar('aguila_' + clave, valor);
}

/* ══════════════════════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════════════════════ */

var _tt = null;
function toast(msg) {
  var el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_tt);
  _tt = setTimeout(function() { el.classList.remove('show'); }, 2400);
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══════════════════════════════════════════════════════════
   RENDER GLOBAL
   ══════════════════════════════════════════════════════════ */

function renderTodo() {
  renderFecha();
  renderActivacion();
  renderSalud();
  renderAgua();
  renderPendientes();
  renderAgenda();
  renderTrabajo();
  renderProyectos();
  renderVida();
  renderBibliaSaved();
  renderEstado();
  renderModo();
}

/* ══════════════════════════════════════════════════════════
   FECHA
   ══════════════════════════════════════════════════════════ */

function renderFecha() {
  var dd = document.getElementById('dateDisplay');
  var di = document.getElementById('dateInput');
  if (dd) dd.textContent = formatearFecha(fechaActiva);
  if (di) di.value = fechaActiva;
}

function onFechaChange() {
  var di = document.getElementById('dateInput');
  if (di && di.value) {
    fechaActiva = di.value;
    renderTodo();
  }
}

/* ══════════════════════════════════════════════════════════
   MODO AUTOMÁTICO
   ══════════════════════════════════════════════════════════ */

function renderModo() {
  var h    = new Date().getHours();
  var modo;
  if (h >= 5  && h < 10) modo = MODOS.manana;
  else if (h >= 10 && h < 19) modo = MODOS.trabajo;
  else if (h >= 19 || h < 5)  modo = MODOS.noche;
  else modo = MODOS.dia;

  var el = document.getElementById('modePill');
  if (el) el.textContent = modo.icon + ' ' + modo.label;
}

/* ══════════════════════════════════════════════════════════
   CHECKLIST GENÉRICO
   ══════════════════════════════════════════════════════════ */

function renderChecklist(ulId, items, seccion, onChange) {
  var ul = document.getElementById(ulId);
  if (!ul) return;
  var state = getDia(seccion);
  ul.innerHTML = '';

  if (items.length === 0) {
    ul.innerHTML = '<li class="empty-msg">Sin elementos</li>';
    return;
  }

  items.forEach(function(item) {
    var checked = !!state[item.id];
    var li = document.createElement('li');
    li.className = 'check-item' + (checked ? ' done-bg' : '');

    var cb = document.createElement('input');
    cb.type = 'checkbox'; cb.className = 'check-cb'; cb.checked = checked;
    cb.addEventListener('change', function() {
      var s = getDia(seccion);
      s[item.id] = !s[item.id];
      setDia(seccion, s);
      renderChecklist(ulId, items, seccion, onChange);
      if (onChange) onChange();
    });

    var lbl = document.createElement('label');
    lbl.className = 'check-label'; lbl.textContent = item.label;

    li.appendChild(cb);
    li.appendChild(lbl);
    ul.appendChild(li);
  });
}

function renderActivacion() {
  renderChecklist('activacionList', ACTIVACION_ITEMS, 'activacion', renderEstado);
}

function renderSalud() {
  renderChecklist('saludList', SALUD_ITEMS, 'salud', null);
}

function renderTrabajo() {
  renderChecklist('trabajoList', TRABAJO_ITEMS, 'trabajo', renderEstado);
}

function renderVida() {
  renderChecklist('vidaList', VIDA_ITEMS, 'vida', renderEstado);
}

/* ══════════════════════════════════════════════════════════
   AGUA
   ══════════════════════════════════════════════════════════ */

function getAgua() {
  var all = obtener('aguila_agua', {});
  return all[fechaActiva] || 0;
}

function setAgua(ml) {
  var all = obtener('aguila_agua', {});
  all[fechaActiva] = ml;
  guardar('aguila_agua', all);
}

function sumarAgua(ml) {
  setAgua(getAgua() + ml);
  renderAgua();
  toast('💧 +' + ml + ' ml');
}

function resetAgua() {
  setAgua(0);
  renderAgua();
  toast('Agua reiniciada');
}

function renderAgua() {
  var total = getAgua();
  var META  = 2000;
  var pct   = Math.min(Math.round((total / META) * 100), 100);
  var done  = total >= META;

  var amt  = document.getElementById('aguaAmount');
  var bar  = document.getElementById('aguaBar');
  var pctE = document.getElementById('aguaPct');

  if (amt)  amt.textContent  = total + ' ml';
  if (bar)  bar.style.width  = pct + '%';
  if (pctE) pctE.textContent = pct + '% — ' + (done ? '¡Meta alcanzada! ✅' : (META - total) + ' ml restantes');

  if (bar) {
    if (done) { bar.className = 'progress-bar progress-bar--green'; }
    else      { bar.className = 'progress-bar'; }
  }
}

/* ══════════════════════════════════════════════════════════
   PENDIENTES
   ══════════════════════════════════════════════════════════ */

function agregarPendiente() {
  var inp = document.getElementById('pendienteInput');
  if (!inp) return;
  var texto = inp.value.trim();
  if (!texto) { toast('Escribe una tarea'); return; }

  var list = getDia('pendientes');
  if (!list.items) list.items = [];

  // evitar duplicados exactos
  for (var i = 0; i < list.items.length; i++) {
    if (list.items[i].texto.toLowerCase() === texto.toLowerCase()) {
      toast('Ya existe esa tarea'); return;
    }
  }

  list.items.push({ id: Date.now(), texto: texto, done: false });
  setDia('pendientes', list);
  inp.value = '';
  renderPendientes();
  renderEstado();
  toast('Tarea agregada ✓');
}

function togglePendiente(id) {
  var list = getDia('pendientes');
  if (!list.items) return;
  for (var i = 0; i < list.items.length; i++) {
    if (list.items[i].id === id) { list.items[i].done = !list.items[i].done; break; }
  }
  setDia('pendientes', list);
  renderPendientes();
  renderEstado();
}

function eliminarPendiente(id) {
  var list = getDia('pendientes');
  if (!list.items) return;
  list.items = list.items.filter(function(t) { return t.id !== id; });
  setDia('pendientes', list);
  renderPendientes();
  renderEstado();
  toast('Tarea eliminada');
}

function renderPendientes() {
  var ul = document.getElementById('pendientesList');
  if (!ul) return;
  var list = getDia('pendientes');
  var items = list.items || [];
  ul.innerHTML = '';

  if (items.length === 0) {
    ul.innerHTML = '<li class="empty-msg">Sin pendientes</li>';
    return;
  }

  items.forEach(function(t) {
    var li = document.createElement('li');
    li.className = 'check-item' + (t.done ? ' done-bg' : '');

    var cb = document.createElement('input');
    cb.type = 'checkbox'; cb.className = 'check-cb'; cb.checked = t.done;
    (function(tid) {
      cb.addEventListener('change', function() { togglePendiente(tid); });
    })(t.id);

    var lbl = document.createElement('label');
    lbl.className = 'check-label' + (t.done ? ' done' : '');
    lbl.textContent = t.texto;

    var del = document.createElement('button');
    del.className = 'btn btn-danger check-del'; del.textContent = '✕';
    (function(tid) {
      del.addEventListener('click', function() { eliminarPendiente(tid); });
    })(t.id);

    li.appendChild(cb); li.appendChild(lbl); li.appendChild(del);
    ul.appendChild(li);
  });
}

/* ══════════════════════════════════════════════════════════
   AGENDA
   ══════════════════════════════════════════════════════════ */

function agregarAgenda() {
  var horaEl  = document.getElementById('agendaHora');
  var textoEl = document.getElementById('agendaTexto');
  if (!horaEl || !textoEl) return;

  var hora  = horaEl.value.trim();
  var texto = textoEl.value.trim();
  if (!hora)  { toast('Selecciona una hora');  return; }
  if (!texto) { toast('Escribe la actividad'); return; }

  var agenda = getDia('agenda');
  if (!agenda.items) agenda.items = [];

  // Evitar duplicado exacto
  for (var i = 0; i < agenda.items.length; i++) {
    if (agenda.items[i].hora === hora && agenda.items[i].texto.toLowerCase() === texto.toLowerCase()) {
      toast('Ya existe ese evento'); return;
    }
  }

  agenda.items.push({ id: Date.now(), hora: hora, texto: texto });
  agenda.items.sort(function(a, b) { return a.hora > b.hora ? 1 : -1; });
  setDia('agenda', agenda);
  horaEl.value  = '';
  textoEl.value = '';
  renderAgenda();
  toast('Evento agregado 📋');
}

function eliminarAgenda(id) {
  var agenda = getDia('agenda');
  if (!agenda.items) return;
  agenda.items = agenda.items.filter(function(e) { return e.id !== id; });
  setDia('agenda', agenda);
  renderAgenda();
  toast('Evento eliminado');
}

function renderAgenda() {
  var ul = document.getElementById('agendaList');
  if (!ul) return;
  var agenda = getDia('agenda');
  var items  = agenda.items || [];
  ul.innerHTML = '';

  if (items.length === 0) {
    ul.innerHTML = '<li class="empty-msg">Sin eventos agendados</li>';
    return;
  }

  items.forEach(function(ev) {
    var li = document.createElement('li');
    li.className = 'agenda-item';

    var hora = document.createElement('span');
    hora.className = 'agenda-hora'; hora.textContent = ev.hora;

    var txt = document.createElement('span');
    txt.className = 'agenda-texto'; txt.textContent = ev.texto;

    var del = document.createElement('button');
    del.className = 'btn btn-danger'; del.textContent = '✕';
    (function(eid) {
      del.addEventListener('click', function() { eliminarAgenda(eid); });
    })(ev.id);

    li.appendChild(hora); li.appendChild(txt); li.appendChild(del);
    ul.appendChild(li);
  });
}

/* ══════════════════════════════════════════════════════════
   PROYECTOS (global)
   ══════════════════════════════════════════════════════════ */

function agregarProyecto() {
  var inp = document.getElementById('proyectoInput');
  if (!inp) return;
  var texto = inp.value.trim();
  if (!texto) { toast('Escribe el nombre del proyecto'); return; }

  var proyectos = getGlobal('proyectos', []);
  for (var i = 0; i < proyectos.length; i++) {
    if (proyectos[i].nombre.toLowerCase() === texto.toLowerCase()) {
      toast('Ya existe ese proyecto'); return;
    }
  }

  proyectos.push({ id: Date.now(), nombre: texto });
  setGlobal('proyectos', proyectos);
  inp.value = '';
  renderProyectos();
  toast('Proyecto agregado 🚀');
}

function eliminarProyecto(id) {
  var proyectos = getGlobal('proyectos', []).filter(function(p) { return p.id !== id; });
  setGlobal('proyectos', proyectos);
  renderProyectos();
  toast('Proyecto eliminado');
}

function renderProyectos() {
  var ul = document.getElementById('proyectosList');
  if (!ul) return;
  var proyectos = getGlobal('proyectos', []);
  ul.innerHTML = '';

  if (proyectos.length === 0) {
    ul.innerHTML = '<li class="empty-msg">Sin proyectos activos</li>';
    return;
  }

  proyectos.forEach(function(p) {
    var li = document.createElement('li');
    li.className = 'proyecto-item';

    var dot = document.createElement('span');
    dot.className = 'proyecto-dot';

    var name = document.createElement('span');
    name.className = 'proyecto-name'; name.textContent = p.nombre;

    var del = document.createElement('button');
    del.className = 'btn btn-danger'; del.textContent = '✕';
    (function(pid) {
      del.addEventListener('click', function() { eliminarProyecto(pid); });
    })(p.id);

    li.appendChild(dot); li.appendChild(name); li.appendChild(del);
    ul.appendChild(li);
  });
}

/* ══════════════════════════════════════════════════════════
   ESTUDIO BÍBLICO
   ══════════════════════════════════════════════════════════ */

function guardarBiblia() {
  var campos = ['Versiculo','Observacion','Interpretacion','Contexto','Aplicacion','Reflexion'];
  var data   = {};
  var versiculo = document.getElementById('bibliaVersiculo');

  campos.forEach(function(c) {
    var el = document.getElementById('biblia' + c);
    if (el) data[c.toLowerCase()] = el.value.trim();
  });

  if (!data.versiculo) { toast('Ingresa el versículo'); return; }

  setDia('biblia', data);
  renderBibliaSaved();
  renderEstado();
  toast('Estudio guardado 📖');
}

function renderBibliaSaved() {
  var savedEl = document.getElementById('bibliaSaved');
  var data    = getDia('biblia');

  if (!data.versiculo) {
    if (savedEl) savedEl.textContent = '';
    return;
  }

  // Rellenar campos con datos guardados
  var campos = ['Versiculo','Observacion','Interpretacion','Contexto','Aplicacion','Reflexion'];
  campos.forEach(function(c) {
    var el = document.getElementById('biblia' + c);
    if (el && data[c.toLowerCase()]) el.value = data[c.toLowerCase()];
  });

  if (savedEl) savedEl.textContent = '✓ Guardado: ' + data.versiculo;
}

/* ══════════════════════════════════════════════════════════
   ESTADO ÁGUILA
   ══════════════════════════════════════════════════════════ */

function calcularPct() {
  var checks = 0;
  var total  = 0;

  // Activación (3 items)
  var act = getDia('activacion');
  ACTIVACION_ITEMS.forEach(function(it) { total++; if (act[it.id]) checks++; });

  // Trabajo (6 items)
  var trab = getDia('trabajo');
  TRABAJO_ITEMS.forEach(function(it) { total++; if (trab[it.id]) checks++; });

  // Vida personal (3 items)
  var vida = getDia('vida');
  VIDA_ITEMS.forEach(function(it) { total++; if (vida[it.id]) checks++; });

  // Pendientes: contar completados vs total
  var pend  = getDia('pendientes');
  var pitems = pend.items || [];
  if (pitems.length > 0) {
    total += pitems.length;
    pitems.forEach(function(t) { if (t.done) checks++; });
  }

  // Estudio bíblico (cuenta como 3 puntos si tiene versículo)
  var bib = getDia('biblia');
  if (bib.versiculo) { checks += 3; total += 3; }

  return total > 0 ? Math.round((checks / total) * 100) : 0;
}

function renderEstado() {
  var pct   = calcularPct();
  var nivel = ESTADOS[0];
  for (var i = ESTADOS.length - 1; i >= 0; i--) {
    if (pct >= ESTADOS[i].min) { nivel = ESTADOS[i]; break; }
  }

  // Header badge
  var hi = document.getElementById('estadoIcon');
  var hl = document.getElementById('estadoLabel');
  if (hi) hi.textContent = nivel.icon;
  if (hl) hl.textContent = nivel.label;

  // Card estado
  var bi  = document.getElementById('estadoBigIcon');
  var bl  = document.getElementById('estadoBigLabel');
  var bs  = document.getElementById('estadoSub');
  var bar = document.getElementById('estadoBar');
  var pt  = document.getElementById('estadoPct');

  if (bi) { bi.textContent = nivel.icon; bi.className = 'estado-big-icon' + (nivel.cls ? ' ' + nivel.cls : ''); }
  if (bl) bl.textContent   = nivel.label;
  if (bs) bs.textContent   = nivel.sub;
  if (bar) {
    bar.style.width = pct + '%';
    if (pct >= 70) bar.className = 'progress-bar progress-bar--green';
    else if (pct >= 35) bar.className = 'progress-bar progress-bar--gold';
    else bar.className = 'progress-bar';
  }
  if (pt) pt.textContent = pct + '% del día completado';
}

/* ══════════════════════════════════════════════════════════
   EVENTOS DEL DOM
   ══════════════════════════════════════════════════════════ */

function setupEventos() {
  var di = document.getElementById('dateInput');
  if (di) di.addEventListener('change', onFechaChange);

  var pendIn = document.getElementById('pendienteInput');
  if (pendIn) {
    pendIn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') agregarPendiente();
    });
  }

  var proyIn = document.getElementById('proyectoInput');
  if (proyIn) {
    proyIn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') agregarProyecto();
    });
  }

  var agTx = document.getElementById('agendaTexto');
  if (agTx) {
    agTx.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') agregarAgenda();
    });
  }
}

/* ══════════════════════════════════════════════════════════
   SERVICE WORKER
   ══════════════════════════════════════════════════════════ */

function registrarSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(function(reg) {
      console.log('SW registrado:', reg.scope);
    }).catch(function(err) {
      console.warn('SW error:', err);
    });
  }
}

/* ══════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════ */

function init() {
  fechaActiva = hoy();
  setupEventos();
  renderTodo();
  registrarSW();

  // Actualizar modo cada minuto
  setInterval(renderModo, 60000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
