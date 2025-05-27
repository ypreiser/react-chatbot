// src\pages\BotProfileForm\common\CollapsibleSection.jsx
import React, { useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import commonStyles from "./CommonFormStyles.module.css"; // Shared common styles

const CollapsibleSection = ({
  title,
  children,
  initialOpen = false,
  profiTipKey,
  profiTipReplacements,
  tipAboveContent = false,
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const { t } = useLanguage();
  // ProfiAssistant component would be imported and used here if needed standalone,
  // but for now, tips are integrated into parent components.

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div
      className={`${commonStyles.collapsibleSection} ${
        isOpen ? commonStyles.open : ""
      }`}
    >
      <h3
        className={commonStyles.sectionHeader}
        onClick={toggleOpen}
        role="button"
        tabIndex="0"
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleOpen()}
        aria-expanded={isOpen}
        aria-controls={`section-content-${title?.replace(/\s+/g, "-")}`}
      >
        {title}
        <span
          className={`${commonStyles.arrow} ${isOpen ? commonStyles.open : ""}`}
        >
          ▼
        </span>
      </h3>
      {/* Profi tip logic can be here or passed as part of children */}
      <div
        id={`section-content-${title?.replace(/\s+/g, "-")}`}
        className={`${commonStyles.sectionContent} ${
          isOpen ? commonStyles.open : ""
        }`}
        aria-hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  );
};

export default CollapsibleSection;
