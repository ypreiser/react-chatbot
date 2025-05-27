// src/pages/BotProfileForm/Step3_Interaction.jsx
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import formStyles from "./BotProfileForm.module.css";
import commonStyles from "./common/CommonFormStyles.module.css";
import ProfiAssistant from "../../components/Common/ProfiAssistant/ProfiAssistant";
import CollapsibleSection from "./common/CollapsibleSection";
import ArrayInput from "./common/ArrayInput";
import ObjectArrayInput from "./common/ObjectArrayInput";

const Step3_Interaction = ({ profile, handleChange, setProfile, errors }) => {
  const { t } = useLanguage();

  return (
    <div className={formStyles.formStep}>
      <ProfiAssistant tipKey="profiInteractionTip" />
      <CollapsibleSection
        title={t("initialInteractionLabel")}
        initialOpen={true}
      >
        <ArrayInput
          path="initialInteraction"
          label={null} // Title from section
          items={profile.initialInteraction}
          setProfile={setProfile}
          itemPlaceholder={t("initialInteractionPlaceholder")}
          addButtonLabel={t("addInitialInteractionButton")}
          textarea={true}
          rows={2}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title={t("interactionGuidelinesLabel")}
        initialOpen={false}
      >
        <ArrayInput
          path="interactionGuidelines"
          label={null}
          items={profile.interactionGuidelines}
          setProfile={setProfile}
          itemPlaceholder={t("interactionGuidelinePlaceholder")}
          addButtonLabel={t("addInteractionGuidelineButton")}
          textarea={true}
          rows={2}
        />
      </CollapsibleSection>

      <ProfiAssistant tipKey="profiExampleTip" />
      <CollapsibleSection
        title={t("exampleResponsesSectionTitle")}
        initialOpen={true}
      >
        <ObjectArrayInput
          path="exampleResponses"
          label={null}
          items={profile.exampleResponses}
          setProfile={setProfile}
          defaultItemFactory={() => ({ scenario: "", response: "" })}
          addButtonLabel={t("addExampleResponseButton")}
          itemTitleBase={"exampleResponseTitle"} // Example: "Example Scenario"
          renderItem={(item, index, handleItemFieldChange) => (
            <>
              <div className={formStyles.formGroup}>
                <label htmlFor={`ex-scenario-${index}`}>
                  {t("scenarioLabel")}
                </label>
                <textarea
                  id={`ex-scenario-${index}`}
                  className={commonStyles.textareaField}
                  value={item.scenario || ""}
                  onChange={(e) =>
                    handleItemFieldChange(index, "scenario", e.target.value)
                  }
                  placeholder={t("scenarioPlaceholder")}
                  rows={2}
                />
              </div>
              <div className={formStyles.formGroup}>
                <label htmlFor={`ex-response-${index}`}>
                  {t("responseLabel")}
                </label>
                <textarea
                  id={`ex-response-${index}`}
                  className={commonStyles.textareaField}
                  value={item.response || ""}
                  onChange={(e) =>
                    handleItemFieldChange(index, "response", e.target.value)
                  }
                  placeholder={t("responsePlaceholder")}
                  rows={3}
                />
              </div>
            </>
          )}
        />
      </CollapsibleSection>

      <ProfiAssistant tipKey="profiEdgeCaseTip" />
      <CollapsibleSection
        title={t("edgeCasesSectionTitle")}
        initialOpen={false}
      >
        <ObjectArrayInput
          path="edgeCases"
          label={null}
          items={profile.edgeCases}
          setProfile={setProfile}
          defaultItemFactory={() => ({ case: "", action: "" })}
          addButtonLabel={t("addEdgeCaseButton")}
          itemTitleBase={"edgeCaseTitle"} // Example: "Tricky Case"
          renderItem={(item, index, handleItemFieldChange) => (
            <>
              <div className={formStyles.formGroup}>
                <label htmlFor={`ec-case-${index}`}>{t("caseLabel")}</label>
                <textarea
                  id={`ec-case-${index}`}
                  className={commonStyles.textareaField}
                  value={item.case || ""}
                  onChange={(e) =>
                    handleItemFieldChange(index, "case", e.target.value)
                  }
                  placeholder={t("casePlaceholder")}
                  rows={2}
                />
              </div>
              <div className={formStyles.formGroup}>
                <label htmlFor={`ec-action-${index}`}>{t("actionLabel")}</label>
                <textarea
                  id={`ec-action-${index}`}
                  className={commonStyles.textareaField}
                  value={item.action || ""}
                  onChange={(e) =>
                    handleItemFieldChange(index, "action", e.target.value)
                  }
                  placeholder={t("actionPlaceholder")}
                  rows={2}
                />
              </div>
            </>
          )}
        />
      </CollapsibleSection>
    </div>
  );
};

export default Step3_Interaction;
