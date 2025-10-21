// utils/env.ts
export function getApiKey(): string {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('❌ DEEPSEEK_API_KEY is undefined');
  return key;
}