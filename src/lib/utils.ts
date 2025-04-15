import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Filter } from 'bad-words';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

const filter = new Filter();
filter.addWords('wtf', 'retard', 'fml', 'nigga', 'nigger', 'pussy', 'whore');

export async function containsProfanity(input: string): Promise<boolean> {
  const res = await fetch('https://libretranslate.com/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: input,
      source: 'auto',
      target: 'en',
      format: 'text',
    }),
  });

  if (!res.ok) {
    console.error('Translation failed');
    return false; // 실패했으면 막지는 않게
  }

  const data = await res.json();
  const translated = data.translatedText || '';
  return filter.isProfane(translated);
}
