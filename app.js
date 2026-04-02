/* ============================================================
   ÁGUILA OS — app.js
   ============================================================ */

/* ─── Utilidades de fecha (sin problemas de zona horaria) ─── */

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dateKey(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function parseLocalDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/* ─── Estado global ─── */

const DAYS_ES   = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio',
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

// Checklist de trabajo: id único + etiqueta
const WORK_ITEMS = [
  { id: 'whatsapp',  label: '💬 WhatsApp'  },
  { id: 'gmail',     label: '📧 Gmail'     },
  { id: 'reservas',  label: '📋 Reservas'  },
  { id: 'gasolina',  label: '⛽ Gasolina'  },
  { id: 'cierre',    label: '🔒 Cierre'    },
  { id: 'control',   label: '📊 Control'   },
];

let selectedDateKey = todayKey();

/* ─── localStorage helpers ─── */

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

/* ─── TOAST ─── */

let toastTimer = null;

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

/* ─── Seguridad ─── */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ============================================================
   CALENDARIO SEMANAL
   ============================================================ */

function buildWeekGrid() {
  const grid   = document.getElementById('weekGrid');
  grid.innerHTML = '';

  const todayK     = todayKey();
  const selDate    = parseLocalDate(selectedDateKey);
  const dow        = selDate.getDay();
  const startOfWeek = new Date(selDate);
  startOfWeek.setDate(selDate.getDate() - dow);

  // Eventos: array plano → indexar por fecha para punto verde
  const allEvents = load('aguilaEvents', []);
  const datesWithEvents = new Set(allEvents.map(e => e.date));

  for (let i = 0; i < 7; i++) {
    const d   = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());

    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (key === todayK)          cell.classList.add('today');
    if (key === selectedDateKey) cell.classList.add('selected');
    if (datesWithEvents.has(key)) cell.classList.add('has-events');

    cell.innerHTML = `
      <span class="day-abbr">${DAYS_ES[d.getDay()]}</span>
      <span class="day-num">${d.getDate()}</span>
      <span class="day-dot"></span>
    `;

    cell.addEventListener('click', () => selectDay(key));
    grid.appendChild(cell);
  }
}

function selectDay(key) {
  selectedDateKey = key;
  buildWeekGrid();
  renderDayView();
  renderEvents();
  syncEventDateInput();
  renderNotes();
  renderWorkChecklist();
}

/* ============================================================
   VISTA DEL DÍA
   ============================================================ */

function renderDayView() {
  const d    = parseLocalDate(selectedDateKey);
  const dayN = document.getElementById('dayName');
  const dayF = document.getElementById('dayFullDate');
  const btn  = document.getElementById('streakBtn');

  dayN.textContent = DAYS_ES[d.getDay()].toUpperCase();
  dayF.textContent = `${d.getDate()} de ${MONTHS_ES[d.getMonth()]} de ${d.getFullYear()}`;

  const streakData = load('aguilaStreak', { count: 0, lastDate: '' });
  const markedToday = selectedDateKey === todayKey() && streakData.lastDate === todayKey();
  btn.textContent = markedToday ? '✅ Día marcado' : '✅ Marcar día';
  btn.classList.toggle('done', markedToday);
}

/* ============================================================
   RACHA / STREAK
   ============================================================ */

