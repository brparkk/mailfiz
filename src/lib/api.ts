import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OpenAI API key is required. Please check your .env file.');
}

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

export const generateText = async (
  messages: string,
  language: string,
  tone: keyof typeof toneMap,
  apiKey: string
) => {
  try {
    if (messages.length < 2) {
      throw new Error('Message is too short. Please provide more details.');
    }

    if (messages.length > 5000) {
      throw new Error(
        'Message is too long. Please keep it under 5000 characters.'
      );
    }

    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt(messages, language, tone),
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
