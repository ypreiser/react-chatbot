// src\pages\BotProfileForm\BotProfileForm.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../constants/api";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "./BotProfileForm.module.css";
import commonStyles from "./common/CommonFormStyles.module.css"; // Ensure this is created and used

import FormStepper from "../../components/Auth/FormStepper/FormStepper";
import ProfiAssistant from "../../components/Common/ProfiAssistant/ProfiAssistant";
import CollapsibleSection from "./common/CollapsibleSection";

// Step Components
import Step1_Identity from "./Step1_Identity";
import Step2_Knowledge from "./Step2_Knowledge";
import Step3_Interaction from "./Step3_Interaction";
import Step4_Advanced from "./Step4_Advanced";

const getInitialBotProfileState = (name = "") => ({
  name: name,
  description: "",
  identity: "",
  communicationStyle: "Friendly",
  primaryLanguage: "en",
  secondaryLanguage: "",
  languageRules: [],
  knowledgeBaseItems: [], // { topic: "", content: "" }
  tags: [],
  initialInteraction: [],
  interactionGuidelines: [],
  exampleResponses: [], // { scenario: "", response: "" }
  edgeCases: [], // { case: "", action: "" }
  tools: { name: "", description: "", purposes: [] },
  privacyAndComplianceGuidelines: "",
  mcpServers: [], // { name: "", command: "", args: [], enabled: true }
  isEnabled: true,
  isPubliclyListed: false,
});

const TOTAL_STEPS = 4;

