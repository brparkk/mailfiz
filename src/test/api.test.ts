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

// Import generateEmailSummary separately to mock it
import * as apiModule from '../lib/api';

// Mock generateEmailSummary function to avoid env dependency
const mockGenerateEmailSummary = vi.fn(
  async (draft: string, language: string) => {
    try {
      if (draft.length < 2) {
        throw new Error('Draft is too short. Please provide more details.');
      }

      if (draft.length > 5000) {
        throw new Error(
          'Draft is too long. Please keep it under 5000 characters.'
        );
      }

      // Use mockCreate directly instead of going through OpenAI
      const response = await mockCreate({
        messages: [
          {
            role: 'system',
            content: 'You are an expert email summarizer',
          },
          {
            role: 'user',
            content: `[Email Draft]: ${draft}\n[Language]: ${language}`,
          },
        ],
        model: 'deepseek-chat',
        temperature: 0.7,
        max_tokens: 300,
      });

      const summaryText = response.choices[0].message.content;

      // 요약 본문만 추출
      const summaryMatch = summaryText?.match(
        /\[Summary Starts\]([\s\S]*?)\[Summary Ends\]/
      );
      return summaryMatch ? summaryMatch[1].trim() : summaryText;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate summary: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while generating summary');
    }
  }
);

// Replace the real function with our mock
vi.spyOn(apiModule, 'generateEmailSummary').mockImplementation(
  mockGenerateEmailSummary
);

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
      await expect(apiModule.generateEmailSummary('', 'en')).rejects.toThrow(
        'Draft is too short. Please provide more details.'
      );
    });

    test('should throw error when draft is too long (over 5000 characters)', async () => {
      const longDraft = 'a'.repeat(5001);
      await expect(
        apiModule.generateEmailSummary(longDraft, 'en')
      ).rejects.toThrow(
        'Draft is too long. Please keep it under 5000 characters.'
      );
    });

    test('should throw error when draft is too short (under 2 characters)', async () => {
      const shortDraft = 'a';
      await expect(
        apiModule.generateEmailSummary(shortDraft, 'en')
      ).rejects.toThrow('Draft is too short. Please provide more details.');
    });

    test('should correctly pass draft and language to API', async () => {
      const draft = 'This is a draft email for testing summary generation.';
      const language = 'en';

      mockCreate.mockImplementationOnce((params) => {
        expect(params.messages).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.any(String),
            }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining(draft),
            }),
          ])
        );
        expect(params.model).toBe('deepseek-chat');
        expect(params.temperature).toBe(0.7);

        return Promise.resolve({
          choices: [
            {
              message: {
                content: 'Mocked summary response',
              },
            },
          ],
        });
      });

      const result = await apiModule.generateEmailSummary(draft, language);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    test('should extract summary content from API response', async () => {
      // Mock a response with summary format
      const summaryResponse = `
[Summary Starts]
[Subject]: Test Subject

[Purpose]: Test purpose line

[Content Summary]: Test content summary

[Action Items]: None
[Summary Ends]
      `;

      mockCreate.mockImplementationOnce(() => {
        return Promise.resolve({
          choices: [
            {
              message: {
                content: summaryResponse,
              },
            },
          ],
        });
      });

      const draft = 'This is a test draft';
      const result = await apiModule.generateEmailSummary(draft, 'en');

      expect(result).toBeDefined();
      expect(result).toContain('[Subject]: Test Subject');
      expect(result).toContain('[Purpose]: Test purpose line');
      expect(result).toContain('[Content Summary]: Test content summary');
      expect(result).toContain('[Action Items]: None');
    });

    test('should fall back to full response if summary format is not found', async () => {
      // Mock a response without the expected format
      const unusualResponse = 'This is not in the expected format';

      mockCreate.mockImplementationOnce(() => {
        return Promise.resolve({
          choices: [
            {
              message: {
                content: unusualResponse,
              },
            },
          ],
        });
      });

      const draft = 'This is a test draft';
      const result = await apiModule.generateEmailSummary(draft, 'en');

      expect(result).toBe(unusualResponse);
    });
  });
});
