// src\components\Common\ProfiAssistant\ProfiAssistant.jsx
// src/components/Common/ProfiAssistant/ProfiAssistant.jsx
import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import styles from "./ProfiAssistant.module.css";
// import profiPenguinImage from '../../../assets/profi-penguin.png'; // Add your penguin image

const ProfiAssistant = ({ tipKey, replacements }) => {
  const { t } = useLanguage();
  const tipText = t(tipKey, replacements);

  if (!tipText || tipText === tipKey) return null; // Don't render if no tip or key not found

  return (
    <div className={styles.profiContainer}>
      {/* <img src={profiPenguinImage} alt="Profi the Penguin" className={styles.profiImage} /> */}
      <div className={styles.profiImagePlaceholder}>🐧</div>{" "}
      {/* Placeholder until image */}
      <div className={styles.profiBubble}>
        <strong>{t("profiTip", "Profi's Tip:")}</strong> {tipText}
      </div>
    </div>
  );
};

export default ProfiAssistant;