export default function BotProfileForm({ user }) {
  const { t, language } = useLanguage();

  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState(getInitialBotProfileState());
  const [fetchInputName, setFetchInputName] = useState("");
  const [profileList, setProfileList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [globalSuccess, setGlobalSuccess] = useState("");
  const [formMode, setFormMode] = useState("initial"); // 'initial', 'create', 'update'
  const [errors, setErrors] = useState({});

  const formRef = useRef(null);
  const fetchInputRef = useRef(null);

  const fetchProfileList = useCallback(async () => {
    if (!user?._id) return; // Ensure user and user._id exist
    try {
      const response = await axios.get(
        `${API_BASE_URL}/botprofile/user/${user._id}`,
        {
          withCredentials: true,
        }
      );
      setProfileList(response.data || []);
    } catch (err) {
      console.error("Error fetching bot profile list:", err);
      // Optionally set a non-blocking error for the user
    }
  }, [user]);

  useEffect(() => {
    fetchProfileList();
  }, [fetchProfileList]);

  useEffect(() => {
    if (formRef.current && (globalError || globalSuccess || currentStep)) {
      setTimeout(() => {
        // Timeout to allow DOM update before scrolling
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [currentStep, globalError, globalSuccess]);

  const handleLoadProfile = useCallback(
    async (nameToLoadFromDatalist = null) => {
      const nameToUse = nameToLoadFromDatalist || fetchInputName;
      const trimmedName = nameToUse.trim();

      if (!trimmedName) {
        setGlobalError(t("fetchBotPlaceholder"));
        if (fetchInputRef.current) fetchInputRef.current.focus();
        return;
      }
      setLoading(true);
      setGlobalError("");
      setGlobalSuccess("");
      // Don't reset profile immediately, only on success/not found
      // setProfile(getInitialBotProfileState());

      try {
        const response = await axios.get(
          `${API_BASE_URL}/botprofile/byName/${encodeURIComponent(
            trimmedName
          )}`,
          { withCredentials: true }
        );
        setProfile(response.data || getInitialBotProfileState(trimmedName)); // Fallback if data is null
        setFormMode("update");
        setFetchInputName("");
        setCurrentStep(1);
        setGlobalSuccess(t("botLoadedSuccess", { name: trimmedName })); // Add translation for botLoadedSuccess
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setProfile(getInitialBotProfileState(trimmedName));
          setFormMode("create");
          setGlobalSuccess(t("botNotFound") + ` "${trimmedName}"`);
          setCurrentStep(1);
        } else {
          setGlobalError(
            `${t("errorGenericLoad")} ${
              err.response?.data?.message || err.message
            }`
          );
          setProfile(getInitialBotProfileState()); // Reset profile on hard error
          setFormMode("initial");
        }
        setFetchInputName("");
      } finally {
        setLoading(false);
      }
    },
    [fetchInputName, t, user?._id]
  );

  const validateCurrentStep = useCallback(() => {
    const newErrors = {};
    // Basic required field validation example
    if (currentStep === 1) {
      if (!profile.name?.trim()) newErrors.name = t("errorRequiredField");
      if (!profile.identity?.trim())
        newErrors.identity = t("errorRequiredField");
    }
    if (currentStep === 2) {
      // Example: Check if knowledge base items have both topic and content if not empty
      (profile.knowledgeBaseItems || []).forEach((item, index) => {
        if (
          (item.topic?.trim() && !item.content?.trim()) ||
          (!item.topic?.trim() && item.content?.trim())
        ) {
          newErrors[`knowledgeBaseItems[${index}]`] = t(
            "errorKnowledgeItemIncomplete",
            "Topic and Content are both required if one is filled."
          );
        }
      });
    }
    // Add more specific validations for other steps/fields
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [profile, currentStep, t]);

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < TOTAL_STEPS) setCurrentStep((s) => s + 1);
    } else {
      if (formRef.current)
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
    setGlobalError(""); // Clear errors when navigating
    setErrors({});
  };

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const valToUse = type === "checkbox" ? checked : value;

      setProfile((prev) => {
        const keys = name.split(".");
        let newProfileState = JSON.parse(JSON.stringify(prev)); // Deep clone for safety with nested objects
        let currentLevel = newProfileState;

        for (let i = 0; i < keys.length - 1; i++) {
          if (
            !currentLevel[keys[i]] ||
            typeof currentLevel[keys[i]] !== "object"
          ) {
            currentLevel[keys[i]] = {}; // Ensure path exists
          }
          currentLevel = currentLevel[keys[i]];
        }
        currentLevel[keys[keys.length - 1]] = valToUse;
        return newProfileState;
      });

      if (errors[name])
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[name]; // Remove specific error when field changes
          return newErrors;
        });
      setGlobalError("");
      setGlobalSuccess("");
    },
    [errors]
  );

  const handleSaveProfile = useCallback(async () => {
    if (!validateCurrentStep()) {
      // Could be validateAllSteps for final submission
      setGlobalError(
        t(
          "errorFixBeforeSave",
          "Please fix the highlighted errors before saving. 🐧"
        )
      );
      if (formRef.current)
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setSaving(true);
    setGlobalError("");
    setGlobalSuccess("");

    const url =
      formMode === "create"
        ? `${API_BASE_URL}/botprofile`
        : `${API_BASE_URL}/botprofile/${encodeURIComponent(
            profile._id || profile.name
          )}`;
    const method = formMode === "create" ? "post" : "put";

    try {
      const response = await axios({
        method,
        url,
        data: profile,
        withCredentials: true,
      });
      setProfile(response.data);
      setFormMode("update");
      setGlobalSuccess(t("botSavedSuccess"));
      fetchProfileList();
      setTimeout(() => setGlobalSuccess(""), 4000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message;
      if (err.response?.data?.errors) {
        // Handle multiple validation errors from backend
        const backendErrors = err.response.data.errors.reduce((acc, cur) => {
          acc[cur.path || cur.field || "general"] = cur.msg;
          return acc;
        }, {});
        setErrors((prev) => ({ ...prev, ...backendErrors }));
        setGlobalError(
          t(
            "errorFixBeforeSaveBackend",
            "Please check the form for errors from the server."
          )
        );
      } else {
        setGlobalError(`${t("errorSavingBot")} ${errorMessage}`);
      }
    } finally {
      setSaving(false);
    }
  }, [profile, formMode, t, user?._id, fetchProfileList, validateCurrentStep]);

  const stepLabels = [
    t("step1_identity_title"),
    t("step2_knowledge_title"),
    t("step3_interaction_title"),
    t("step4_advanced_title"),
  ];

  return (
    <div
      className={`${styles.botProfileFormContainer} lang-${language}`}
      ref={formRef}
    >
      <h1>{t("botProfileEditorTitle")}</h1>
      <ProfiAssistant
        tipKey={
          formMode === "create" && currentStep === 1
            ? "profiWelcomeNewBot"
            : formMode === "update" && currentStep === 1
            ? "profiWelcomeEditBot"
            : null
        }
      />

      <CollapsibleSection
        title={t("fetchBotSectionTitle")}
        initialOpen={formMode === "initial" || !profile.name}
      >
        <div className={styles.fetchSection}>
          <input
            ref={fetchInputRef}
            type="text"
            list="bot-profile-names"
            placeholder={t("fetchBotPlaceholder")}
            value={fetchInputName}
            onChange={(e) => {
              setFetchInputName(e.target.value);
              // Optional: auto-load if value matches datalist
              const match = profileList.find((p) => p.name === e.target.value);
              if (match) {
                // handleLoadProfile(e.target.value); // Decide if auto-load is desired
              }
            }}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleLoadProfile())
            }
            disabled={loading || saving}
            className={commonStyles.inputField}
          />
          <datalist id="bot-profile-names">
            {profileList.map((p) => (
              <option key={p._id || p.name} value={p.name} />
            ))}
          </datalist>
          <button
            onClick={() => handleLoadProfile()}
            disabled={loading || saving || !fetchInputName.trim()}
            className={commonStyles.button}
            type="button"
          >
            {loading ? t("loading") : t("fetchBotButton")}
          </button>
        </div>
        {formMode !== "initial" && profile.name && (
          <div className={styles.modeIndicator}>
            ({formMode === "create" ? t("creatingBot") : t("editingBot")} "
            <strong>{profile.name}</strong>")
          </div>
        )}
      </CollapsibleSection>

      {globalError && (
        <div className={styles.globalErrorMessage} role="alert" tabIndex={-1}>
          {globalError}
        </div>
      )}
      {globalSuccess && (
        <div
          className={styles.globalSuccessMessage}
          role="status"
          tabIndex={-1}
        >
          {globalSuccess}
        </div>
      )}

      {formMode !== "initial" && profile.name && (
        <>
          <FormStepper
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            stepLabels={stepLabels}
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveProfile();
            }}
            className={styles.botForm}
          >
            {currentStep === 1 && (
              <Step1_Identity
                profile={profile}
                handleChange={handleChange}
                errors={errors}
                formMode={formMode}
              />
            )}
            {currentStep === 2 && (
              <Step2_Knowledge
                profile={profile}
                handleChange={handleChange}
                setProfile={setProfile}
                errors={errors}
              />
            )}
            {currentStep === 3 && (
              <Step3_Interaction
                profile={profile}
                handleChange={handleChange}
                setProfile={setProfile}
                errors={errors}
              />
            )}
            {currentStep === 4 && (
              <Step4_Advanced
                profile={profile}
                handleChange={handleChange}
                setProfile={setProfile}
                errors={errors}
              />
            )}

            <div className={styles.formNavButtons}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={saving}
                  className={styles.prevButton}
                >
                  {t("prevButton")}
                </button>
              )}
              {currentStep === 1 && <div style={{ flexGrow: 1 }}></div>}{" "}
              {/* Spacer */}
              {currentStep < TOTAL_STEPS && (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={saving}
                  className={styles.nextButton}
                >
                  {t("nextButton")}
                </button>
              )}
              {currentStep === TOTAL_STEPS && (
                <button
                  type="submit"
                  disabled={saving || loading}
                  className={styles.submitButton}
                >
                  {saving
                    ? t("savingButton")
                    : formMode === "create"
                    ? t("createBotButton")
                    : t("updateBotButton")}
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </div>
  );
}
