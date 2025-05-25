// src\components\Auth\RegisterForm\PersonalDetailsStep.jsx
import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import formStyles from "../../../pages/Login/AuthForm.module.css"; // Shared auth form styles

const PersonalDetailsStep = ({ data, handleChange, errors }) => {
  const { t } = useLanguage();

  return (
    <fieldset className={formStyles.fieldset}>
      <legend>{t("personalInformationLegend")}</legend>
      <div className={formStyles.stepRow}>
        <div className={formStyles.formGroup}>
          <label htmlFor="name">{t("fullNameLabel")}</label>
          <input
            id="name"
            type="text"
            name="name"
            value={data.name}
            onChange={handleChange}
            required
            autoComplete="name"
            aria-describedby="name-error"
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <span id="name-error" className={formStyles.inputErrorText}>
              {errors.name}
            </span>
          )}
        </div>
      </div>

      <div className={formStyles.stepRow}>
        <div className={formStyles.formGroup}>
          <label htmlFor="email">{t("emailLabel")}</label>
          <input
            id="email"
            type="email"
            name="email"
            value={data.email}
            onChange={handleChange}
            required
            autoComplete="email"
            aria-describedby="email-error"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <span id="email-error" className={formStyles.inputErrorText}>
              {errors.email}
            </span>
          )}
        </div>
      </div>

      <div className={formStyles.stepRow}>
        <div className={formStyles.formGroup}>
          <label htmlFor="password">{t("passwordLabel")}</label>
          <input
            id="password"
            type="password"
            name="password"
            value={data.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            aria-describedby="password-error password-requirements"
            aria-invalid={!!errors.password}
          />
          <small
            id="password-requirements"
            className={formStyles.passwordRequirementText}
          >
            {t("passwordRequirements")}
          </small>
          {errors.password && (
            <span id="password-error" className={formStyles.inputErrorText}>
              {errors.password}
            </span>
          )}
        </div>
      </div>
    </fieldset>
  );
};

export default PersonalDetailsStep;
