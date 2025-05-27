// src\pages\BotProfileForm\common\ObjectArrayInput.jsx
import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import commonStyles from "./CommonFormStyles.module.css";

const ObjectArrayInput = ({
  path, // e.g., "knowledgeBaseItems"
  label, // Main label for the section, if any
  items, // The actual array of objects from state
  setProfile, // The main setProfile function
  defaultItemFactory, // () => ({ field1: "", field2: "" })
  renderItem, // (item, index, handleItemFieldChange) => JSX for one item's fields
  addButtonLabel,
  itemTitleBase, // e.g., "Info Snippet" or translation key for it
}) => {
  const { t } = useLanguage();

  const handleItemFieldChange = (index, fieldName, value) => {
    setProfile((prev) => {
      const newItems = (items || []).map((it, i) =>
        i === index ? { ...it, [fieldName]: value } : it
      );

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

  const addItem = () => {
    setProfile((prev) => {
      const newItem = defaultItemFactory();
      const newItems = [...(items || []), newItem];

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

  const finalAddButtonLabel =
    addButtonLabel || t("addGenericItemButton", "Add Item");
  const finalItemTitleBase = itemTitleBase
    ? t(itemTitleBase, itemTitleBase) || "Item"
    : "Item";

  return (
    <div className={commonStyles.objectArrayContainer}>
      {label && <h4 className={commonStyles.objectArrayLabel}>{label}</h4>}
      {(items || []).map((item, index) => (
        <div key={index} className={commonStyles.objectArrayItemCard}>
          <div className={commonStyles.objectArrayItemHeader}>
            <h5>
              {finalItemTitleBase} {index + 1}
            </h5>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className={`${commonStyles.button} ${commonStyles.removeButtonSmall}`}
              aria-label={`${t("removeButton")} ${finalItemTitleBase} ${
                index + 1
              }`}
            >
              {t("removeButton", "Remove")}
            </button>
          </div>
          {renderItem(item, index, handleItemFieldChange)}
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

export default ObjectArrayInput;
