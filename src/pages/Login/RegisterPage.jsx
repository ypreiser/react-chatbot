// src\pages\Login\RegisterPage.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../constants/api";
import { useLanguage } from "../../contexts/LanguageContext";

import styles from "./AuthForm.module.css"; // Use CSS Modules for RegisterPage specific styles
import FormStepper from "../../components/Auth/FormStepper/FormStepper";
import LanguageToggle from "../../components/Auth/LanguageToggle/LanguageToggle";
import PersonalDetailsStep from "../../components/Auth/RegisterForm/PersonalDetailsStep";
import BusinessDetailsStep from "../../components/Auth/RegisterForm/BusinessDetailsStep";
import ContactPersonStep from "../../components/Auth/RegisterForm/ContactPersonStep";

const TOTAL_STEPS = 3;

const RegisterPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    // businessType: "", // Original field, if needed add input and translation for businessEntityTypeLabel
    businessIdNumber: "",
    companyPhone: "",
    businessField: "",
    address: "", // Added for business address as per image implication
    website: "",
    contactName: "",
    contactPhone: "",
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const firstInputRef = useRef(null); // For focusing first input of current step

  useEffect(() => {
    // Focus the first interactive element of the current step form
    // This is a simple approach; more robust might query for specific inputs
    const formElement = document.querySelector(`.${styles.authForm} fieldset`); // Current fieldset
    if (formElement) {
      const firstFocusable = formElement.querySelector(
        "input, select, textarea, button"
      );
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [currentStep]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[+]?[0-9\s-()]{7,}$/.test(phone); // Basic phone validation

  const validateStep = () => {
    const newErrors = {};
    const requiredFieldsGeneral = ["name", "email", "password"];
    const requiredFieldsBusiness = [
      "businessName",
      "businessIdNumber",
      "companyPhone",
      "businessField",
      "address",
    ];
    const requiredFieldsContact = ["contactName", "contactPhone"];

    let fieldsToValidate = [];
    if (currentStep === 1) fieldsToValidate = requiredFieldsGeneral;
    if (currentStep === 2) fieldsToValidate = requiredFieldsBusiness;
    if (currentStep === 3) fieldsToValidate = requiredFieldsContact;

    // Add all fields of the current step for specific validation checks
    const currentStepFields = {
      1: ["name", "email", "password"],
      2: [
        "businessName",
        "businessIdNumber",
        "companyPhone",
        "businessField",
        "address",
        "website",
      ],
      3: ["contactName", "contactPhone"],
    }[currentStep];

    (currentStepFields || []).forEach((field) => {
      // Required check (only for fields marked as required in their respective arrays)
      if (fieldsToValidate.includes(field) && !formData[field]?.trim()) {
        newErrors[field] = t("errorRequiredField");
      } else if (formData[field]) {
        // Only run specific validations if field has value or not required but has content
        // Specific validations
        if (field === "email" && !validateEmail(formData.email)) {
          newErrors.email = t("errorInvalidEmail");
        }
        if (field === "password" && formData.password.length < 6) {
          newErrors.password = t("errorPasswordTooShort");
        }
        if (
          (field === "companyPhone" || field === "contactPhone") &&
          !validatePhone(formData[field])
        ) {
          newErrors[field] = t("errorInvalidPhone");
        }
        // Add website URL validation if needed
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trimStart() })); // Trim leading space, full trim on blur/submit
    if (errors[name]) {
      // Clear error for this field on change
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setGlobalError(""); // Clear global error on any change
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() })); // Trim on blur
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
    setGlobalError(""); // Clear global error when navigating back
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) {
      return; // Don't submit if current step validation fails
    }
    // Final validation for all fields (optional, if some fields are not validated per step)
    setLoading(true);
    setGlobalError("");
    setSuccess("");

    const submissionData = {};
    for (const key in formData) {
      submissionData[key] = formData[key].trim();
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/register`, submissionData, {
        withCredentials: true,
      });
      setSuccess(t("savedSuccess") + " " + t("loading")); // "Saved successfully! Loading..."
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setGlobalError(err.response?.data?.error || t("errorGenericSave"));
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = [
    t("personalInformationLegend"),
    t("businessInformationLegend"),
    t("contactPersonLegend"),
  ];

  return (
    <main className={styles.authPageContainer} id="main-content">
      <LanguageToggle />
      <FormStepper
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        stepLabels={stepLabels}
      />
      <form
        className={styles.authForm}
        onSubmit={handleSubmit}
        noValidate
        aria-labelledby="register-title-h2"
      >
        <h2 id="register-title-h2">{t("registerTitle")}</h2>

        {globalError && (
          <div
            className={`${styles.formMessage} ${styles.formErrorMessageGlobal}`}
            role="alert"
          >
            {globalError}
          </div>
        )}
        {success && (
          <div
            className={`${styles.formMessage} ${styles.formSuccessMessageGlobal}`}
            role="status"
          >
            {success}
          </div>
        )}

        {currentStep === 1 && (
          <PersonalDetailsStep
            data={formData}
            handleChange={handleChange}
            errors={errors}
            ref={firstInputRef}
          />
        )}
        {currentStep === 2 && (
          <BusinessDetailsStep
            data={formData}
            handleChange={handleChange}
            errors={errors}
            ref={firstInputRef}
          />
        )}
        {currentStep === 3 && (
          <ContactPersonStep
            data={formData}
            handleChange={handleChange}
            errors={errors}
            ref={firstInputRef}
          />
        )}

        <div className={styles.formActions}>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className={styles.secondaryAction}
              disabled={loading}
            >
              {t("prevButton")}
            </button>
          )}
          {currentStep < TOTAL_STEPS && (
            <button type="button" onClick={handleNext} disabled={loading}>
              {t("nextButton")}
            </button>
          )}
          {currentStep === TOTAL_STEPS && (
            <button
              type="submit"
              disabled={loading || !!globalError || success}
            >
              {loading ? t("savingButton") : t("submitRegisterButton")}
            </button>
          )}
        </div>
        <div className={styles.formFooterLink}>
          {t("alreadyHaveAccount")}{" "}
          <Link to="/login">{t("loginLinkText")}</Link>
        </div>
      </form>
    </main>
  );
};

export default RegisterPage;
