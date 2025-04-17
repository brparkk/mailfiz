import { describe, expect, test, vi, beforeEach } from 'vitest';
import { generateText } from '../lib/api';

// Mock the create function separately so we can spy on it
const mockCreate = vi.fn().mockResolvedValue({
  choices: [
    {
      message: {
        content: 'Mocked API response',
      },
    },
  ],
});

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreate,
        },
      };

      constructor() {
        // Do nothing with constructor params
      }
    },
  };
});

describe('API Tests', () => {
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Message Validation', () => {
    test('should throw error when message is empty', async () => {
      await expect(
        generateText('', 'en', 'default', mockApiKey)
      ).rejects.toThrow('Message is too short. Please provide more details.');
    });

    test('should throw error when message is too long (over 5000 characters)', async () => {
      const longMessage = 'a'.repeat(5001);
      await expect(
        generateText(longMessage, 'en', 'default', mockApiKey)
      ).rejects.toThrow(
        'Message is too long. Please keep it under 5000 characters.'
      );
    });

    test('should throw error when message is too short (under 2 characters)', async () => {
      const shortMessage = 'a';
      await expect(
        generateText(shortMessage, 'en', 'default', mockApiKey)
      ).rejects.toThrow('Message is too short. Please provide more details.');
    });
  });

  describe('API Call Parameters', () => {
    test('should correctly pass message, language, and tone to API', async () => {
      const message = 'Hello world';
      const language = 'ko';
      const tone = 'default';

      const result = await generateText(message, language, tone, mockApiKey);

      // Check that our mock was called
      expect(mockCreate).toHaveBeenCalledTimes(1);

      // Verify the parameters
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
            }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining(message),
            }),
          ]),
          model: 'deepseek-chat',
        })
      );

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
      const result = await generateText(message, 'en', 'default', mockApiKey);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toBe('Mocked API response');
    });
  });
});
