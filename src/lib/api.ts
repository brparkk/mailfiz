import OpenAI from 'openai';

const toneMap = {
  default: 'Neutral and polite. Suitable for general purposes.',
  casual: 'Friendly and relaxed. Use simple words and a conversational tone',
  professional:
    'Formal and respectful. Use clear, business-like language and avoid contractions (e.g. do not).',
};

const systemPrompt = `You are an expert email writer who can compose professional, polite, or casual emails depending on the user's need.  
Based on the message content, preferred tone, and selected language, generate a suitable email response.`;

const summarySystemPrompt = `You are an expert email summarizer who can analyze email drafts and provide concise, structured summaries.
The summary should help the user understand the key points of their email before sending it.`;

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
- Use proper spacing with empty lines between paragraphs.
- Make sure to include TWO newlines between each section (greeting, introduction, main content, etc).

Format your output exactly as follows:
---
[Email Body Starts]
{greeting}

{introduction}

{main_content}

{concluding_remarks}

{closing}

{signature}
[Email Body Ends]
---

Where:
- {greeting}: Appropriate greeting based on tone and context (e.g., "Dear Mr. Smith," or "Hello John,")
- {introduction}: Brief introduction paragraph related to the purpose of the email
- {main_content}: Main message content with appropriate explanations or details
- {concluding_remarks}: Concluding remarks summarizing main points or next steps
- {closing}: Appropriate closing phrase based on tone (e.g., "Best regards," or "Sincerely,")
- {signature}: Signature only if requested, otherwise leave blank

IMPORTANT: Please leave an empty line between each section. Do not remove the empty lines or the email will be difficult to read.
`;

const summaryPrompt = (message: string, language: string) => `
[Email Draft]:
${message}

[Language]: ${language}

Instructions:
- Analyze the email draft and create a concise, structured summary.
- The summary should be in the specified language.
- Format your response exactly according to the template below.
- Keep each section to a maximum of 1-2 lines.
- Ensure proper spacing with empty lines between sections.

Format your response exactly as follows:
---
[Summary Starts]
[Subject]: {subject}

[Purpose]: {purpose}

[Content Summary]: {content_summary}

[Action Items]: {action_items}
[Summary Ends]
---

Where:
- {subject}: A concise, appropriate subject line for this email
- {purpose}: One line describing why this email is being written
- {content_summary}: One to two lines summarizing the main content
- {action_items}: Any requests, deadlines, or actions mentioned in the email, if applicable. If none, write "None".

IMPORTANT: Please leave an empty line between each section. Do not remove the empty lines or the summary will be difficult to read.
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

export const generateEmailSummary = async (
  draft: string,
  language: string,
  apiKey: string
) => {
  try {
    if (draft.length < 2) {
      throw new Error('Draft is too short. Please provide more details.');
    }

    if (draft.length > 5000) {
      throw new Error(
        'Draft is too long. Please keep it under 5000 characters.'
      );
    }

    if (!apiKey) {
      throw new Error('API key is required for generating email summary.');
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
          content: summarySystemPrompt,
        },
        {
          role: 'user',
          content: summaryPrompt(draft, language),
        },
      ],
      model: 'deepseek-chat',
      temperature: 0.7, // 요약은 더 사실적이고 일관성 있게
      max_tokens: 300,
    });

    const summaryText = completion.choices[0].message.content;
    console.log('Summary generated:', summaryText);

    // 요약 본문만 추출
    const summaryMatch = summaryText?.match(
      /\[Summary Starts\]([\s\S]*?)\[Summary Ends\]/
    );
    return summaryMatch ? summaryMatch[1].trim() : summaryText;
  } catch (error) {
    console.error('Error generating summary:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while generating summary');
  }
};
