import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => changeLanguage('es')}
        className={`flex items-center gap-1 px-2 py-1 rounded transition ${
          i18n.language === 'es' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label="Español"
      >
        <span className="text-xl">🇪🇸</span>
        <span className="text-xs font-medium">ES</span>
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`flex items-center gap-1 px-2 py-1 rounded transition ${
          i18n.language === 'en' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label="English"
      >
        <span className="text-xl">🇬🇧</span>
        <span className="text-xs font-medium">EN</span>
      </button>
    </div>
  );
};

export default LanguageSelector;
