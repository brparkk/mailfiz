import ky from 'ky';

const baseApi = ky.create({
  prefixUrl: 'https://api.deepseek.com',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
  },
});

export const api = {
  get: (url: string) => baseApi.get(url).json(),
  post: (url: string, body: any) => baseApi.post(url, { json: body }).json(),
};

const toneMap = {
  default: 'Neutral and polite. Suitable for general purposes.',
  casual: 'Friendly and relaxed. Use simple words and a conversational tone',
  professional:
    'Formal and respectful. Use clear, business-like language and avoid contractions (e.g. do not).',
};

const systemPrompt = `You are an expert email writer who can compose professional, polite, or casual emails depending on the user’s need.  
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
  tone: keyof typeof toneMap
) => {
  const response = (await api.post('/v1/chat/completions', {
    model: 'deepseek-chat',
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
    temperature: 0.7,
    max_tokens: 1000,
  })) as {
    choices: [{ message: { content: string } }];
  };

  return response.choices[0].message.content;
};
