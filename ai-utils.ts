// AI prompt logic
import { getApiKey } from './utils/env';
const API_URL = 'https://api.deepseek.com/chat/completions';

export async function getAICommitMessage(diff: string): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You write concise and clear Git commit messages.',
        },
        {
          role: 'user',
          content: `Generate a commit message for the following Git diff:\n\n${diff}`,
        },
      ],
      temperature: 0.5,
    }),
  });

  const data = await response.json();
  // console.log('🧪 DeepSeek response:', JSON.stringify(data, null, 2));

  // 🔥 UX enhancement: helpful + savage
  if (data.error?.message?.toLowerCase().includes('insufficient balance')) {
    throw new Error(
      '💸 DeepSeek says you’re broke. Top up your AI funds at https://platform.deepseek.com/ before tryna automate like a baller.'
    );
  }

  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Unexpected DeepSeek response:\n' + JSON.stringify(data));
  }
  return data.choices[0].message.content.trim();
}

export async function explainDiff(diff: string): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-coder',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful code assistant that explains Git changes.',
        },
        {
          role: 'user',
          content: `Explain what was changed in this diff:\n\n${diff}`,
        },
      ],
      temperature: 0.5,
    }),
  });

  const data = await response.json();
  // console.log('🧪 DeepSeek response:', JSON.stringify(data, null, 2));

  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Unexpected DeepSeek response:\n' + JSON.stringify(data));
  }
  return data.choices[0].message.content.trim();
}