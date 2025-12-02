
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  // Local state to ensure UI updates immediately even if i18n is slow to react
  const [lang, setLang] = useState(i18n.language || 'en');

  useEffect(() => {
    // Sync with the key defined in src/i18n/index.ts
    const savedLang = localStorage.getItem('decide-app-language');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
      setLang(savedLang);
    }
  }, [i18n]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLang(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('decide-app-language', newLang);
  };

  return (
    <div className="relative z-50">
      <select
        value={lang}
        onChange={handleChange}
        className="appearance-none bg-dark-elevated text-white text-sm font-bold border-2 border-gray-600 rounded-lg pl-4 pr-8 py-2.5 cursor-pointer focus:outline-none focus:border-gold hover:border-gray-400 transition-colors shadow-lg"
        aria-label="Select Language"
        style={{
           backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFC300%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
           backgroundRepeat: 'no-repeat',
           backgroundPosition: 'right .7em top 50%',
           backgroundSize: '.65em auto'
        }}
      >
        <option value="en">🇺🇸 English</option>
        <option value="es">🇲🇽 Español</option>
        <option value="pt">🇧🇷 Português</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
