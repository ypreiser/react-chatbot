// src\pages\BotProfileForm\Step2_Knowledge.jsx
import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import formStyles from "./BotProfileForm.module.css";
import commonStyles from "./common/CommonFormStyles.module.css";
import ProfiAssistant from "../../components/Common/ProfiAssistant/ProfiAssistant";
import CollapsibleSection from "./common/CollapsibleSection";
import ObjectArrayInput from "./common/ObjectArrayInput";

const Step2_Knowledge = ({ profile, handleChange, setProfile, errors }) => {
  const { t } = useLanguage();
  const [tagsString, setTagsString] = useState((profile.tags || []).join(", "));

  useEffect(() => {
    setTagsString((profile.tags || []).join(", "));
  }, [profile.tags]);

  const handleTagsChange = (e) => {
    const newTagsString = e.target.value;
    setTagsString(newTagsString);
    // Update profile.tags on blur or a dedicated "update tags" button
    // For now, let's update on blur or let main form handle it on save.
    // Or, update live:
    const newTagsArray = newTagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setProfile((prev) => ({
      ...prev,
      tags: newTagsArray,
    }));
  };

  return (
    <div className={formStyles.formStep}>
      <ProfiAssistant tipKey="profiKnowledgeTip" />

      <CollapsibleSection
        title={t("knowledgeBaseSectionTitle")}
        initialOpen={true}
      >
        <ObjectArrayInput
          path="knowledgeBaseItems"
          label={null} // No main label, title is in section header
          items={profile.knowledgeBaseItems}
          setProfile={setProfile}
          defaultItemFactory={() => ({ topic: "", content: "" })}
          addButtonLabel={t("addKnowledgeItemButton")}
          itemTitleBase={"knowledgeItemTitle"} // Assuming a translation like "Info Snippet"
          renderItem={(item, index, handleItemFieldChange) => (
            <>
              <div className={formStyles.formGroup}>
                <label htmlFor={`kb-topic-${index}`}>
                  {t("knowledgeItemTopicLabel")}
                </label>
                <input
                  type="text"
                  id={`kb-topic-${index}`}
                  className={commonStyles.inputField}
                  value={item.topic || ""}
                  onChange={(e) =>
                    handleItemFieldChange(index, "topic", e.target.value)
                  }
                  placeholder={t("knowledgeItemTopicPlaceholder")}
                />
              </div>
              <div className={formStyles.formGroup}>
                <label htmlFor={`kb-content-${index}`}>
                  {t("knowledgeItemContentLabel")}
                </label>
                <textarea
                  id={`kb-content-${index}`}
                  className={commonStyles.textareaField}
                  value={item.content || ""}
                  onChange={(e) =>
                    handleItemFieldChange(index, "content", e.target.value)
                  }
                  placeholder={t("knowledgeItemContentPlaceholder")}
                  rows={3}
                />
              </div>
            </>
          )}
        />
      </CollapsibleSection>

      <ProfiAssistant tipKey="profiTagTip" />
      <CollapsibleSection title={t("tagsLabel")} initialOpen={true}>
        <div
          className={`${formStyles.formGroup} ${commonStyles.tagsInputGroup}`}
        >
          {/* <label htmlFor="tags-input">{t('tagsLabel')}</label> */}
          <input
            type="text"
            id="tags-input"
            className={commonStyles.inputField}
            value={tagsString}
            onChange={handleTagsChange}
            placeholder={t("tagItemPlaceholder") + " (comma-separated)"}
          />
          {/* Optionally display tags as pills below */}
          {profile.tags && profile.tags.length > 0 && (
            <div className={commonStyles.tagsDisplayArea}>
              {profile.tags.map((tag, idx) => (
                <span key={idx} className={commonStyles.tagPill}>
                  {tag}
                  {/* Optional: Add remove button for individual pills that updates tagsString/profile.tags */}
                </span>
              ))}
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default Step2_Knowledge;
