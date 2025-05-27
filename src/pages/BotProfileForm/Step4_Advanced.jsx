// src\pages\BotProfileForm\Step4_Advanced.jsx
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import formStyles from "./BotProfileForm.module.css";
import commonStyles from "./common/CommonFormStyles.module.css";
import ProfiAssistant from "../../components/Common/ProfiAssistant/ProfiAssistant";
import CollapsibleSection from "./common/CollapsibleSection";
import ArrayInput from "./common/ArrayInput";
import ObjectArrayInput from "./common/ObjectArrayInput";

const Step4_Advanced = ({ profile, handleChange, setProfile, errors }) => {
  const { t } = useLanguage();

  return (
    <div className={formStyles.formStep}>
      <ProfiAssistant tipKey="profiToolsTip" />
      <CollapsibleSection
        title={t("toolsUsageSectionTitle")}
        initialOpen={true}
      >
        <div className={formStyles.formGroup}>
          <label htmlFor="tool-name">{t("toolNameLabel")}</label>
          <input
            type="text"
            id="tool-name"
            name="tools.name" // Ensure handleChange handles nested paths
            className={commonStyles.inputField}
            value={profile.tools?.name || ""}
            onChange={handleChange} // Main handleChange from BotProfileForm
            placeholder={t("toolNameLabel")}
          />
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="tool-description">{t("toolDescriptionLabel")}</label>
          <textarea
            id="tool-description"
            name="tools.description"
            className={commonStyles.textareaField}
            value={profile.tools?.description || ""}
            onChange={handleChange}
            placeholder={t("toolDescriptionLabel")}
            rows={2}
          />
        </div>
        <ArrayInput
          path="tools.purposes"
          label={t("toolPurposesLabel")}
          items={profile.tools?.purposes}
          setProfile={setProfile}
          itemPlaceholder={t("purposePlaceholder")}
          addButtonLabel={t("addPurposeButton")}
          textarea={false} // Simple text input for purposes
        />
      </CollapsibleSection>

      <ProfiAssistant tipKey="profiPrivacyTip" />
      <CollapsibleSection
        title={t("privacyComplianceSectionTitle")}
        initialOpen={false}
      >
        <div className={formStyles.formGroup}>
          <label htmlFor="privacy-guidelines">
            {t("privacyGuidelinesLabel")}
          </label>
          <textarea
            id="privacy-guidelines"
            name="privacyAndComplianceGuidelines"
            className={commonStyles.textareaField}
            value={profile.privacyAndComplianceGuidelines || ""}
            onChange={handleChange}
            placeholder={t("privacyGuidelinesPlaceholder")}
            rows={3}
          />
        </div>
      </CollapsibleSection>

      <ProfiAssistant tipKey="profiMcpTip" />
      <CollapsibleSection
        title={t("mcpServersSectionTitle")}
        initialOpen={false}
      >
        <ObjectArrayInput
          path="mcpServers"
          label={null}
          items={profile.mcpServers}
          setProfile={setProfile}
          defaultItemFactory={() => ({
            name: "",
            command: "",
            args: [],
            enabled: true,
          })}
          addButtonLabel={t("addMcpServerButton")}
          itemTitleBase={"mcpServerTitle"} // Example: "MCP Server Config"
          renderItem={(item, index, handleItemFieldChange) => (
            <>
              <div className={formStyles.formGroup}>
                <label htmlFor={`mcp-name-${index}`}>
                  {t("mcpServerNameLabel")}
                </label>
                <input
                  type="text"
                  id={`mcp-name-${index}`}
                  className={commonStyles.inputField}
                  value={item.name || ""}
                  onChange={(e) =>
                    handleItemFieldChange(index, "name", e.target.value)
                  }
                  placeholder={t("mcpServerNameLabel")}
                />
              </div>
              <div className={formStyles.formGroup}>
                <label htmlFor={`mcp-command-${index}`}>
                  {t("mcpServerCommandLabel")}
                </label>
                <input
                  type="text"
                  id={`mcp-command-${index}`}
                  className={commonStyles.inputField}
                  value={item.command || ""}
                  onChange={(e) =>
                    handleItemFieldChange(index, "command", e.target.value)
                  }
                  placeholder={t("mcpServerCommandLabel")}
                />
              </div>
              <div className={formStyles.formGroup}>
                <label htmlFor={`mcp-args-${index}`}>
                  {t("mcpServerArgsLabel")}
                </label>
                <input
                  type="text"
                  id={`mcp-args-${index}`}
                  className={commonStyles.inputField}
                  value={(item.args || []).join(", ")}
                  onChange={(e) => {
                    const argsArray = e.target.value
                      .split(",")
                      .map((arg) => arg.trim())
                      .filter(Boolean);
                    handleItemFieldChange(index, "args", argsArray);
                  }}
                  placeholder={t("mcpServerArgsLabel")}
                />
              </div>
              <div
                className={`${formStyles.formGroup} ${formStyles.checkboxGroup}`}
              >
                <input
                  type="checkbox"
                  id={`mcp-enabled-${index}`}
                  checked={item.enabled === undefined ? true : item.enabled} // Default to true if undefined
                  onChange={(e) =>
                    handleItemFieldChange(index, "enabled", e.target.checked)
                  }
                />
                <label htmlFor={`mcp-enabled-${index}`}>
                  {t("mcpServerEnabledLabel")}
                </label>
              </div>
            </>
          )}
        />
      </CollapsibleSection>
    </div>
  );
};

export default Step4_Advanced;
