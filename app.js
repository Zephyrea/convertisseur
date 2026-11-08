import { CATEGORIES, getCategory, convert, parseNumber, formatNumber } from './units.js';

const STORAGE_KEY = 'convertisseur-state';

const els = {
  tabs: document.getElementById('tabs'),
  value: document.getElementById('from-value'),
  from: document.getElementById('from-unit'),
  to: document.getElementById('to-unit'),
  result: document.getElementById('result'),
  summary: document.getElementById('summary'),
  swap: document.getElementById('swap'),
  copy: document.getElementById('copy'),
};

// État mémorisé entre deux visites : dernière catégorie ouverte,
// et pour chaque catégorie la dernière valeur saisie et les deux unités choisies.
const state = loadState();

function loadState() {
  const initial = {
    category: CATEGORIES[0].id,
    values: Object.fromEntries(CATEGORIES.map((c) => [c.id, '1'])),
    pairs: Object.fromEntries(CATEGORIES.map((c) => [c.id, [...c.defaults]])),
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && getCategory(saved.category)) {
      initial.category = saved.category;
      for (const c of CATEGORIES) {
        const value = saved.values?.[c.id];
        if (typeof value === 'string') initial.values[c.id] = value;
        const pair = saved.pairs?.[c.id];
        if (Array.isArray(pair) && pair.every((id) => c.units.some((u) => u.id === id))) {
          initial.pairs[c.id] = pair;
        }
      }
    }
  } catch {
    /* état absent ou corrompu : valeurs par défaut */
  }
  return initial;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* stockage indisponible (navigation privée) : on ignore */
  }
}

function renderTabs() {
  els.tabs.innerHTML = '';
  for (const c of CATEGORIES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.role = 'tab';
    btn.textContent = c.label;
    btn.setAttribute('aria-selected', String(c.id === state.category));
    btn.addEventListener('click', () => {
      state.category = c.id;
      els.value.value = state.values[c.id];
      renderTabs();
      renderSelects();
      update();
    });
    els.tabs.append(btn);
  }
}

function renderSelects() {
  const cat = getCategory(state.category);
  const [fromId, toId] = state.pairs[cat.id];
  for (const [select, selected] of [[els.from, fromId], [els.to, toId]]) {
    select.innerHTML = '';
    for (const u of cat.units) {
      const opt = new Option(`${u.label} (${u.symbol})`, u.id, false, u.id === selected);
      select.add(opt);
    }
  }
}

function update() {
  const cat = getCategory(state.category);
  const [fromId, toId] = state.pairs[cat.id];
  const fromUnit = cat.units.find((u) => u.id === fromId);
  const toUnit = cat.units.find((u) => u.id === toId);
  const raw = els.value.value;
  const value = parseNumber(raw);
  const invalid = raw.trim() !== '' && Number.isNaN(value);

  els.value.setAttribute('aria-invalid', String(invalid));

  if (Number.isNaN(value)) {
    els.result.textContent = '—';
    els.summary.textContent = invalid ? 'Nombre invalide' : '';
    els.copy.disabled = true;
  } else {
    const result = formatNumber(convert(value, cat.id, fromId, toId));
    els.result.textContent = `${result} ${toUnit.symbol}`;
    els.summary.textContent = `${formatNumber(value)} ${fromUnit.symbol} = ${result} ${toUnit.symbol}`;
    els.copy.disabled = false;
  }

  state.values[cat.id] = raw;
  saveState();
}

els.value.addEventListener('input', update);
els.value.addEventListener('focus', () => els.value.select());

els.from.addEventListener('change', () => {
  state.pairs[state.category][0] = els.from.value;
  update();
});

els.to.addEventListener('change', () => {
  state.pairs[state.category][1] = els.to.value;
  update();
});

els.swap.addEventListener('click', () => {
  state.pairs[state.category].reverse();
  renderSelects();
  update();
});

els.copy.addEventListener('click', async () => {
  // Copie le nombre seul, sans unité ni séparateur de milliers, pour pouvoir le coller ailleurs.
  const text = els.result.textContent.replace(/\s\S+$/, '').replace(/\s/g, '');
  try {
    await navigator.clipboard.writeText(text);
    flash('Copié !');
  } catch {
    flash('Copie impossible');
  }
});

function flash(message) {
  const label = 'Copier le résultat';
  els.copy.textContent = message;
  setTimeout(() => (els.copy.textContent = label), 1200);
}

// Démarrage
els.value.value = state.values[state.category];
renderTabs();
renderSelects();
update();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
}
