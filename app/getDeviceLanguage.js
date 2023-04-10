import { locale } from "expo-localization";

const SUPPORTED_LANGUAGES = {
  en: "en-US",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
  zh: "zh-CN",
};

const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.en;

export const getDeviceLanguage = () => {
  const selectedLang =
    SUPPORTED_LANGUAGES[locale.split("-")[0]] ?? DEFAULT_LANGUAGE;
  return selectedLang;
};
