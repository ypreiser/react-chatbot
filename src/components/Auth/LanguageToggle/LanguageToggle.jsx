// src\components\Auth\LanguageToggle\LanguageToggle.jsx
// src/components/Auth/LanguageToggle/LanguageToggle.jsx
import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import styles from "./LanguageToggle.module.css";

const LanguageToggle = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage((lang) => (lang === "en" ? "he" : "en"));
  };

  return (
    <div className={styles.languageToggleContainer}>
      <label htmlFor="language-toggle-button">{t("languageSelector")}</label>
      <button
        id="language-toggle-button"
        onClick={toggleLanguage}
        className={styles.toggleButton}
        aria-pressed={language === "he"} // Example of aria for toggle state
      >
        {language === "en" ? t("hebrew") : t("english")}
      </button>
    </div>
  );
};

export default LanguageToggle;
