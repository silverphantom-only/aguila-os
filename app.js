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

/* ============================================================
   CALENDARIO SEMANAL
   ============================================================ */

function buildWeekGrid() {
  const grid    = document.getElementById('weekGrid');
  grid.innerHTML = '';

  const today   = new Date();
  const todayK  = todayKey();

  // Semana que contiene selectedDateKey
  const selDate = parseLocalDate(selectedDateKey);
  const dow     = selDate.getDay(); // 0=dom
  const startOfWeek = new Date(selDate);
  startOfWeek.setDate(selDate.getDate() - dow);

  const allEvents = load('aguilaEvents', {});

  for (let i = 0; i < 7; i++) {
    const d   = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());

    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (key === todayK)         cell.classList.add('today');
    if (key === selectedDateKey) cell.classList.add('selected');

    const events = allEvents[key] || [];
    if (events.length > 0)      cell.classList.add('has-events');

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
}

/* ============================================================
   VISTA DEL DÍA
   ============================================================ */

function renderDayView() {
  const d     = parseLocalDate(selectedDateKey);
  const dayN  = document.getElementById('dayName');
  const dayF  = document.getElementById('dayFullDate');
  const btn   = document.getElementById('streakBtn');

  const dayName = DAYS_ES[d.getDay()];
  const full    = `${d.getDate()} de ${MONTHS_ES[d.getMonth()]} de ${d.getFullYear()}`;

  dayN.textContent = dayName.toUpperCase();
  dayF.textContent = full;

  // Mostrar si la racha ya fue marcada hoy
  const streakData = load('aguilaStreak', { count: 0, lastDate: '' });
  if (selectedDateKey === todayKey() && streakData.lastDate === todayKey()) {
    btn.textContent = '✅ Día marcado';
    btn.classList.add('done');
  } else {
    btn.textContent = '✅ Marcar día';
    btn.classList.remove('done');
  }
}

/* ============================================================
   RACHA / STREAK
   ============================================================ */

