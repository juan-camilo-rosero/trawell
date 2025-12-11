// src/__tests__/unit/helpers/currency.helpers.test.ts
import { convertToCOP, convertFromCOP } from '@/lib/helpers/currency.helpers';

describe('Currency Helpers', () => {
  describe('convertToCOP', () => {
    test('convierte USD a COP correctamente', () => {
      const copAmount = convertToCOP(100, 'USD');
      expect(copAmount).toBe(380000); // 100 * 3800
    });

    test('convierte EUR a COP correctamente', () => {
      const copAmount = convertToCOP(100, 'EUR');
      expect(copAmount).toBe(445000); // 100 * 4450
    });

    test('retorna el mismo valor para COP', () => {
      expect(convertToCOP(1000, 'COP')).toBe(1000);
    });

    test('retorna valor original para moneda desconocida', () => {
      const amount = 1000;
      const result = convertToCOP(amount, 'JPY');
      expect(result).toBe(amount);
    });

    test('maneja valores decimales correctamente', () => {
      const copAmount = convertToCOP(99.99, 'USD');
      expect(copAmount).toBe(379962); // Math.round(99.99 * 3800)
    });

    test('maneja valores negativos', () => {
      const copAmount = convertToCOP(-100, 'USD');
      expect(copAmount).toBe(-380000);
    });

    test('maneja valor 0', () => {
      const copAmount = convertToCOP(0, 'USD');
      expect(copAmount).toBe(0);
    });
  });

  describe('convertFromCOP', () => {
    test('convierte COP a USD correctamente', () => {
      const usdAmount = convertFromCOP(380000, 'USD');
      expect(usdAmount).toBe(100); // 380000 / 3800
    });

    test('convierte COP a EUR correctamente', () => {
      const eurAmount = convertFromCOP(445000, 'EUR');
      expect(eurAmount).toBe(100); // 445000 / 4450
    });

    test('retorna el mismo valor para COP', () => {
      expect(convertFromCOP(1000, 'COP')).toBe(1000);
    });

    test('retorna valor original para moneda desconocida', () => {
      const amount = 1000;
      const result = convertFromCOP(amount, 'JPY');
      expect(result).toBe(amount);
    });

    test('maneja valores decimales con redondeo', () => {
      const usdAmount = convertFromCOP(400000, 'USD');
      expect(usdAmount).toBe(105); // Math.round(400000 / 3800)
    });

    test('maneja valor 0', () => {
      const usdAmount = convertFromCOP(0, 'USD');
      expect(usdAmount).toBe(0);
    });
  });

  describe('Conversiones bidireccionales', () => {
    test('convertir y volver a convertir mantiene el valor aproximado', () => {
      const original = 100;
      const cop = convertToCOP(original, 'USD');
      const backToUsd = convertFromCOP(cop, 'USD');
      
      expect(backToUsd).toBe(original);
    });

    test('conversión COP -> EUR -> COP mantiene el valor aproximado', () => {
      const original = 445000;
      const eur = convertFromCOP(original, 'EUR');
      const backToCop = convertToCOP(eur, 'EUR');
      
      expect(backToCop).toBe(original);
    });
  });
});