import { describe, expect, test } from 'vitest';
import { generateText } from '../lib/api';

describe('API Tests', () => {
  let apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  describe('Message Validation', () => {
    test('should throw error when message is empty', async () => {
      await expect(generateText('', 'en', 'default', apiKey)).rejects.toThrow(
        'Message is too short'
      );
    });

    test('should throw error when message is too long (over 5000 characters)', async () => {
      const longMessage = 'a'.repeat(5001);
      await expect(
        generateText(longMessage, 'en', 'default', apiKey)
      ).rejects.toThrow('Message is too long');
    });

    test('should throw error when message is too short (under 2 characters)', async () => {
      const shortMessage = 'a';
      await expect(
        generateText(shortMessage, 'en', 'default', apiKey)
      ).rejects.toThrow('Message is too short');
    });
  });

  describe('API Call Parameters', () => {
    test('should correctly pass message, language, and tone to API', async () => {
      const message = 'Hello world';
      const language = 'ko';
      const tone = 'default';

      const result = await generateText(message, language, tone, apiKey);

      expect(result).toBeDefined();
      if (result === null) {
        throw new Error('Result should not be null');
      }
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Successful API Response', () => {
    test('should return processed message when input is valid', async () => {
      const message = 'Hello, how are you?';
      const result = await generateText(message, 'en', 'default', apiKey);

      expect(result).toBeDefined();
      if (result === null) {
        throw new Error('Result should not be null');
      }
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