function registerStreak() {
  const tk  = todayKey();
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
   EVENTOS
   ============================================================ */

/* Pre-carga la fecha del día seleccionado en el input de fecha */
function syncEventDateInput() {
  const el = document.getElementById('eventDate');
  if (el) el.value = selectedDateKey;
}

function addEvent() {
  const dateEl = document.getElementById('eventDate');
  const timeEl = document.getElementById('eventTime');
  const textEl = document.getElementById('eventText');

  const dateVal = dateEl.value.trim();
  const time    = timeEl.value.trim();
  const text    = textEl.value.trim();

  if (!dateVal) { showToast('Selecciona una fecha 📅'); return; }
  if (!time)    { showToast('Selecciona una hora ⏰');  return; }
  if (!text)    { showToast('Escribe la descripción 📝'); return; }

  // dateVal viene del input como "YYYY-MM-DD" — lo usamos directamente como key
  // (el input type="date" siempre devuelve ISO local, sin conversión UTC)
  const targetKey  = dateVal;
  const allEvents  = load('aguilaEvents', {});
  const dayEvents  = allEvents[targetKey] || [];

  // Evitar duplicados: misma fecha + hora + texto
  const duplicate = dayEvents.some(e => e.time === time && e.text.toLowerCase() === text.toLowerCase());
  if (duplicate) { showToast('Ese evento ya existe 🚫'); return; }

  // Cada evento guarda su propia dateKey para que toggle/delete no dependan
  // del día seleccionado en el calendario
  dayEvents.push({ date: targetKey, time, text, done: false, id: Date.now() });
  dayEvents.sort((a, b) => a.time.localeCompare(b.time));
  allEvents[targetKey] = dayEvents;
  save('aguilaEvents', allEvents);

  timeEl.value = '';
  textEl.value = '';

  renderEvents();
  buildWeekGrid();
  showToast('Evento agregado 🗂');
}

/* Busca el evento por ID en TODAS las fechas para no depender de selectedDateKey */
function _findEvent(id) {
  const allEvents = load('aguilaEvents', {});
  for (const key of Object.keys(allEvents)) {
    const idx = allEvents[key].findIndex(e => e.id === id);
    if (idx !== -1) return { allEvents, key, idx };
  }
  return null;
}

function toggleEvent(id) {
  const found = _findEvent(id);
  if (!found) return;
  const { allEvents, key, idx } = found;
  allEvents[key][idx].done = !allEvents[key][idx].done;
  save('aguilaEvents', allEvents);
  renderEvents();
}

function deleteEvent(id) {
  const found = _findEvent(id);
  if (!found) return;
  const { allEvents, key } = found;
  allEvents[key] = allEvents[key].filter(e => e.id !== id);
  save('aguilaEvents', allEvents);
  renderEvents();
  buildWeekGrid();
  showToast('Evento eliminado 🗑');
}

function renderEvents() {
  const list      = document.getElementById('eventList');
  const allEvents = load('aguilaEvents', {});

  // Ordenar los del día seleccionado por hora
  const dayEvents = (allEvents[selectedDateKey] || []).slice();
  dayEvents.sort((a, b) => a.time.localeCompare(b.time));

  list.innerHTML = '';

  if (dayEvents.length === 0) {
    const empty = document.createElement('p');
    empty.className   = 'empty-msg';
    empty.textContent = 'Sin eventos para este día';
    list.appendChild(empty);
    return;
  }

  dayEvents.forEach(ev => {
    const li = document.createElement('li');
    li.className = 'event-item' + (ev.done ? ' done' : '');

    // Checkbox
    const cb = document.createElement('input');
    cb.type      = 'checkbox';
    cb.className = 'event-cb';
    cb.checked   = !!ev.done;
    cb.addEventListener('change', () => toggleEvent(ev.id));

    // Hora
    const timeSpan = document.createElement('span');
    timeSpan.className   = 'event-time';
    timeSpan.textContent = ev.time;

    // Texto (sin innerHTML para evitar XSS)
    const textSpan = document.createElement('span');
    textSpan.className   = 'event-text';
    textSpan.textContent = ev.text;

    // Botón eliminar
    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-icon';
    delBtn.title     = 'Eliminar';
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
   CHECKLIST DIARIO
   ============================================================ */

function renderChecklist() {
  const ul    = document.getElementById('checklist');
  const state = load('aguilaChecklist', {});
  ul.innerHTML = '';

  CHECKLIST_ITEMS.forEach((label, i) => {
    const checked = !!state[i];
    const li = document.createElement('li');
    li.className = 'check-item' + (checked ? ' checked' : '');

    li.innerHTML = `
      <input type="checkbox" class="check-cb" id="chk${i}" ${checked ? 'checked' : ''} onchange="toggleCheck(${i})" />
      <label class="check-label" for="chk${i}">${label}</label>
    `;

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
   ESTADO ÁGUILA
   ============================================================ */

const EAGLE_LEVELS = [
  { min: 0,   max: 2,  icon: '🥚',  label: 'Inicio',  cls: '' },
  { min: 3,   max: 4,  icon: '🐣',  label: 'Despertando', cls: '' },
  { min: 5,   max: 6,  icon: '🦤',  label: 'Creciendo', cls: '' },
  { min: 7,   max: 8,  icon: '🦅',  label: 'Águila', cls: 'aguila' },
];

function updateEagleState() {
  const state     = load('aguilaChecklist', {});
  const completed = Object.values(state).filter(Boolean).length;
  const total     = CHECKLIST_ITEMS.length;
  const pct       = total ? (completed / total) * 100 : 0;

  // Determinar nivel
  let level = EAGLE_LEVELS[0];
  for (const lv of EAGLE_LEVELS) {
    if (completed >= lv.min) level = lv;
  }

  // Header
  document.getElementById('stateIcon').textContent  = level.icon;
  document.getElementById('stateLabel').textContent = level.label;

  // Disciplina card
  const bigState = document.getElementById('eagleBigState');
  bigState.textContent = level.icon;
  bigState.className   = 'eagle-big-state' + (level.cls ? ` ${level.cls}` : '');
  document.getElementById('eagleBigLabel').textContent  = level.label;
  document.getElementById('progressBar').style.width    = pct + '%';
  document.getElementById('progressText').textContent   = `${completed} / ${total} tareas`;
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
  const tk      = todayKey();
  const water   = load('aguilaWater', {});
  const total   = water[tk] || 0;
  const goal    = 2000;
  const pct     = Math.min((total / goal) * 100, 100);

  document.getElementById('waterTotal').textContent = `${total} ml`;
  document.getElementById('waterBar').style.width   = pct + '%';
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
  list.innerHTML  = '';

  let total = 0;
  expenses.forEach(e => {
    total += e.amount;
    const li = document.createElement('li');
    li.className = 'expense-item';
    li.innerHTML = `
      <div>
        <div class="expense-cat">${escapeHtml(e.cat)}</div>
      </div>
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
   SEGURIDAD — escapeHtml
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
   INICIALIZACIÓN
   ============================================================ */

function init() {
  buildWeekGrid();
  renderDayView();
  renderEvents();
  syncEventDateInput();
  renderChecklist();
  renderStreak();
  renderWater();
  renderExpenses();
}

document.addEventListener('DOMContentLoaded', init);
