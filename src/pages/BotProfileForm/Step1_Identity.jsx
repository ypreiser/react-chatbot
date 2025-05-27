// src\pages\BotProfileForm\Step1_Identity.jsx
// src/pages/BotProfileForm/Step1_Identity.jsx
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import formStyles from "./BotProfileForm.module.css"; // Main form styles
import ProfiAssistant from "../../components/Common/ProfiAssistant/ProfiAssistant";
import CollapsibleSection from "./common/CollapsibleSection";

const Step1_Identity = ({ profile, handleChange, errors, formMode }) => {
  const { t } = useLanguage();

  const communicationStyles = [
    { value: "Friendly", label: t("styleFriendly") },
    { value: "Formal", label: t("styleFormal") },
    { value: "Humorous", label: t("styleHumorous") },
    { value: "Professional", label: t("styleProfessional") },
    { value: "Custom", label: t("styleCustom") },
  ];

  return (
    <div className={formStyles.formStep}>
      <ProfiAssistant tipKey="profiNameTip" />
      <CollapsibleSection title={t("basicInfoSectionTitle")} initialOpen={true}>
        <div className={formStyles.formGroup}>
          <label htmlFor="bot-name">{t("botNameLabel")}</label>
          <input
            id="bot-name"
            name="name"
            type="text"
            value={profile.name || ""}
            onChange={handleChange}
            placeholder={t("botNamePlaceholder")}
            required
            disabled={formMode === "update"}
            aria-invalid={!!errors.name}
            aria-describedby="bot-name-error bot-name-note"
          />
          {formMode === "update" && (
            <small id="bot-name-note" className={formStyles.fieldNote}>
              {t("botNameUpdateNote")}
            </small>
          )}
          {errors.name && (
            <span id="bot-name-error" className={formStyles.inlineError}>
              {errors.name}
            </span>
          )}
        </div>

        <div className={formStyles.formGroup}>
          <label htmlFor="bot-description">{t("botDescriptionLabel")}</label>
          <textarea
            id="bot-description"
            name="description"
            value={profile.description || ""}
            onChange={handleChange}
            placeholder={t("botDescriptionPlaceholder")}
            rows="2"
            maxLength="500"
            aria-describedby="bot-description-error"
          />
          {errors.description && (
            <span id="bot-description-error" className={formStyles.inlineError}>
              {errors.description}
            </span>
          )}
        </div>

        <ProfiAssistant tipKey="profiIdentityTip" />
        <div className={formStyles.formGroup}>
          <label htmlFor="bot-identity">{t("botIdentityLabel")}</label>
          <textarea
            id="bot-identity"
            name="identity"
            value={profile.identity || ""}
            onChange={handleChange}
            placeholder={t("botIdentityPlaceholder")}
            required
            rows="4"
            aria-invalid={!!errors.identity}
            aria-describedby="bot-identity-error"
          />
          {errors.identity && (
            <span id="bot-identity-error" className={formStyles.inlineError}>
              {errors.identity}
            </span>
          )}
        </div>

        <div className={formStyles.formGroup}>
          <label htmlFor="bot-communicationStyle">
            {t("botCommunicationStyleLabel")}
          </label>
          <select
            id="bot-communicationStyle"
            name="communicationStyle"
            value={profile.communicationStyle || "Friendly"}
            onChange={handleChange}
          >
            {communicationStyles.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>

        <div className={`${formStyles.formGroup} ${formStyles.checkboxGroup}`}>
          <input
            type="checkbox"
            id="bot-isEnabled"
            name="isEnabled"
            checked={profile.isEnabled}
            onChange={handleChange}
          />
          <label htmlFor="bot-isEnabled">{t("botIsEnabledLabel")}</label>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default Step1_Identity;
