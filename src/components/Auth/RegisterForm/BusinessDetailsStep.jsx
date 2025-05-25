// src\components\Auth\RegisterForm\BusinessDetailsStep.jsx
// src/components/Auth/RegisterForm/BusinessDetailsStep.jsx
import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import formStyles from "../../../pages/Login/AuthForm.module.css";

const BusinessDetailsStep = ({ data, handleChange, errors }) => {
  const { t } = useLanguage();

  return (
    <fieldset className={formStyles.fieldset}>
      <legend>{t("businessInformationLegend")}</legend>
      <div className={formStyles.stepRow}>
        <div className={formStyles.formGroup}>
          <label htmlFor="businessName">{t("businessNameLabel")}</label>
          <input
            id="businessName"
            type="text"
            name="businessName"
            value={data.businessName}
            onChange={handleChange}
            required
            autoComplete="organization"
            aria-describedby="businessName-error"
            aria-invalid={!!errors.businessName}
          />
          {errors.businessName && (
            <span id="businessName-error" className={formStyles.inputErrorText}>
              {errors.businessName}
            </span>
          )}
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="businessIdNumber">{t("businessIdLabel")}</label>
          <input
            id="businessIdNumber"
            type="text"
            name="businessIdNumber"
            value={data.businessIdNumber}
            onChange={handleChange}
            required
            aria-describedby="businessIdNumber-error"
            aria-invalid={!!errors.businessIdNumber}
          />
          {errors.businessIdNumber && (
            <span
              id="businessIdNumber-error"
              className={formStyles.inputErrorText}
            >
              {errors.businessIdNumber}
            </span>
          )}
        </div>
      </div>

      <div className={formStyles.stepRow}>
        <div className={formStyles.formGroup}>
          <label htmlFor="businessField">{t("businessFieldLabel")}</label>
          <input
            id="businessField"
            type="text"
            name="businessField"
            value={data.businessField}
            onChange={handleChange}
            required
            aria-describedby="businessField-error"
            aria-invalid={!!errors.businessField}
          />
          {errors.businessField && (
            <span
              id="businessField-error"
              className={formStyles.inputErrorText}
            >
              {errors.businessField}
            </span>
          )}
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="companyPhone">{t("companyPhoneLabel")}</label>
          <input
            id="companyPhone"
            type="tel"
            name="companyPhone"
            value={data.companyPhone}
            onChange={handleChange}
            required
            autoComplete="tel-national"
            aria-describedby="companyPhone-error"
            aria-invalid={!!errors.companyPhone}
          />
          {errors.companyPhone && (
            <span id="companyPhone-error" className={formStyles.inputErrorText}>
              {errors.companyPhone}
            </span>
          )}
        </div>
      </div>

      <div className={formStyles.stepRow}>
        <div
          className={`${formStyles.formGroup} ${formStyles.formGroupFullWidth}`}
        >
          <label htmlFor="address">{t("addressLabel")}</label>
          <input
            id="address"
            type="text"
            name="address"
            value={data.address}
            onChange={handleChange}
            required
            autoComplete="street-address"
            aria-describedby="address-error"
            aria-invalid={!!errors.address}
          />
          {errors.address && (
            <span id="address-error" className={formStyles.inputErrorText}>
              {errors.address}
            </span>
          )}
        </div>
      </div>

      <div className={formStyles.stepRow}>
        <div
          className={`${formStyles.formGroup} ${formStyles.formGroupFullWidth}`}
        >
          <label htmlFor="website">{t("websiteLabel")}</label>
          <input
            id="website"
            type="url"
            name="website"
            value={data.website}
            onChange={handleChange}
            placeholder="https://example.com"
            autoComplete="url"
            aria-describedby="website-error"
            aria-invalid={!!errors.website}
          />
          {errors.website && (
            <span id="website-error" className={formStyles.inputErrorText}>
              {errors.website}
            </span>
          )}
        </div>
      </div>
      {/* The businessEntityTypeLabel can be added here if it's a distinct field */}
    </fieldset>
  );
};

export default BusinessDetailsStep;
