/* ============================================================
   ÁGUILA OS — app.js
   Una sola variable de estado, cero ambigüedad de fechas.
   ============================================================ */

/* ─── ÚNICA VARIABLE GLOBAL DE ESTADO ─── */
let fechaSeleccionada; // formato DD-MM-YYYY

/* ─── CONSTANTES ─── */
const DIAS_ES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MESES_ES  = ['enero','febrero','marzo','abril','mayo','junio',
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
  { minTasks: 0, icon: '❄️', label: 'Bajo',   sub: 'Empieza completando tareas del checklist', cls: '' },
  { minTasks: 3, icon: '⚖️', label: 'Medio',  sub: 'Buen avance — sigue empujando',            cls: '' },
  { minTasks: 6, icon: '🦅', label: 'Águila', sub: '¡Modo Águila activado! Racha imparable',   cls: 'aguila' },
];

/* ============================================================
   UTILIDADES DE FECHA
   fechaISO() → "YYYY-MM-DD"  (zona horaria segura)
   isoToDMY() → "DD-MM-YYYY"
   dmyToISO() → "YYYY-MM-DD"
   hoy()      → "DD-MM-YYYY"
   ============================================================ */

function fechaISO(date = new Date()) {
  date.setHours(12, 0, 0, 0);
  return date.toISOString().split('T')[0];
}

function isoToDMY(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

function dmyToISO(dmy) {
  const [d, m, y] = dmy.split('-');
  return `${y}-${m}-${d}`;
}

function hoy() {
  return isoToDMY(fechaISO());
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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ============================================================
   RENDER GLOBAL — punto de entrada único para actualizar todo
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

  const todayDMY  = hoy();
  const selISO    = dmyToISO(fechaSeleccionada);
  const selDate   = new Date(selISO + 'T12:00:00');
  const dow       = selDate.getDay();

  // Lunes de la semana que contiene fechaSeleccionada
  const startDate = new Date(selDate);
  startDate.setDate(selDate.getDate() - dow); // domingo como inicio

  const eventos    = load('aguilaEvents', []);
  const fechasConEventos = new Set(eventos.map(e => e.fecha));

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    const iso = fechaISO(d);
    const dmy = isoToDMY(iso);

    const cell = document.createElement('div');
    cell.className = 'day-cell';

    if (dmy === todayDMY)           cell.classList.add('today');
    if (dmy === fechaSeleccionada)  cell.classList.add('selected', 'activo');
    if (fechasConEventos.has(dmy))  cell.classList.add('has-events');

    cell.innerHTML = `
      <span class="day-abbr">${DIAS_ES[d.getDay()]}</span>
      <span class="day-num">${d.getDate()}</span>
      <span class="day-dot"></span>
    `;

    cell.addEventListener('click', () => {
      fechaSeleccionada = dmy;
      renderTodo();
    });

    grid.appendChild(cell);
  }
}

/* ============================================================
   VISTA DEL DÍA
   ============================================================ */

function renderDia() {
  const iso  = dmyToISO(fechaSeleccionada);
  const d    = new Date(iso + 'T12:00:00');
  const diaN = document.getElementById('dayName');
  const diaF = document.getElementById('dayFullDate');
  const btn  = document.getElementById('streakBtn');

  if (diaN) diaN.textContent = DIAS_ES[d.getDay()].toUpperCase();
  if (diaF) diaF.textContent =
    `${d.getDate()} de ${MESES_ES[d.getMonth()]} de ${d.getFullYear()}`;

  // Sincronizar input de fecha del formulario de eventos
  const evDateInput = document.getElementById('eventDate');
  if (evDateInput) evDateInput.value = iso;

  // Estado del botón de racha
  const streakData   = load('aguilaStreak', { count: 0, lastDate: '' });
  const marcadoHoy   = fechaSeleccionada === hoy() && streakData.lastDate === hoy();
  if (btn) {
    btn.textContent = marcadoHoy ? '✅ Día marcado' : '✅ Marcar día';
    btn.classList.toggle('done', marcadoHoy);
  }
}

/* ============================================================
   RACHA / STREAK
   ============================================================ */

function registerStreak() {
  const todayDMY = hoy();

  if (fechaSeleccionada !== todayDMY) {
    showToast('Solo puedes marcar el día de hoy 🗓');
    return;
  }

  const streakData = load('aguilaStreak', { count: 0, lastDate: '' });

  if (streakData.lastDate === todayDMY) {
    showToast('¡Ya marcaste hoy! 🔥');
    return;
  }

  // Calcular ayer en DD-MM-YYYY
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const ayerDMY = isoToDMY(fechaISO(ayer));

  const newCount = streakData.lastDate === ayerDMY ? streakData.count + 1 : 1;
  save('aguilaStreak', { count: newCount, lastDate: todayDMY });

  renderStreak();
  renderDia();
  showToast(`🔥 Racha: ${newCount} día${newCount > 1 ? 's' : ''}`);
}

