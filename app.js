/* ============================================================
   ÁGUILA OS — app.js
   fechaSeleccionada: YYYY-MM-DD en todo el código.
   fechaISO() como única fuente de verdad para fechas.
   ============================================================ */

/* ─── ÚNICA VARIABLE GLOBAL DE ESTADO ─── */
let fechaSeleccionada; // YYYY-MM-DD

/* ─── CONSTANTES ─── */
const DIAS_ES  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio',
                  'julio','agosto','septiembre','octubre','noviembre','diciembre'];

const CHECKLIST_ITEMS = [
  '🌅 Despertar temprano',
  '💧 Tomar agua al levantarse',
  '🏋️ Ejercicio / movimiento',
  '📖 Lectura o aprendizaje',
  '🧘 Meditación / respiración',
  '🍏 Comer bien',
  '📵 Sin redes sociales por 1h',
  '🌙 Dormir a tiempo',
];

const WORK_ITEMS = [
  { id: 'whatsapp', label: '💬 WhatsApp'  },
  { id: 'gmail',    label: '📧 Gmail'     },
  { id: 'reservas', label: '📋 Reservas'  },
  { id: 'gasolina', label: '⛽ Gasolina'  },
  { id: 'cierre',   label: '🔒 Cierre'    },
  { id: 'control',  label: '📊 Control'   },
];

const EAGLE_LEVELS = [
  { min: 0, icon: '❄️', label: 'Bajo',   sub: 'Empieza completando tareas del checklist', cls: '' },
  { min: 3, icon: '⚖️', label: 'Medio',  sub: 'Buen avance — sigue empujando',            cls: '' },
  { min: 6, icon: '🦅', label: 'Águila', sub: '¡Modo Águila activado! Racha imparable',   cls: 'aguila' },
];

/* ============================================================
   UTILIDADES DE FECHA
   Regla única: fechaISO() devuelve YYYY-MM-DD sin bugs de zona horaria.
   dateFromISO() convierte YYYY-MM-DD → objeto Date al mediodía local.
   ============================================================ */

