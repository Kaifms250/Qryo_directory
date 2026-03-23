import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import ar from "./locales/ar.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";

const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      es: { translation: es },
      fr: { translation: fr },
      hi: { translation: hi },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

// Apply RTL direction on language change
i18n.on("languageChanged", (lng) => {
  const dir = RTL_LANGUAGES.includes(lng) ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

// Set initial direction
const initDir = RTL_LANGUAGES.includes(i18n.language) ? "rtl" : "ltr";
document.documentElement.dir = initDir;
document.documentElement.lang = i18n.language;

export default i18n;
export { RTL_LANGUAGES };
