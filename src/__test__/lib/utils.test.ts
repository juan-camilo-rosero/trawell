// __tests__/lib/utils.test.ts
import { cn } from '@/lib/utils';

describe('cn - Utility Function', () => {
  it('debe combinar clases simples', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('debe manejar condicionales falsy', () => {
    expect(cn('class1', false && 'class2', null, undefined, 'class3')).toBe('class1 class3');
  });

  it('debe manejar arrays de clases', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('debe manejar objetos de clases', () => {
    expect(cn({ class1: true, class2: false, class3: true })).toBe('class1 class3');
  });

  it('debe manejar strings vacíos', () => {
    expect(cn('', 'class1', '', 'class2')).toBe('class1 class2');
  });

  it('debe retornar string vacío si no hay clases válidas', () => {
    expect(cn(false, null, undefined, '')).toBe('');
  });
});