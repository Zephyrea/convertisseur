// Catégories et unités de conversion.
// Chaque unité est convertie via l'unité de référence de sa catégorie :
//  - soit par un facteur multiplicatif (valeur_en_référence = valeur × factor),
//  - soit par une paire de fonctions toBase / fromBase (températures).

export const CATEGORIES = [
  {
    id: 'distance',
    label: 'Distance',
    defaults: ['m', 'ft'],
    units: [
      { id: 'mm', label: 'Millimètre', symbol: 'mm', factor: 0.001 },
      { id: 'cm', label: 'Centimètre', symbol: 'cm', factor: 0.01 },
      { id: 'm', label: 'Mètre', symbol: 'm', factor: 1 },
      { id: 'km', label: 'Kilomètre', symbol: 'km', factor: 1000 },
      { id: 'in', label: 'Pouce', symbol: 'in', factor: 0.0254 },
      { id: 'ft', label: 'Pied', symbol: 'ft', factor: 0.3048 },
      { id: 'yd', label: 'Yard', symbol: 'yd', factor: 0.9144 },
      { id: 'mi', label: 'Mile terrestre', symbol: 'mi', factor: 1609.344 },
      { id: 'nmi', label: 'Mille nautique', symbol: 'NM', factor: 1852 },
    ],
  },
  {
    id: 'speed',
    label: 'Vitesse',
    defaults: ['ms', 'kt'],
    units: [
      { id: 'ms', label: 'Mètre par seconde', symbol: 'm/s', factor: 1 },
      { id: 'kmh', label: 'Kilomètre par heure', symbol: 'km/h', factor: 1000 / 3600 },
      { id: 'kt', label: 'Nœud', symbol: 'kt', factor: 1852 / 3600 },
      { id: 'mph', label: 'Mile par heure', symbol: 'mph', factor: 0.44704 },
      { id: 'fts', label: 'Pied par seconde', symbol: 'ft/s', factor: 0.3048 },
      { id: 'kfth', label: 'Millier de pieds par heure', symbol: 'kft/h', factor: 304.8 / 3600 },
    ],
  },
  {
    id: 'mass',
    label: 'Masse',
    defaults: ['kg', 'lb'],
    units: [
      { id: 'mg', label: 'Milligramme', symbol: 'mg', factor: 1e-6 },
      { id: 'g', label: 'Gramme', symbol: 'g', factor: 0.001 },
      { id: 'kg', label: 'Kilogramme', symbol: 'kg', factor: 1 },
      { id: 't', label: 'Tonne', symbol: 't', factor: 1000 },
      { id: 'oz', label: 'Once', symbol: 'oz', factor: 0.028349523125 },
      { id: 'lb', label: 'Livre', symbol: 'lb', factor: 0.45359237 },
      { id: 'st', label: 'Stone', symbol: 'st', factor: 6.35029318 },
    ],
  },
  {
    id: 'temperature',
    label: 'Température',
    defaults: ['c', 'f'],
    units: [
      { id: 'c', label: 'Degré Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
      {
        id: 'f',
        label: 'Degré Fahrenheit',
        symbol: '°F',
        toBase: (v) => ((v - 32) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 32,
      },
      { id: 'k', label: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  {
    id: 'force',
    label: 'Force',
    defaults: ['n', 'lbf'],
    units: [
      { id: 'n', label: 'Newton', symbol: 'N', factor: 1 },
      { id: 'dan', label: 'Décanewton', symbol: 'daN', factor: 10 },
      { id: 'kn', label: 'Kilonewton', symbol: 'kN', factor: 1000 },
      { id: 'kgf', label: 'Kilogramme-force', symbol: 'kgf', factor: 9.80665 },
      { id: 'tf', label: 'Tonne-force', symbol: 'tf', factor: 9806.65 },
      { id: 'lbf', label: 'Livre-force', symbol: 'lbf', factor: 4.4482216152605 },
      { id: 'ozf', label: 'Once-force', symbol: 'ozf', factor: 4.4482216152605 / 16 },
      { id: 'kip', label: 'Kip', symbol: 'kip', factor: 4448.2216152605 },
      { id: 'dyn', label: 'Dyne', symbol: 'dyn', factor: 1e-5 },
    ],
  },
];

export function getCategory(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId);
}

export function getUnit(categoryId, unitId) {
  return getCategory(categoryId)?.units.find((u) => u.id === unitId);
}

function toBase(unit, value) {
  return unit.toBase ? unit.toBase(value) : value * unit.factor;
}

function fromBase(unit, value) {
  return unit.fromBase ? unit.fromBase(value) : value / unit.factor;
}

export function convert(value, categoryId, fromId, toId) {
  const from = getUnit(categoryId, fromId);
  const to = getUnit(categoryId, toId);
  if (!from || !to) throw new Error(`Unité inconnue : ${fromId} ou ${toId} (${categoryId})`);
  if (fromId === toId) return value;
  return fromBase(to, toBase(from, value));
}

// Accepte la virgule ou le point comme séparateur décimal, et les espaces.
export function parseNumber(text) {
  const cleaned = String(text).replace(/\s/g, '').replace(',', '.');
  if (cleaned === '' || cleaned === '-' || cleaned === '.' || cleaned === '-.') return NaN;
  if (!/^-?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(cleaned)) return NaN;
  return Number(cleaned);
}

// Affichage en français, limité à 10 chiffres significatifs.
export function formatNumber(value) {
  if (!Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-6)) {
    return value.toExponential(6).replace('.', ',').replace(/0+e/, 'e').replace(',e', 'e');
  }
  // Supprime le bruit d'arrondi flottant (ex. 0,30000000000000004).
  const rounded = Number(value.toPrecision(10));
  return rounded.toLocaleString('fr-FR', { maximumFractionDigits: 10 });
}
