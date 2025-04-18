import { useCallback, useEffect, useState } from 'react';
import { useDataloader } from './useDataloader';
import { useAuth } from './useAuth';

export interface Lang {
  title: string;
  lang: string;
  locale: string;
}

export interface OptionState {
  expertlevel?: string;
  language?: string;
  mic?: string;
  quickpace?: string;
  replevel?: string;
  screencolor?: string;
  volume?: string;
  bt_enable?: boolean;
  [key: string]: any;
}

export interface BreakTest {
  break: number;
  test: string;
  alias: string;
}

const defaultLangs: Lang[] = [
  { title: 'English', lang: 'english', locale: 'en' },
  // Add more languages if needed
];

const defaultOptions: OptionState = {
  expertlevel: '2',
  language: 'english',
  mic: '50',
  quickpace: '1',
  replevel: '50',
  screencolor: '1',
  volume: '1',
};

const defaultBreakTests: BreakTest[] = [
  { break: 1, test: 'b1t', alias: 'test' },
  { break: 2, test: 'b2t', alias: 'test' },
  { break: 3, test: 'b3t', alias: 'test' },
  { break: 4, test: 'b4t', alias: 'test' },
  { break: 5, test: 'b5t', alias: 'test' },
];

export function useOptions() {
  const dl = useDataloader();
  const { loggedIn } = useAuth();
  const [langs, setLangs] = useState<Lang[]>(defaultLangs);
  const [currentLocale, setCurrentLocale] = useState('en');
  const [currentFallbackLocale, setCurrentFallbackLocale] = useState('en');
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [lastRequestedLang, setLastRequestedLang] = useState('');
  const [pauseOnInstruction, setPauseOnInstruction] = useState(false);
  const [showWordTranslation, setShowWordTranslation] = useState(true);
  const [options, setOptions] = useState<OptionState>(defaultOptions);
  const [breakTests] = useState<BreakTest[]>(defaultBreakTests);
  const [loading, setLoading] = useState(true);

  // Load locales and options on mount (only if logged in)
  useEffect(() => {
    let cancelled = false;
    if (!loggedIn) {
      if (!loading) setLoading(true);
      return;
    }
    // Prevent double-fetching
    setLoading(true);
    (async () => {
      try {
        const locales = await dl.getLocales();
        if (!cancelled) setLangs(locales || defaultLangs);
      } catch (e) {
        if (!cancelled) setLangs(defaultLangs);
      }
      try {
        const opts = await dl.getOptions();
        if (!cancelled) setOptions(opts || defaultOptions);
      } catch (e) {
        if (!cancelled) setOptions(defaultOptions);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [loggedIn]);

  // Language/locale setters
  const setLanguage = useCallback(
    async (lang: string) => {
      setLastRequestedLang(lang);
      const found = langs.find((l) => l.lang === lang);
      if (found) {
        setCurrentLocale(found.locale);
        setCurrentLanguage(found.lang);
        await dl.setLocale(found.locale);
      }
    },
    [langs, dl]
  );

  const setLocale = useCallback(
    async (loc: string) => {
      const found = langs.find((l) => l.locale === loc);
      if (found) {
        setCurrentLocale(found.locale);
        setCurrentLanguage(found.lang);
        await dl.setLocale(found.locale);
      }
    },
    [langs, dl]
  );

  // Option setters
  const updateOptions = useCallback(
    async (opts: OptionState) => {
      setOptions(opts);
      await dl.saveOptions(opts);
    },
    [dl]
  );

  // PauseOnInstruction
  const enablePauseOnInstruction = () => setPauseOnInstruction(true);
  const disablePauseOnInstruction = () => setPauseOnInstruction(false);

  // Break test
  const breakTestEnabled = () => !!options.bt_enable;
  const getBreakTest = (b: number) => breakTests.find((bt) => bt.break === b) || null;

  return {
    langs,
    options,
    loading,
    currentLocale,
    currentFallbackLocale,
    currentLanguage,
    pauseOnInstruction,
    showWordTranslation,
    setLanguage,
    setLocale,
    updateOptions,
    enablePauseOnInstruction,
    disablePauseOnInstruction,
    breakTestEnabled,
    getBreakTest,
    setShowWordTranslation,
  };
}
