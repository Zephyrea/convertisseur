// Tests des conversions avec l'outil intégré à Node (≥ 22) : `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIES, convert, parseNumber, formatNumber } from '../units.js';

function close(actual, expected, tol = 1e-9) {
  const ok = Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected));
  assert.ok(ok, `attendu ${expected}, obtenu ${actual}`);
}

// Distances
test('1 mille nautique = 1852 m', () => close(convert(1, 'distance', 'nmi', 'm'), 1852));
test('1 m = 3,28084 ft', () => close(convert(1, 'distance', 'm', 'ft'), 3.280839895, 1e-9));
test('1 mi = 1,609344 km', () => close(convert(1, 'distance', 'mi', 'km'), 1.609344));
test('12 in = 1 ft', () => close(convert(12, 'distance', 'in', 'ft'), 1));
test('1 NM = 6076,12 ft', () => close(convert(1, 'distance', 'nmi', 'ft'), 6076.115486, 1e-9));

// Vitesses
test('1 kt = 0,514444 m/s', () => close(convert(1, 'speed', 'kt', 'ms'), 0.5144444444));
test('1 m/s = 1,943844 kt', () => close(convert(1, 'speed', 'ms', 'kt'), 1.9438444924, 1e-9));
test('100 km/h = 27,7778 m/s', () => close(convert(100, 'speed', 'kmh', 'ms'), 27.7777777778));
test('60 mph = 96,56064 km/h', () => close(convert(60, 'speed', 'mph', 'kmh'), 96.56064));
test('1 kft/h = 0,0846667 m/s', () => close(convert(1, 'speed', 'kfth', 'ms'), 0.0846666667, 1e-9));
test('1 kft/h = 1000 ft/h = 1/3,6 ft/s', () => close(convert(3.6, 'speed', 'kfth', 'fts'), 1));
test('1 kt = 6,076 kft/h', () => close(convert(1, 'speed', 'kt', 'kfth'), 6.076115486, 1e-9));

// Masses
test('1 lb = 453,59237 g', () => close(convert(1, 'mass', 'lb', 'g'), 453.59237));
test('16 oz = 1 lb', () => close(convert(16, 'mass', 'oz', 'lb'), 1));
test('1 st = 14 lb', () => close(convert(1, 'mass', 'st', 'lb'), 14));
test('1 t = 1 000 000 g', () => close(convert(1, 'mass', 't', 'g'), 1e6));

// Températures
test('0 °C = 32 °F', () => close(convert(0, 'temperature', 'c', 'f'), 32));
test('100 °C = 212 °F', () => close(convert(100, 'temperature', 'c', 'f'), 212));
test('-40 °F = -40 °C', () => close(convert(-40, 'temperature', 'f', 'c'), -40));
test('0 K = -273,15 °C', () => close(convert(0, 'temperature', 'k', 'c'), -273.15));
test('98,6 °F = 310,15 K', () => close(convert(98.6, 'temperature', 'f', 'k'), 310.15));

// Forces
test('1 kgf = 9,80665 N', () => close(convert(1, 'force', 'kgf', 'n'), 9.80665));
test('1 lbf = 4,448222 N', () => close(convert(1, 'force', 'lbf', 'n'), 4.4482216153));
test('1 daN = 10 N', () => close(convert(1, 'force', 'dan', 'n'), 10));
test('1 kip = 1000 lbf', () => close(convert(1, 'force', 'kip', 'lbf'), 1000));
test('16 ozf = 1 lbf', () => close(convert(16, 'force', 'ozf', 'lbf'), 1));
test('1 tf = 1000 kgf', () => close(convert(1, 'force', 'tf', 'kgf'), 1000));
test('1 N = 100 000 dyn', () => close(convert(1, 'force', 'n', 'dyn'), 1e5));

// Unités par défaut demandées
test('unités par défaut', () => {
  const d = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.defaults.join('>')]));
  assert.equal(d.distance, 'm>ft');
  assert.equal(d.mass, 'kg>lb');
  assert.equal(d.temperature, 'c>f');
});

// Aller-retour sur toutes les paires d'unités
test('aller-retour cohérent pour toutes les paires', () => {
  for (const cat of CATEGORIES) {
    for (const a of cat.units) {
      for (const b of cat.units) {
        const back = convert(convert(123.456, cat.id, a.id, b.id), cat.id, b.id, a.id);
        close(back, 123.456, 1e-9);
      }
    }
  }
});

// Saisie et affichage
test('parseNumber accepte virgule, point et espaces', () => {
  assert.equal(parseNumber('3,5'), 3.5);
  assert.equal(parseNumber('3.5'), 3.5);
  assert.equal(parseNumber('1 000,25'), 1000.25);
  assert.equal(parseNumber('-12'), -12);
  assert.equal(parseNumber('1e3'), 1000);
});
test('parseNumber rejette les saisies invalides', () => {
  for (const s of ['', '-', 'abc', '1,2,3', '1..2']) assert.ok(Number.isNaN(parseNumber(s)), s);
});
test('formatNumber enlève le bruit flottant', () => {
  assert.equal(formatNumber(0.1 + 0.2).replace(/\s/g, ''), '0,3');
  assert.equal(formatNumber(1852).replace(/\s/g, ''), '1852');
});
