export const languages = {
  en: 'English',
  it: 'Italiano',
};

export const defaultLang = 'en';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in languages) return lang as keyof typeof languages;
  return defaultLang;
}

export function useTranslatedPath(lang: keyof typeof languages) {
  return function translatePath(path: string) {
    return lang === defaultLang ? path : `/${lang}${path}`;
  };
}

import { translations } from './translations';

export function t(lang: keyof typeof languages, key: string): string {
  const keys = key.split('.');
  let value: unknown = translations[lang];
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  return (value as string) ?? key;
}