function renderStreak() {
  const el = document.getElementById('streakCount');
  if (!el) return;
  const streakData = load('aguilaStreak', { count: 0, lastDate: '' });
  el.textContent = streakData.count;
}

/* ============================================================
   EVENTOS
   Storage: aguilaEvents = [{ id, fecha, hora, texto, done }]
   fecha en formato DD-MM-YYYY
   ============================================================ */

function addEvent() {
  const dateInput = document.getElementById('eventDate');
  const timeInput = document.getElementById('eventTime');
  const textInput = document.getElementById('eventText');

  if (!dateInput || !timeInput || !textInput) return;

  // El input type="date" devuelve YYYY-MM-DD → convertir a DD-MM-YYYY
  const isoVal = dateInput.value.trim();
  const hora   = timeInput.value.trim();
  const texto  = textInput.value.trim();

  if (!isoVal) { showToast('Selecciona una fecha 📅'); return; }
  if (!hora)   { showToast('Selecciona una hora ⏰');  return; }
  if (!texto)  { showToast('Escribe la descripción 📝'); return; }

  const fecha    = isoToDMY(isoVal);
  const eventos  = load('aguilaEvents', []);

  // Evitar duplicados (misma fecha + hora + texto, case-insensitive)
  const dup = eventos.some(
    e => e.fecha === fecha &&
         e.hora  === hora  &&
         e.texto.toLowerCase() === texto.toLowerCase()
  );
  if (dup) { showToast('Ese evento ya existe 🚫'); return; }

  eventos.push({ id: Date.now(), fecha, hora, texto, done: false });
  save('aguilaEvents', eventos);

  timeInput.value = '';
  textInput.value = '';

  renderEventos();
  renderSemana(); // actualizar punto verde del calendario
  showToast('Evento agregado 🗂');
}

function toggleEvento(id) {
  const eventos = load('aguilaEvents', []);
  const ev = eventos.find(e => e.id === id);
  if (!ev) return;
  ev.done = !ev.done;
  save('aguilaEvents', eventos);
  renderEventos();
}

