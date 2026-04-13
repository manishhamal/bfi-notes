import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      Home: "Home",
      "Study Notes": "Study Notes",
      Authors: "Authors",
      "About PSC Prep": "About PSC Prep",
      "Theme Toggle": "Toggle theme",
      "Menu Toggle": "Toggle menu"
    }
  },
  np: {
    translation: {
      Home: "गृहपृष्ठ",
      "Study Notes": "अध्ययन सामग्री",
      Authors: "लेखकहरू",
      "About PSC Prep": "हाम्रो बारेमा",
      "Theme Toggle": "विषयवस्तु बदल्नुहोस्",
      "Menu Toggle": "मेनु हेर्नुहोस्"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
