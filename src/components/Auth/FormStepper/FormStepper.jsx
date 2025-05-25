// src\components\Auth\FormStepper\FormStepper.jsx
// src/components/Auth/FormStepper/FormStepper.jsx
import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import styles from "./FormStepper.module.css";

const FormStepper = ({ currentStep, totalSteps, stepLabels }) => {
  const { t } = useLanguage();

  return (
    <nav
      className={styles.stepperContainer}
      aria-label={t("stepIndicator", { currentStep, totalSteps })}
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        let statusClass = "";
        if (isActive) statusClass = styles.active;
        if (isCompleted) statusClass = styles.completed;

        return (
          <div
            key={stepNumber}
            className={`${styles.step} ${statusClass}`}
            aria-current={isActive ? "step" : undefined}
          >
            <div className={styles.stepNumber}>
              {isCompleted ? "✔" : stepNumber}
            </div>
            <div className={styles.stepLabel}>
              {stepLabels[i] || `${t("step")} ${stepNumber}`}
            </div>
          </div>
        );
      })}
    </nav>
  );
};

export default FormStepper;