function eliminarEvento(id) {
  const eventos = load('aguilaEvents', []).filter(e => e.id !== id);
  save('aguilaEvents', eventos);
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

  eventos.forEach(ev => {
    const li = document.createElement('li');
    li.className = 'event-item' + (ev.done ? ' done' : '');

    const cb = document.createElement('input');
    cb.type      = 'checkbox';
    cb.className = 'event-cb';
    cb.checked   = !!ev.done;
    cb.addEventListener('change', () => toggleEvento(ev.id));

    const horaSpan = document.createElement('span');
    horaSpan.className   = 'event-time';
    horaSpan.textContent = ev.hora;

    const textoSpan = document.createElement('span');
    textoSpan.className   = 'event-text';
    textoSpan.textContent = ev.texto;

    const delBtn = document.createElement('button');
    delBtn.className   = 'btn btn-icon';
    delBtn.title       = 'Eliminar';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', () => eliminarEvento(ev.id));

    li.appendChild(cb);
    li.appendChild(horaSpan);
    li.appendChild(textoSpan);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

/* ============================================================
   NOTAS DEL DÍA
   Storage: aguilaNotes = { "DD-MM-YYYY": "texto" }
   ============================================================ */

function saveNotes() {
  const ta = document.getElementById('dayNotes');
  if (!ta) return;
  const notes = load('aguilaNotes', {});
  const texto = ta.value;
  if (texto.trim() === '') {
    delete notes[fechaSeleccionada];
  } else {
    notes[fechaSeleccionada] = texto;
  }
  save('aguilaNotes', notes);
}

function renderNotas() {
  const ta = document.getElementById('dayNotes');
  if (!ta) return;
  const notes = load('aguilaNotes', {});
  ta.value = notes[fechaSeleccionada] || '';
}

/* ============================================================
   CHECKLIST DIARIO (global, no por día)
   Storage: aguilaChecklist = { 0: true, 1: false, … }
   ============================================================ */

function renderChecklist() {
  const ul = document.getElementById('checklist');
  if (!ul) return;
  const state = load('aguilaChecklist', {});
  ul.innerHTML = '';

  CHECKLIST_ITEMS.forEach((label, i) => {
    const checked = !!state[i];
    const li = document.createElement('li');
    li.className = 'check-item' + (checked ? ' checked' : '');

    const cb = document.createElement('input');
    cb.type      = 'checkbox';
    cb.className = 'check-cb';
    cb.id        = `chk-${i}`;
    cb.checked   = checked;
    cb.addEventListener('change', () => toggleCheck(i));

    const lbl = document.createElement('label');
    lbl.className   = 'check-label';
    lbl.htmlFor     = `chk-${i}`;
    lbl.textContent = label;

    li.appendChild(cb);
    li.appendChild(lbl);
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
   Solo lunes (1) a sábado (6). Estado por día.
   Storage: aguilaWork = { "DD-MM-YYYY": { whatsapp: true, … } }
   ============================================================ */

function renderTrabajo() {
  const card = document.getElementById('workCard');
  if (!card) return;

  const iso = dmyToISO(fechaSeleccionada);
  const d   = new Date(iso + 'T12:00:00');
  const dow = d.getDay(); // 0=dom

  if (dow === 0) {
    card.classList.add('hidden');
    return;
  }
  card.classList.remove('hidden');

  const allWork  = load('aguilaWork', {});
  const dayState = allWork[fechaSeleccionada] || {};
  const ul       = document.getElementById('workChecklist');
  if (!ul) return;
  ul.innerHTML   = '';

  WORK_ITEMS.forEach(item => {
    const checked = !!dayState[item.id];
    const li = document.createElement('li');
    li.className = 'check-item' + (checked ? ' checked' : '');

    const cb = document.createElement('input');
    cb.type      = 'checkbox';
    cb.className = 'check-cb';
    cb.id        = `work-${item.id}`;
    cb.checked   = checked;
    cb.addEventListener('change', () => toggleWork(item.id));

    const lbl = document.createElement('label');
    lbl.className   = 'check-label';
    lbl.htmlFor     = `work-${item.id}`;
    lbl.textContent = item.label;

    li.appendChild(cb);
    li.appendChild(lbl);
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
    if (completed >= EAGLE_LEVELS[i].minTasks) { level = EAGLE_LEVELS[i]; break; }
  }

  const stateIcon  = document.getElementById('stateIcon');
  const stateLabel = document.getElementById('stateLabel');
  const bigState   = document.getElementById('eagleBigState');
  const bigLabel   = document.getElementById('eagleBigLabel');
  const subEl      = document.querySelector('.eagle-sub');
  const bar        = document.getElementById('progressBar');
  const txt        = document.getElementById('progressText');

  if (stateIcon)  stateIcon.textContent  = level.icon;
  if (stateLabel) stateLabel.textContent = level.label;
  if (bigState) {
    bigState.textContent = level.icon;
    bigState.className   = 'eagle-big-state' + (level.cls ? ` ${level.cls}` : '');
  }
  if (bigLabel) bigLabel.textContent = level.label;
  if (subEl)    subEl.textContent    = level.sub;
  if (bar)      bar.style.width      = pct + '%';
  if (txt)      txt.textContent      = `${completed} / ${total} tareas (${pct}%)`;

  save('aguilaEagleState', { completed, total, label: level.label, pct });
}

/* ============================================================
   AGUA
   Storage: aguilaWater = { "DD-MM-YYYY": ml }
   ============================================================ */

function addWater() {
  const water  = load('aguilaWater', {});
  const todayD = hoy();
  water[todayD] = (water[todayD] || 0) + 250;
  save('aguilaWater', water);
  renderWater();
  showToast('💧 +250 ml');
}

function resetWater() {
  const water  = load('aguilaWater', {});
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

  const wtEl   = document.getElementById('waterTotal');
  const barEl  = document.getElementById('waterBar');
  const pctEl  = document.getElementById('waterPct');
  const goalEl = document.getElementById('waterGoalMsg');

  if (wtEl)   wtEl.textContent   = `${total} / ${GOAL} ml`;
  if (barEl)  barEl.style.width  = pct + '%';
  if (pctEl) {
    pctEl.textContent = pct + '%';
    pctEl.classList.toggle('done', done);
  }
  if (goalEl) goalEl.textContent = done
    ? '✅ ¡Meta diaria alcanzada!'
    : `Faltan ${GOAL - total} ml para la meta`;
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
  showToast(`Gasto registrado: $${amount.toFixed(2)}`);
}

function deleteExpense(id) {
  const expenses = load('aguilaExpenses', []).filter(e => e.id !== id);
  save('aguilaExpenses', expenses);
  renderExpenses();
}

function renderExpenses() {
  const list    = document.getElementById('expenseList');
  const totalEl = document.getElementById('expenseTotal');
  if (!list || !totalEl) return;

  const expenses = load('aguilaExpenses', []);
  list.innerHTML = '';
  let total = 0;

  expenses.forEach(e => {
    total += e.amount;
    const li = document.createElement('li');
    li.className = 'expense-item';
    li.innerHTML = `
      <div><div class="expense-cat">${escapeHtml(e.cat)}</div></div>
      <span class="expense-amt">$${e.amount.toFixed(2)}</span>
      <button class="btn btn-icon" onclick="deleteExpense(${e.id})" title="Eliminar">✕</button>
    `;
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
  fechaSeleccionada = hoy(); // DD-MM-YYYY, única fuente de verdad
  renderTodo();
}

document.addEventListener('DOMContentLoaded', init);
