import { describe, expect, it } from 'vitest';
import { cn } from '../lib/utils';

describe('cn function', () => {
  it('should merge class names correctly', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    expect(cn('p-4', { 'font-bold': true, 'text-lg': false })).toBe(
      'p-4 font-bold'
    );
    expect(cn('mt-2', ['flex', 'items-center'])).toBe('mt-2 flex items-center');
  });

  it('should handle tailwind conflicts correctly', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('p-4 px-2', 'py-2')).toBe('p-4 px-2 py-2');
  });
});
