import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateText } from '../lib/api';

describe('API Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.VITE_OPENAI_API_KEY = 'test-api-key';
    process.env.VITE_GOOGLE_CLOUD_API_KEY = 'test-google-key';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Environment Variables', () => {
    test('should throw error when VITE_OPENAI_API_KEY is missing', () => {
      delete process.env.VITE_OPENAI_API_KEY;
      expect(() => generateText('test message', 'en', 'default')).toThrow(
        'OpenAI API key is required'
      );
    });

    test('should throw error when VITE_GOOGLE_CLOUD_API_KEY is missing', () => {
      delete process.env.VITE_GOOGLE_CLOUD_API_KEY;
      expect(() => generateText('test message', 'en', 'default')).toThrow(
        'Google Cloud API key is required'
      );
    });
  });

  describe('Message Validation', () => {
    test('should throw error when message is empty', () => {
      expect(() => generateText('', 'en', 'default')).toThrow(
        'Message is too short'
      );
    });

    test('should throw error when message is too long', () => {
      const longMessage = 'a'.repeat(5001);
      expect(() => generateText(longMessage, 'en', 'default')).toThrow(
        'Message is too long'
      );
    });

    test('should throw error when message is too short', () => {
      const shortMessage = 'a';
      expect(() => generateText(shortMessage, 'en', 'default')).toThrow(
        'Message is too short'
      );
    });

    test('should throw error when message contains profanity', async () => {
      const profaneMessage = 'This is a bad word: fuck';
      await expect(
        generateText(profaneMessage, 'en', 'default')
      ).rejects.toThrow('Profanity was detected in the input');
    });

    test('should throw error when message contains script tag', () => {
      const scriptMessage = 'Hello <script>alert("xss")</script>';
      expect(() => generateText(scriptMessage, 'en', 'default')).toThrow(
        'Message contains invalid content'
      );
    });

    test('should throw error when message contains HTML tags', () => {
      const htmlMessage = 'Hello <div>world</div>';
      expect(() => generateText(htmlMessage, 'en', 'default')).toThrow(
        'Message contains invalid content'
      );
    });

    test('should throw error when message contains event handlers', () => {
      const eventMessage = 'Hello onclick="alert(1)"';
      expect(() => generateText(eventMessage, 'en', 'default')).toThrow(
        'Message contains invalid content'
      );
    });
  });

  describe('API Call Parameters', () => {
    test('should correctly pass message, language, and tone to API', async () => {
      const message = 'Hello world';
      const language = 'ko';
      const tone = 'default';

      const result = await generateText(message, language, tone);

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
      const result = await generateText(message, 'en', 'default');

      expect(result).toBeDefined();
      if (result === null) {
        throw new Error('Result should not be null');
      }
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