function fechaISO(date) {
  const d = date ? new Date(date) : new Date();
  d.setHours(12, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

// Crea un Date al mediodía desde "YYYY-MM-DD" (sin conversión UTC)
function dateFromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

function hoy() {
  return fechaISO();
}

function pad(n) {
  return String(n).padStart(2, '0');
}

/* ============================================================
   LOCALSTORAGE
   ============================================================ */

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

/* ============================================================
   TOAST
   ============================================================ */

let _toastTimer = null;

function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

/* ============================================================
   SEGURIDAD
   ============================================================ */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ============================================================
   RENDER GLOBAL — único punto de sincronización
   ============================================================ */

function renderTodo() {
  renderSemana();
  renderDia();
  renderEventos();
  renderNotas();
  renderChecklist();
  renderTrabajo();
  renderWater();
  renderExpenses();
  renderStreak();
}

/* ============================================================
   SEMANA
   ============================================================ */

function renderSemana() {
  const grid = document.getElementById('weekGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const todayISO  = hoy();
  const selDate   = dateFromISO(fechaSeleccionada);
  const dow       = selDate.getDay(); // 0 = domingo

  // Primer día de la semana (domingo)
  const inicio = new Date(selDate);
  inicio.setDate(selDate.getDate() - dow);

  const eventos          = load('aguilaEvents', []);
  const diasConEventos   = new Set(eventos.map(e => e.fecha));

  for (let i = 0; i < 7; i++) {
    const dia = new Date(inicio);
    dia.setDate(inicio.getDate() + i);

    const iso = `${dia.getFullYear()}-${pad(dia.getMonth() + 1)}-${pad(dia.getDate())}`;

    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (iso === todayISO)          cell.classList.add('today');
    if (iso === fechaSeleccionada) cell.classList.add('selected', 'activo');
    if (diasConEventos.has(iso))   cell.classList.add('has-events');

    cell.innerHTML = `
      <span class="day-abbr">${DIAS_ES[dia.getDay()]}</span>
      <span class="day-num">${dia.getDate()}</span>
      <span class="day-dot"></span>
    `;

    // Capturar iso en closure correctamente
    (function(isoCapturado) {
      cell.addEventListener('click', function() {
        fechaSeleccionada = isoCapturado;
        renderTodo();
      });
    })(iso);

    grid.appendChild(cell);
  }
}

/* ============================================================
   VISTA DEL DÍA
   ============================================================ */

function renderDia() {
  const d    = dateFromISO(fechaSeleccionada);
  const diaN = document.getElementById('dayName');
  const diaF = document.getElementById('dayFullDate');
  const btn  = document.getElementById('streakBtn');

  if (diaN) diaN.textContent = DIAS_ES[d.getDay()].toUpperCase();
  if (diaF) diaF.textContent =
    `${d.getDate()} de ${MESES_ES[d.getMonth()]} de ${d.getFullYear()}`;

  // Sincronizar el input date del formulario de eventos
  const evDate = document.getElementById('eventDate');
  if (evDate) evDate.value = fechaSeleccionada;

  // Botón racha
  const streak     = load('aguilaStreak', { count: 0, lastDate: '' });
  const marcadoHoy = fechaSeleccionada === hoy() && streak.lastDate === hoy();
  if (btn) {
    btn.textContent = marcadoHoy ? '✅ Día marcado' : '✅ Marcar día';
    btn.classList.toggle('done', marcadoHoy);
  }
}

/* ============================================================
   RACHA / STREAK
   ============================================================ */

function registerStreak() {
  const todayISO = hoy();
  if (fechaSeleccionada !== todayISO) {
    showToast('Solo puedes marcar el día de hoy 🗓');
    return;
  }

  const streak = load('aguilaStreak', { count: 0, lastDate: '' });
  if (streak.lastDate === todayISO) {
    showToast('¡Ya marcaste hoy! 🔥');
    return;
  }

  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const ayerISO   = fechaISO(ayer);
  const newCount  = streak.lastDate === ayerISO ? streak.count + 1 : 1;

  save('aguilaStreak', { count: newCount, lastDate: todayISO });
  renderStreak();
  renderDia();
  showToast(`🔥 Racha: ${newCount} día${newCount > 1 ? 's' : ''}`);
}

function renderStreak() {
  const el = document.getElementById('streakCount');
  if (!el) return;
  el.textContent = load('aguilaStreak', { count: 0, lastDate: '' }).count;
}

/* ============================================================
   EVENTOS
   Storage: aguilaEvents = [{ id, fecha, hora, texto, done }]
   fecha: YYYY-MM-DD
   ============================================================ */

function addEvent() {
  const dateEl = document.getElementById('eventDate');
  const timeEl = document.getElementById('eventTime');
  const textEl = document.getElementById('eventText');
  if (!dateEl || !timeEl || !textEl) return;

  const fecha = dateEl.value.trim();
  const hora  = timeEl.value.trim();
  const texto = textEl.value.trim();

  if (!fecha) { showToast('Selecciona una fecha 📅'); return; }
  if (!hora)  { showToast('Selecciona una hora ⏰');  return; }
  if (!texto) { showToast('Escribe la descripción 📝'); return; }

  const eventos = load('aguilaEvents', []);
  const dup = eventos.some(
    e => e.fecha === fecha &&
         e.hora  === hora  &&
         e.texto.toLowerCase() === texto.toLowerCase()
  );
  if (dup) { showToast('Ese evento ya existe 🚫'); return; }

  eventos.push({ id: Date.now(), fecha, hora, texto, done: false });
  save('aguilaEvents', eventos);

  timeEl.value = '';
  textEl.value = '';

  renderEventos();
  renderSemana();
  showToast('Evento agregado 🗂');
}

function toggleEvento(id) {
  const eventos = load('aguilaEvents', []);
  const ev      = eventos.find(e => e.id === id);
  if (!ev) return;
  ev.done = !ev.done;
  save('aguilaEvents', eventos);
  renderEventos();
}

function eliminarEvento(id) {
  save('aguilaEvents', load('aguilaEvents', []).filter(e => e.id !== id));
  renderEventos();
  renderSemana();
  showToast('Evento eliminado 🗑');
}

function renderEventos() {
  const list = document.getElementById('eventList');
  if (!list) return;
  list.innerHTML = '';

  const eventos = load('aguilaEvents', [])
    .filter(e => e.fecha === fechaSeleccionada)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  if (eventos.length === 0) {
    const p = document.createElement('p');
    p.className   = 'empty-msg';
    p.textContent = 'Sin eventos para este día';
    list.appendChild(p);
    return;
  }

  eventos.forEach(function(ev) {
    const li = document.createElement('li');
    li.className = 'event-item' + (ev.done ? ' done' : '');

    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.className = 'event-cb'; cb.checked = !!ev.done;
    cb.addEventListener('change', function() { toggleEvento(ev.id); });

    const horaSpan = document.createElement('span');
    horaSpan.className = 'event-time'; horaSpan.textContent = ev.hora;

    const txSpan = document.createElement('span');
    txSpan.className = 'event-text'; txSpan.textContent = ev.texto;

    const del = document.createElement('button');
    del.className = 'btn btn-icon'; del.title = 'Eliminar'; del.textContent = '✕';
    del.addEventListener('click', function() { eliminarEvento(ev.id); });

    li.appendChild(cb); li.appendChild(horaSpan);
    li.appendChild(txSpan); li.appendChild(del);
    list.appendChild(li);
  });
}

/* ============================================================
   NOTAS DEL DÍA
   Storage: aguilaNotes = { "YYYY-MM-DD": "texto" }
   ============================================================ */

function saveNotes() {
  const ta = document.getElementById('dayNotes');
  if (!ta) return;
  const notes = load('aguilaNotes', {});
  const texto = ta.value;
  if (texto.trim() === '') { delete notes[fechaSeleccionada]; }
  else { notes[fechaSeleccionada] = texto; }
  save('aguilaNotes', notes);
}

function renderNotas() {
  const ta = document.getElementById('dayNotes');
  if (!ta) return;
  ta.value = (load('aguilaNotes', {}))[fechaSeleccionada] || '';
}

/* ============================================================
   CHECKLIST DIARIO (global, no por día)
   Storage: aguilaChecklist = { "0": true, "1": false, … }
   ============================================================ */

function renderChecklist() {
  const ul = document.getElementById('checklist');
  if (!ul) return;
  const state = load('aguilaChecklist', {});
  ul.innerHTML = '';

  CHECKLIST_ITEMS.forEach(function(label, i) {
    const checked = !!state[i];
    const li  = document.createElement('li');
    li.className = 'check-item' + (checked ? ' checked' : '');

    const cb  = document.createElement('input');
    cb.type = 'checkbox'; cb.className = 'check-cb';
    cb.id = 'chk-' + i; cb.checked = checked;
    cb.addEventListener('change', function() { toggleCheck(i); });

    const lbl = document.createElement('label');
    lbl.className = 'check-label'; lbl.htmlFor = 'chk-' + i; lbl.textContent = label;

    li.appendChild(cb); li.appendChild(lbl);
    ul.appendChild(li);
  });

  updateEagleState();
}

function toggleCheck(index) {
  const state = load('aguilaChecklist', {});
  state[index] = !state[index];
  save('aguilaChecklist', state);
  renderChecklist();
}

/* ============================================================
   CHECKLIST DE TRABAJO
   Solo Lun–Sáb. Estado guardado por día.
   Storage: aguilaWork = { "YYYY-MM-DD": { whatsapp: true, … } }
   ============================================================ */

function renderTrabajo() {
  const card = document.getElementById('workCard');
  if (!card) return;

  const d   = dateFromISO(fechaSeleccionada);
  const dow = d.getDay(); // 0 = domingo

  if (dow === 0) { card.classList.add('hidden'); return; }
  card.classList.remove('hidden');

  const allWork  = load('aguilaWork', {});
  const dayState = allWork[fechaSeleccionada] || {};
  const ul       = document.getElementById('workChecklist');
  if (!ul) return;
  ul.innerHTML = '';

  WORK_ITEMS.forEach(function(item) {
    const checked = !!dayState[item.id];
    const li  = document.createElement('li');
    li.className = 'check-item' + (checked ? ' checked' : '');

    const cb  = document.createElement('input');
    cb.type = 'checkbox'; cb.className = 'check-cb';
    cb.id = 'work-' + item.id; cb.checked = checked;
    cb.addEventListener('change', function() { toggleWork(item.id); });

    const lbl = document.createElement('label');
    lbl.className = 'check-label';
    lbl.htmlFor   = 'work-' + item.id;
    lbl.textContent = item.label;

    li.appendChild(cb); li.appendChild(lbl);
    ul.appendChild(li);
  });
}

function toggleWork(itemId) {
  const allWork = load('aguilaWork', {});
  if (!allWork[fechaSeleccionada]) allWork[fechaSeleccionada] = {};
  allWork[fechaSeleccionada][itemId] = !allWork[fechaSeleccionada][itemId];
  save('aguilaWork', allWork);
  renderTrabajo();
}

/* ============================================================
   ESTADO ÁGUILA
   ============================================================ */

function updateEagleState() {
  const state     = load('aguilaChecklist', {});
  const completed = Object.values(state).filter(Boolean).length;
  const total     = CHECKLIST_ITEMS.length;
  const pct       = total ? Math.round((completed / total) * 100) : 0;

  let level = EAGLE_LEVELS[0];
  for (let i = EAGLE_LEVELS.length - 1; i >= 0; i--) {
    if (completed >= EAGLE_LEVELS[i].min) { level = EAGLE_LEVELS[i]; break; }
  }

  const get = function(id) { return document.getElementById(id); };
  if (get('stateIcon'))     get('stateIcon').textContent     = level.icon;
  if (get('stateLabel'))    get('stateLabel').textContent    = level.label;
  if (get('eagleBigState')) {
    get('eagleBigState').textContent = level.icon;
    get('eagleBigState').className   = 'eagle-big-state' + (level.cls ? ' ' + level.cls : '');
  }
  if (get('eagleBigLabel')) get('eagleBigLabel').textContent = level.label;
  if (get('progressBar'))   get('progressBar').style.width  = pct + '%';
  if (get('progressText'))  get('progressText').textContent = completed + ' / ' + total + ' tareas (' + pct + '%)';

  const subEl = document.querySelector('.eagle-sub');
  if (subEl) subEl.textContent = level.sub;

  save('aguilaEagleState', { completed, total, label: level.label, pct });
}

/* ============================================================
   AGUA
   Storage: aguilaWater = { "YYYY-MM-DD": ml }
   ============================================================ */

function addWater() {
  const todayISO = hoy();
  const water    = load('aguilaWater', {});
  water[todayISO] = (water[todayISO] || 0) + 250;
  save('aguilaWater', water);
  renderWater();
  showToast('💧 +250 ml');
}

function resetWater() {
  const water = load('aguilaWater', {});
  water[hoy()] = 0;
  save('aguilaWater', water);
  renderWater();
  showToast('Reiniciado 💧');
}

function renderWater() {
  const water = load('aguilaWater', {});
  const total = water[hoy()] || 0;
  const GOAL  = 2000;
  const pct   = Math.min(Math.round((total / GOAL) * 100), 100);
  const done  = total >= GOAL;

  const wt   = document.getElementById('waterTotal');
  const bar  = document.getElementById('waterBar');
  const pctE = document.getElementById('waterPct');
  const goal = document.getElementById('waterGoalMsg');

  if (wt)   wt.textContent  = total + ' / ' + GOAL + ' ml';
  if (bar)  bar.style.width = pct + '%';
  if (pctE) { pctE.textContent = pct + '%'; pctE.classList.toggle('done', done); }
  if (goal) goal.textContent = done
    ? '✅ ¡Meta diaria alcanzada!'
    : 'Faltan ' + (GOAL - total) + ' ml para la meta';
}

/* ============================================================
   GASTOS
   Storage: aguilaExpenses = [{ id, amount, cat }]
   ============================================================ */

function addExpense() {
  const amtEl  = document.getElementById('expenseAmount');
  const catEl  = document.getElementById('expenseCategory');
  const amount = parseFloat(amtEl ? amtEl.value : '');
  const cat    = catEl ? catEl.value : '';

  if (!amount || amount <= 0) { showToast('Ingresa un monto válido 💰'); return; }

  const expenses = load('aguilaExpenses', []);
  expenses.unshift({ id: Date.now(), amount, cat });
  save('aguilaExpenses', expenses);
  if (amtEl) amtEl.value = '';
  renderExpenses();
  showToast('Gasto registrado: $' + amount.toFixed(2));
}

function deleteExpense(id) {
  save('aguilaExpenses', load('aguilaExpenses', []).filter(function(e) { return e.id !== id; }));
  renderExpenses();
}

function renderExpenses() {
  const list    = document.getElementById('expenseList');
  const totalEl = document.getElementById('expenseTotal');
  if (!list || !totalEl) return;

  const expenses = load('aguilaExpenses', []);
  list.innerHTML = '';
  let total = 0;

  expenses.forEach(function(e) {
    total += e.amount;
    const li = document.createElement('li');
    li.className = 'expense-item';
    li.innerHTML =
      '<div><div class="expense-cat">' + escapeHtml(e.cat) + '</div></div>' +
      '<span class="expense-amt">$' + e.amount.toFixed(2) + '</span>' +
      '<button class="btn btn-icon" onclick="deleteExpense(' + e.id + ')" title="Eliminar">✕</button>';
    list.appendChild(li);
  });

  totalEl.textContent = total.toFixed(2);
  if (expenses.length === 0) {
    list.innerHTML = '<p class="empty-msg">Sin gastos registrados</p>';
  }
}

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */

function init() {
  fechaSeleccionada = hoy(); // YYYY-MM-DD — única fuente de verdad
  renderTodo();
}

document.addEventListener('DOMContentLoaded', init);
