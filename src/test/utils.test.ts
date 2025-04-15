import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cn, containsProfanity } from '../lib/utils';

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

describe('containsProfanity function', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return true when text contains profanity', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ translatedText: 'this text has wtf in it' }),
    });

    const result = await containsProfanity('some text with profanity');
    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should return false when text does not contain profanity', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ translatedText: 'this is clean text' }),
    });

    const result = await containsProfanity('clean text');
    expect(result).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should return false when translation fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    const result = await containsProfanity('some text');
    expect(result).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should call the translation API with correct parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ translatedText: 'test' }),
    });

    await containsProfanity('test input');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://libretranslate.com/translate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: 'test input',
          source: 'auto',
          target: 'en',
          format: 'text',
        }),
      }
    );
  });
});
