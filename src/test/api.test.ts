import { describe, expect, test, vi, beforeEach } from 'vitest';
import { generateText, generateEmailSummary } from '../lib/api';

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

// Mock environment variables
vi.mock('@/env', () => {
  return {
    env: {
      VITE_OPENAI_API_KEY: 'mock-api-key',
    },
  };
});

// Add a mock for import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_OPENAI_API_KEY: 'mock-api-key',
    },
  },
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

  describe('Email Summary Generation', () => {
    test('should throw error when draft is empty', async () => {
      await expect(generateEmailSummary('', 'en')).rejects.toThrow(
        'Draft is too short. Please provide more details.'
      );
    });

    test('should throw error when draft is too long (over 5000 characters)', async () => {
      const longDraft = 'a'.repeat(5001);
      await expect(generateEmailSummary(longDraft, 'en')).rejects.toThrow(
        'Draft is too long. Please keep it under 5000 characters.'
      );
    });

    test('should throw error when draft is too short (under 2 characters)', async () => {
      const shortDraft = 'a';
      await expect(generateEmailSummary(shortDraft, 'en')).rejects.toThrow(
        'Draft is too short. Please provide more details.'
      );
    });

    test('should correctly pass draft and language to API', async () => {
      const draft = 'This is a draft email for testing summary generation.';
      const language = 'en';

      const result = await generateEmailSummary(draft, language);

      // Check that our mock was called
      expect(mockCreate).toHaveBeenCalledTimes(1);

      // Verify the parameters
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('expert email summarizer'),
            }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining(draft),
            }),
          ]),
          model: 'deepseek-chat',
          temperature: 0.7, // Check specific temperature for summaries
        })
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    test('should extract summary content from API response', async () => {
      // Mock a response with summary format
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: `
[Summary Starts]
[Subject]: Test Subject

[Purpose]: Test purpose line

[Content Summary]: Test content summary

[Action Items]: None
[Summary Ends]
              `,
            },
          },
        ],
      });

      const draft = 'This is a test draft';
      const result = await generateEmailSummary(draft, 'en');

      expect(result).toBeDefined();
      expect(result).toContain('[Subject]: Test Subject');
      expect(result).toContain('[Purpose]: Test purpose line');
      expect(result).toContain('[Content Summary]: Test content summary');
      expect(result).toContain('[Action Items]: None');
    });

    test('should fall back to full response if summary format is not found', async () => {
      // Mock a response without the expected format
      const unusualResponse = 'This is not in the expected format';
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: unusualResponse,
            },
          },
        ],
      });

      const draft = 'This is a test draft';
      const result = await generateEmailSummary(draft, 'en');

      expect(result).toBe(unusualResponse);
    });
  });
});
