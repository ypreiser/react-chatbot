// src\contexts\LanguageContext.jsx
// src/contexts/LanguageContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { translations } from "../data/translations";

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en"); // Default language

  const t = (key, replacements = {}) => {
    let translation =
      translations[language][key] || translations["en"][key] || key;
    Object.keys(replacements).forEach((rKey) => {
      translation = translation.replace(`{${rKey}}`, replacements[rKey]);
    });
    return translation;
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