function registerStreak() {
  const tk = todayKey();
  if (selectedDateKey !== tk) {
    showToast('Solo puedes marcar el día de hoy 🗓');
    return;
  }

  const streakData = load('aguilaStreak', { count: 0, lastDate: '' });
  if (streakData.lastDate === tk) {
    showToast('¡Ya marcaste hoy! 🔥');
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = dateKey(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  const newCount = streakData.lastDate === yKey ? streakData.count + 1 : 1;
  save('aguilaStreak', { count: newCount, lastDate: tk });

  renderStreak();
  renderDayView();
  showToast(`🔥 Racha: ${newCount} día${newCount > 1 ? 's' : ''}`);
}

function renderStreak() {
  const streakData = load('aguilaStreak', { count: 0, lastDate: '' });
  document.getElementById('streakCount').textContent = streakData.count;
}

/* ============================================================
   EVENTOS — array plano único en localStorage
   Estructura: aguilaEvents = [{ id, date, time, text, done }, …]
   ============================================================ */

function syncEventDateInput() {
  const el = document.getElementById('eventDate');
  if (el) el.value = selectedDateKey;
}

function addEvent() {
  const dateEl = document.getElementById('eventDate');
  const timeEl = document.getElementById('eventTime');
  const textEl = document.getElementById('eventText');

  const date = dateEl.value.trim();
  const time = timeEl.value.trim();
  const text = textEl.value.trim();

  if (!date) { showToast('Selecciona una fecha 📅'); return; }
  if (!time) { showToast('Selecciona una hora ⏰');  return; }
  if (!text) { showToast('Escribe la descripción 📝'); return; }

  const events = load('aguilaEvents', []);

  // Evitar duplicados: misma fecha + hora + texto (case-insensitive)
  const dup = events.some(
    e => e.date === date && e.time === time && e.text.toLowerCase() === text.toLowerCase()
  );
  if (dup) { showToast('Ese evento ya existe 🚫'); return; }

  events.push({ id: Date.now(), date, time, text, done: false });
  save('aguilaEvents', events);

  timeEl.value = '';
  textEl.value = '';

  renderEvents();
  buildWeekGrid();
  showToast('Evento agregado 🗂');
}

function toggleEvent(id) {
  const events = load('aguilaEvents', []);
  const ev = events.find(e => e.id === id);
  if (!ev) return;
  ev.done = !ev.done;
  save('aguilaEvents', events);
  renderEvents();
}

function deleteEvent(id) {
  const events = load('aguilaEvents', []).filter(e => e.id !== id);
  save('aguilaEvents', events);
  renderEvents();
  buildWeekGrid();
  showToast('Evento eliminado 🗑');
}

function renderEvents() {
  const list = document.getElementById('eventList');
  list.innerHTML = '';

  // Filtrar por día seleccionado y ordenar por hora
  const events = load('aguilaEvents', [])
    .filter(e => e.date === selectedDateKey)
    .sort((a, b) => a.time.localeCompare(b.time));

  if (events.length === 0) {
    const p = document.createElement('p');
    p.className   = 'empty-msg';
    p.textContent = 'Sin eventos para este día';
    list.appendChild(p);
    return;
  }

  events.forEach(ev => {
    const li = document.createElement('li');
    li.className = 'event-item' + (ev.done ? ' done' : '');

    const cb = document.createElement('input');
    cb.type      = 'checkbox';
    cb.className = 'event-cb';
    cb.checked   = !!ev.done;
    cb.addEventListener('change', () => toggleEvent(ev.id));

    const timeSpan = document.createElement('span');
    timeSpan.className   = 'event-time';
    timeSpan.textContent = ev.time;

    const textSpan = document.createElement('span');
    textSpan.className   = 'event-text';
    textSpan.textContent = ev.text;

    const delBtn = document.createElement('button');
    delBtn.className   = 'btn btn-icon';
    delBtn.title       = 'Eliminar';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', () => deleteEvent(ev.id));

    li.appendChild(cb);
    li.appendChild(timeSpan);
    li.appendChild(textSpan);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

/* ============================================================
   NOTAS DEL DÍA
   Estructura: aguilaNotes = { "YYYY-MM-DD": "texto…", … }
   ============================================================ */

function saveNotes() {
  const text  = document.getElementById('dayNotes').value;
  const notes = load('aguilaNotes', {});
  if (text.trim() === '') {
    delete notes[selectedDateKey];          // limpia entradas vacías
  } else {
    notes[selectedDateKey] = text;
  }
  save('aguilaNotes', notes);
}

function renderNotes() {
  const notes = load('aguilaNotes', {});
  document.getElementById('dayNotes').value = notes[selectedDateKey] || '';
}

/* ============================================================
   CHECKLIST DIARIO (global, no por día)
   ============================================================ */

function renderChecklist() {
  const ul    = document.getElementById('checklist');
  const state = load('aguilaChecklist', {});
  ul.innerHTML = '';

  CHECKLIST_ITEMS.forEach((label, i) => {
    const checked = !!state[i];
    const li = document.createElement('li');
    li.className = 'check-item' + (checked ? ' checked' : '');

    const cb = document.createElement('input');
    cb.type      = 'checkbox';
    cb.className = 'check-cb';
    cb.id        = `chk${i}`;
    cb.checked   = checked;
    cb.addEventListener('change', () => toggleCheck(i));

    const lbl = document.createElement('label');
    lbl.className   = 'check-label';
    lbl.htmlFor     = `chk${i}`;
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
   Solo lunes (1) a sábado (6). Se reinicia cada día automáticamente.
   Estructura: aguilaWork = { "YYYY-MM-DD": { whatsapp: true, … }, … }
   ============================================================ */

function renderWorkChecklist() {
  const card = document.getElementById('workCard');
  const d    = parseLocalDate(selectedDateKey);
  const dow  = d.getDay(); // 0=dom, 6=sáb

  // Ocultar en domingo
  if (dow === 0) {
    card.classList.add('hidden');
    return;
  }
  card.classList.remove('hidden');

  const allWork  = load('aguilaWork', {});
  const dayState = allWork[selectedDateKey] || {};

  const ul = document.getElementById('workChecklist');
  ul.innerHTML = '';

  WORK_ITEMS.forEach(item => {
    const checked = !!dayState[item.id];
    const li = document.createElement('li');
    li.className = 'check-item' + (checked ? ' checked' : '');

    const cb = document.createElement('input');
    cb.type      = 'checkbox';
    cb.className = 'check-cb';
    cb.id        = `work-${item.id}`;
    cb.checked   = checked;
    cb.addEventListener('change', () => toggleWorkItem(item.id));

    const lbl = document.createElement('label');
    lbl.className   = 'check-label';
    lbl.htmlFor     = `work-${item.id}`;
    lbl.textContent = item.label;

    li.appendChild(cb);
    li.appendChild(lbl);
    ul.appendChild(li);
  });
}

function toggleWorkItem(itemId) {
  const allWork  = load('aguilaWork', {});
  if (!allWork[selectedDateKey]) allWork[selectedDateKey] = {};
  allWork[selectedDateKey][itemId] = !allWork[selectedDateKey][itemId];
  save('aguilaWork', allWork);
  renderWorkChecklist();
}

/* ============================================================
   ESTADO ÁGUILA
   ============================================================ */

const EAGLE_LEVELS = [
  { minTasks: 0, icon: '❄️', label: 'Bajo',   sub: 'Empieza completando tareas del checklist', cls: '' },
  { minTasks: 3, icon: '⚖️', label: 'Medio',  sub: 'Buen avance — sigue empujando',            cls: '' },
  { minTasks: 6, icon: '🦅', label: 'Águila', sub: '¡Modo Águila activado! Racha imparable',   cls: 'aguila' },
];

function _getLevel(completed) {
  for (let i = EAGLE_LEVELS.length - 1; i >= 0; i--) {
    if (completed >= EAGLE_LEVELS[i].minTasks) return EAGLE_LEVELS[i];
  }
  return EAGLE_LEVELS[0];
}

function updateEagleState() {
  const state     = load('aguilaChecklist', {});
  const completed = Object.values(state).filter(Boolean).length;
  const total     = CHECKLIST_ITEMS.length;
  const pct       = total ? Math.round((completed / total) * 100) : 0;
  const level     = _getLevel(completed);

  document.getElementById('stateIcon').textContent  = level.icon;
  document.getElementById('stateLabel').textContent = level.label;

  const bigState = document.getElementById('eagleBigState');
  bigState.textContent = level.icon;
  bigState.className   = 'eagle-big-state' + (level.cls ? ` ${level.cls}` : '');

  document.getElementById('eagleBigLabel').textContent = level.label;

  const subEl = document.querySelector('.eagle-sub');
  if (subEl) subEl.textContent = level.sub;

  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressText').textContent = `${completed} / ${total} tareas (${pct}%)`;

  save('aguilaEagleState', { completed, total, label: level.label, pct });
}

/* ============================================================
   AGUA
   ============================================================ */

function addWater() {
  const tk    = todayKey();
  const water = load('aguilaWater', {});
  water[tk]   = (water[tk] || 0) + 250;
  save('aguilaWater', water);
  renderWater();
  showToast('💧 +250 ml');
}

function resetWater() {
  const tk    = todayKey();
  const water = load('aguilaWater', {});
  water[tk]   = 0;
  save('aguilaWater', water);
  renderWater();
  showToast('Reiniciado 💧');
}

function renderWater() {
  const tk    = todayKey();
  const water = load('aguilaWater', {});
  const total = water[tk] || 0;
  const GOAL  = 2000;
  const pct   = Math.min(Math.round((total / GOAL) * 100), 100);
  const done  = total >= GOAL;

  document.getElementById('waterTotal').textContent = `${total} / ${GOAL} ml`;
  document.getElementById('waterBar').style.width   = pct + '%';

  const pctEl = document.getElementById('waterPct');
  pctEl.textContent = pct + '%';
  pctEl.classList.toggle('done', done);

  document.getElementById('waterGoalMsg').textContent = done
    ? '✅ ¡Meta diaria alcanzada!'
    : `Faltan ${GOAL - total} ml para la meta`;
}

/* ============================================================
   GASTOS
   ============================================================ */

function addExpense() {
  const amtEl  = document.getElementById('expenseAmount');
  const catEl  = document.getElementById('expenseCategory');
  const amount = parseFloat(amtEl.value);
  const cat    = catEl.value;

  if (!amount || amount <= 0) { showToast('Ingresa un monto válido 💰'); return; }

  const expenses = load('aguilaExpenses', []);
  expenses.unshift({ amount, cat, id: Date.now() });
  save('aguilaExpenses', expenses);

  amtEl.value = '';
  renderExpenses();
  showToast(`Gasto registrado: $${amount.toFixed(2)}`);
}

function deleteExpense(id) {
  const expenses = load('aguilaExpenses', []).filter(e => e.id !== id);
  save('aguilaExpenses', expenses);
  renderExpenses();
}

function renderExpenses() {
  const list     = document.getElementById('expenseList');
  const totalEl  = document.getElementById('expenseTotal');
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
  buildWeekGrid();
  renderDayView();
  renderEvents();
  syncEventDateInput();
  renderNotes();
  renderChecklist();
  renderWorkChecklist();
  renderStreak();
  renderWater();
  renderExpenses();
}

document.addEventListener('DOMContentLoaded', init);
