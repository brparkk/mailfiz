import OpenAI from 'openai';
import { LanguageServiceClient } from '@google-cloud/language';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const googleApiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;

if (!apiKey) {
  throw new Error('OpenAI API key is required. Please check your .env file.');
}

if (!googleApiKey) {
  throw new Error(
    'Google Cloud API key is required. Please check your .env file.'
  );
}

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey,
  dangerouslyAllowBrowser: true,
});

// Initialize Google Cloud Language client
const languageClient = new LanguageServiceClient({
  key: googleApiKey,
});

const toneMap = {
  default: 'Neutral and polite. Suitable for general purposes.',
  casual: 'Friendly and relaxed. Use simple words and a conversational tone',
  professional:
    'Formal and respectful. Use clear, business-like language and avoid contractions (e.g. do not).',
};

const systemPrompt = `You are an expert email writer who can compose professional, polite, or casual emails depending on the user's need.  
Based on the message content, preferred tone, and selected language, generate a suitable email response.`;

const userPrompt = (
  message: string,
  language: string,
  tone: keyof typeof toneMap
) => `

[Message from user]: ${message}  
[Language]: ${language}  
[Tone]: ${toneMap[tone]}

Instructions:  
- Write the email in the selected [Language].  
- Maintain the selected [Tone] consistently throughout the email.  
- Begin with a greeting and a short introduction related to the situation.  
- In the body, provide an appropriate response, explanation, or message based on the context.  
- End with a polite closing that fits the tone and situation.  
- Do not include a signature unless specifically requested.

Format your output like this:
---
[Email Body Starts]

{{Generated email here}}

[Email Body Ends]
---
`;

// Function to detect profanity using Google Cloud Natural Language API
const detectProfanity = async (
  text: string,
  language: string
): Promise<boolean> => {
  try {
    const [result] = await languageClient.analyzeSentiment({
      document: {
        content: text,
        type: 'PLAIN_TEXT',
        language: language,
      },
    });

    // Analyze sentiment and content for potential profanity
    // This is a simplified example - you might want to adjust these thresholds
    const sentimentScore = result.documentSentiment?.score || 0;
    const sentimentMagnitude = result.documentSentiment?.magnitude || 0;

    // If the sentiment is very negative and has high magnitude, it might indicate profanity
    return sentimentScore < -0.5 && sentimentMagnitude > 0.5;
  } catch (error) {
    console.error('Error detecting profanity:', error);
    return false; // Default to false if there's an error
  }
};

// Add input validation function
const validateAndSanitizeInput = async (input: string, language: string) => {
  // Remove or escape potentially harmful characters
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=(["'][^"']*["'])/g, '') // Remove event handlers
    .trim();

  // Check if the input is too short or too long
  if (sanitized.length < 2) {
    throw new Error('Message is too short. Please provide more details.');
  }
  if (sanitized.length > 5000) {
    throw new Error(
      'Message is too long. Please keep it under 5000 characters.'
    );
  }

  // Check for profanity using Google Cloud Natural Language API
  const hasProfanity = await detectProfanity(sanitized, language);
  if (hasProfanity) {
    throw new Error('Profanity was detected in the input');
  }

  return sanitized;
};

export const generateText = async (
  messages: string,
  language: string,
  tone: keyof typeof toneMap
) => {
  try {
    // Validate and sanitize input
    const sanitizedMessage = await validateAndSanitizeInput(messages, language);

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt(sanitizedMessage, language, tone),
        },
      ],
      model: 'deepseek-chat',
      temperature: 1.5,
      max_tokens: 1000,
    });

    console.log(completion.choices[0].message.content);

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate text: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while generating text');
  }
};
