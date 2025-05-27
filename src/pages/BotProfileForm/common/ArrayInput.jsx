// src\pages\BotProfileForm\common\ArrayInput.jsx
import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import commonStyles from "./CommonFormStyles.module.css";

const ArrayInput = ({
  path, // e.g., "languageRules" or "tools.purposes"
  label,
  items, // The actual array from state
  setProfile, // The main setProfile function from BotProfileForm
  itemPlaceholder,
  addButtonLabel,
  textarea = false, // Use textarea instead of input type text
  rows = 2,
}) => {
  const { t } = useLanguage();

  const handleItemChange = (index, value) => {
    setProfile((prev) => {
      const newItems = [...(items || [])];
      newItems[index] = value;

      // Helper to set nested value
      const keys = path.split(".");
      let current = { ...prev };
      let objRef = current;
      for (let i = 0; i < keys.length - 1; i++) {
        objRef[keys[i]] = { ...objRef[keys[i]] }; // Ensure new object reference at each level
        objRef = objRef[keys[i]];
      }
      objRef[keys[keys.length - 1]] = newItems;
      return current;
    });
  };

  const addItem = () => {
    setProfile((prev) => {
      const newItems = [...(items || []), ""]; // Add empty string for new item

      const keys = path.split(".");
      let current = { ...prev };
      let objRef = current;
      for (let i = 0; i < keys.length - 1; i++) {
        objRef[keys[i]] = { ...objRef[keys[i]] };
        objRef = objRef[keys[i]];
      }
      objRef[keys[keys.length - 1]] = newItems;
      return current;
    });
  };

  const removeItem = (index) => {
    setProfile((prev) => {
      const newItems = (items || []).filter((_, i) => i !== index);

      const keys = path.split(".");
      let current = { ...prev };
      let objRef = current;
      for (let i = 0; i < keys.length - 1; i++) {
        objRef[keys[i]] = { ...objRef[keys[i]] };
        objRef = objRef[keys[i]];
      }
      objRef[keys[keys.length - 1]] = newItems;
      return current;
    });
  };

  // Fallback for addButtonLabel if not provided
  const finalAddButtonLabel =
    addButtonLabel || t("addGenericItemButton", "Add Item");

  return (
    <div className={commonStyles.arrayInputContainer}>
      {label && <label className={commonStyles.arrayInputLabel}>{label}</label>}
      {(items || []).map((item, index) => (
        <div key={index} className={commonStyles.arrayItem}>
          {textarea ? (
            <textarea
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              placeholder={`${itemPlaceholder || "Item"} ${index + 1}`}
              rows={rows}
              className={commonStyles.inputField}
            />
          ) : (
            <input
              type="text"
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              placeholder={`${itemPlaceholder || "Item"} ${index + 1}`}
              className={commonStyles.inputField}
            />
          )}
          <button
            type="button"
            onClick={() => removeItem(index)}
            className={`${commonStyles.button} ${commonStyles.removeButton}`}
            aria-label={`${t("removeButton")} ${itemPlaceholder || "Item"} ${
              index + 1
            }`}
          >
            {t("removeButton", "Remove")}
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className={`${commonStyles.button} ${commonStyles.addButton}`}
      >
        {finalAddButtonLabel}
      </button>
    </div>
  );
};

export default ArrayInput;
