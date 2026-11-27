import { describe, expect, it } from 'vitest';
import { displayToKg, formatWeight, kgToDisplay, roundToIncrementKg, snapForUnit } from './units';

describe('conversión kg/lb', () => {
  it('lo que escribe el usuario vuelve igual (sin deriva)', () => {
    expect(kgToDisplay(displayToKg(135, 'lb'), 'lb')).toBe(135);
    expect(kgToDisplay(displayToKg(62.5, 'kg'), 'kg')).toBe(62.5);
  });

  it('redondea a 2,5 kg', () => {
    expect(roundToIncrementKg(61.3, 'kg')).toBe(62.5);
    expect(roundToIncrementKg(60.9, 'kg')).toBe(60);
  });

  it('redondea a 5 lb', () => {
    const kg = roundToIncrementKg(displayToKg(137, 'lb'), 'lb');
    expect(kgToDisplay(kg, 'lb')).toBe(135);
  });

  it('kettlebell en saltos de 4 kg', () => {
    expect(roundToIncrementKg(17, 'kg', 'kettlebells')).toBe(16);
    expect(roundToIncrementKg(19, 'lb', 'kettlebells')).toBe(20);
    expect(roundToIncrementKg(1, 'kg', 'kettlebells')).toBe(4);
  });

  it('formatea con coma decimal', () => {
    expect(formatWeight(62.5, 'kg')).toBe('62,5 kg');
    expect(formatWeight(null, 'kg')).toBe('—');
  });
});

describe('ajuste al cambiar de unidad', () => {
  it('65 kg pasa a 145 lb y vuelve a 65 kg', () => {
    const lb = snapForUnit(65, 'lb')!;
    expect(kgToDisplay(lb, 'lb')).toBe(145);
    expect(kgToDisplay(snapForUnit(lb, 'kg')!, 'kg')).toBe(65);
  });
  it('no toca kettlebells ni pesos vacíos', () => {
    expect(snapForUnit(16, 'lb', 'kettlebells')).toBe(16);
    expect(snapForUnit(null, 'lb')).toBeNull();
  });
});
