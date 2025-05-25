// src\components\Auth\RegisterForm\ContactPersonStep.jsx
// src/components/Auth/RegisterForm/ContactPersonStep.jsx
import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import formStyles from "../../../pages/Login/AuthForm.module.css";

const ContactPersonStep = ({ data, handleChange, errors }) => {
  const { t } = useLanguage();

  return (
    <fieldset className={formStyles.fieldset}>
      <legend>{t("contactPersonLegend")}</legend>
      <div className={formStyles.stepRow}>
        <div className={formStyles.formGroup}>
          <label htmlFor="contactName">{t("contactNameLabel")}</label>
          <input
            id="contactName"
            type="text"
            name="contactName"
            value={data.contactName}
            onChange={handleChange}
            required
            autoComplete="name"
            aria-describedby="contactName-error"
            aria-invalid={!!errors.contactName}
          />
          {errors.contactName && (
            <span id="contactName-error" className={formStyles.inputErrorText}>
              {errors.contactName}
            </span>
          )}
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="contactPhone">{t("contactPhoneLabel")}</label>
          <input
            id="contactPhone"
            type="tel"
            name="contactPhone"
            value={data.contactPhone}
            onChange={handleChange}
            required
            autoComplete="tel"
            aria-describedby="contactPhone-error"
            aria-invalid={!!errors.contactPhone}
          />
          {errors.contactPhone && (
            <span id="contactPhone-error" className={formStyles.inputErrorText}>
              {errors.contactPhone}
            </span>
          )}
        </div>
      </div>
    </fieldset>
  );
};

export default ContactPersonStep;
