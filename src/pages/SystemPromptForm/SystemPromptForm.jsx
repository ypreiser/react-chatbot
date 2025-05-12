import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./SystemPromptForm.css";
import { translations } from "../../data/translations";
import { API_BASE_URL } from "../../constants/api";
import {
  getNestedValue,
  setNestedValue,
  updateArrayByPath,
  deepClone,
} from "../../utils/stateHelpers"; // Assuming deepClone is also exported

const getInitialPromptState = (name = "") => ({
  name: name,
  identity: "",
  primaryLanguage: "",
  secondaryLanguage: "",
  languageRules: [],
  storeName: "",
  storeAddress: "",
  storePhone: "",
  storeEmail: "",
  openingHours: {
    Sunday: "",
    Monday: "",
    Tuesday: "",
    Wednesday: "",
    Thursday: "",
    Friday: "",
    Saturday: "",
  },
  availableCategories: [],
  returnPolicy: "",
  warrantyPolicy: "",
  initialInteraction: [],
  customerServiceGuidelines: [],
  exampleResponses: [], // { scenario: "", response: "" }
  edgeCases: [], // { case: "", action: "" }
  tools: { name: "", description: "", purposes: [] },
  privacyAndComplianceGuidelines: "",
  mcpServers: [], // { name: "", command: "", args: [], enabled: true }
});

export default function SystemPromptForm() {
  const [fetchInputName, setFetchInputName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("initial"); // 'initial', 'create', 'update'
  const [language, setLanguage] = useState("en");
  const [prompt, setPrompt] = useState(getInitialPromptState());
  const [promptList, setPromptList] = useState([]); // For dropdown

  // State for collapsible sections
  const [openSections, setOpenSections] = useState({
    fetch: true,
    basicInfo: true,
    languageSettings: false,
    storeInfo: false,
    storePolicies: false,
    behaviorSettings: false,
    categories: false,
    tools: false,
    privacy: false,
    mcpServers: false,
  });

  // Translations shorthand
  const t = translations[language];

  // Fetch list of prompt names for dropdown/datalist
  const fetchPromptList = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/systemprompt`, {
        withCredentials: true,
      });
      setPromptList(response.data || []);
    } catch (err) {
      console.error("Error fetching prompt list:", err);
      // Handle error silently or display a non-blocking message
    }
  }, []);

  // Fetch list on component mount
  useEffect(() => {
    fetchPromptList();
  }, [fetchPromptList]);

  // Fetch prompt by name
  const handleLoadPrompt = useCallback(
    async (nameToLoad) => {
      const trimmedName = (nameToLoad || fetchInputName).trim();
      if (!trimmedName) {
        setError(t.fetchPlaceholder); // Or a more specific error
        return;
      }

      setLoading(true);
      setError(null);
      setSaved(false);
      setPrompt(getInitialPromptState()); // Clear form while loading

      try {
        const response = await axios.get(
          `${API_BASE_URL}/systemprompt/${encodeURIComponent(trimmedName)}`,
          { withCredentials: true }
        );
        setPrompt(response.data); // Populate form with loaded data
        setMode("update"); // Switch to update mode
        setFetchInputName(""); // Clear the input field
        // Open basic sections after loading
        setOpenSections((prev) => ({
          ...prev,
          basicInfo: true,
          languageSettings: true,
        }));
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // Prompt not found, prepare for creation
          setPrompt(getInitialPromptState(trimmedName));
          setMode("create");
          setError(null); // Clear error, mode indicates intent
          console.log(`Prompt '${trimmedName}' not found. Ready to create.`);
          // Open basic sections for creation
          setOpenSections((prev) => ({
            ...prev,
            basicInfo: true,
            languageSettings: true,
          }));
        } else {
          console.error("Error fetching prompt:", err);
          setError(
            `${t.errorFetching} ${err.response?.data?.message || err.message}`
          );
          setMode("initial"); // Reset mode on hard error
        }
        setFetchInputName(""); // Clear input on error/not found
      } finally {
        setLoading(false);
      }
    },
    [fetchInputName, t.errorFetching, t.fetchPlaceholder]
  ); // Include dependencies

  // Save or update prompt
  const handleSave = useCallback(async () => {
    if (!prompt.name?.trim()) {
      setError("Prompt name cannot be empty.");
      setOpenSections((prev) => ({ ...prev, basicInfo: true })); // Ensure name section is visible
      return;
    }
    // Add more validation as needed
    if (!prompt.identity?.trim()) {
      setError("Identity field is required.");
      setOpenSections((prev) => ({ ...prev, basicInfo: true }));
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);

    const url =
      mode === "create"
        ? `${API_BASE_URL}/systemprompt`
        : `${API_BASE_URL}/systemprompt/${encodeURIComponent(prompt.name)}`;
    const method = mode === "create" ? "post" : "put";

    try {
      const response = await axios(
        { method, url, data: prompt, withCredentials: true },
        { withCredentials: true }
      );
      if (response.status !== 200) {
        setSaved(true);
        setMode("update"); // Always switch to update mode after save/create
        setPrompt(response.data); // Update state with potentially updated data from backend (like _id, timestamps)
        setTimeout(() => setSaved(false), 3000);
        fetchPromptList(); // Refresh prompt list after saving
      } else {
        setError("Failed to save the prompt.");
      }
    } catch (err) {
      console.error("Error saving prompt:", err);
      setError(
        `${t.errorSaving} ${
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message
        }`
      );
    } finally {
      setSaving(false);
    }
  }, [prompt, mode, t.errorSaving, fetchPromptList]); // Include dependencies

  // Generic field change handler
  const handleFieldChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const valueToUse = type === "checkbox" ? checked : value;
    const pathParts = name.split(".");
    setPrompt((prev) => setNestedValue(prev, pathParts, valueToUse));
  }, []); // No dependencies needed if it only uses event data

  // Generic handler for array item changes (strings or objects)
  const handleArrayItemChange = useCallback(
    (path, index, fieldOrValue, optionalValue) => {
      // If optionalValue is provided, it means we are updating a field within an object in the array
      if (optionalValue !== undefined) {
        const field = fieldOrValue;
        const value = optionalValue;
        handleObjectArrayItemChange(path, index, field, value);
      } else {
        // Otherwise, we are updating a simple string item in the array
        const value = fieldOrValue;
        handleSimpleArrayItemChange(path, index, value);
      }
    },
    []
  ); // Dependencies will be handled by the inner functions called

  // Handler for updating items in simple arrays (array of strings)
  const handleSimpleArrayItemChange = useCallback((path, index, value) => {
    setPrompt((prev) =>
      updateArrayByPath(prev, path, (arr) => {
        if (index >= 0 && index < arr.length) {
          // Bounds check
          arr[index] = value;
        }
        return arr;
      })
    );
  }, []);

  // Handler for updating fields in objects within arrays
  const handleObjectArrayItemChange = useCallback(
    (path, index, field, value) => {
      setPrompt((prev) =>
        updateArrayByPath(prev, path, (arr) => {
          if (index >= 0 && index < arr.length) {
            // Bounds check
            if (!arr[index]) arr[index] = {}; // Ensure object exists if somehow null/undefined
            // Special handling for args array from comma-separated string
            if (
              path === "mcpServers" &&
              field === "args" &&
              typeof value === "string"
            ) {
              arr[index][field] = value
                .split(",")
                .map((arg) => arg.trim())
                .filter(Boolean);
            } else {
              arr[index][field] = value;
            }
          }
          return arr;
        })
      );
    },
    []
  );

  // Add item to simple array
  const addSimpleArrayItem = useCallback((path, defaultValue = "") => {
    setPrompt((prev) =>
      updateArrayByPath(prev, path, (arr) => [...arr, defaultValue])
    );
  }, []);

  // Add complex object to array
  const addObjectToArray = useCallback((path, defaultObjFactory) => {
    setPrompt((prev) =>
      updateArrayByPath(prev, path, (arr) => [...arr, defaultObjFactory()])
    ); // Use factory
  }, []);

  // Remove item from any array
  const removeArrayItem = useCallback((path, index) => {
    setPrompt((prev) =>
      updateArrayByPath(prev, path, (arr) => arr.filter((_, i) => i !== index))
    );
  }, []);

  // Toggle section visibility
  const toggleSection = useCallback((sectionName) => {
    setOpenSections((prev) => ({ ...prev, [sectionName]: !prev[sectionName] }));
  }, []);

  // Render helpers remain largely the same but use useCallback dependencies if needed
  const renderSimpleArray = useCallback(
    (path, label, addButtonLabel, itemPlaceholderBase) => {
      const items = getNestedValue(prompt, path.split(".")) || [];
      return (
        <div className="form-group array-section">
          <label>{label}</label>
          {items.map((item, index) => (
            <div key={index} className="array-item">
              <textarea
                value={item ?? ""} // Handle potential null/undefined
                onChange={(e) =>
                  handleSimpleArrayItemChange(path, index, e.target.value)
                }
                placeholder={`${
                  itemPlaceholderBase || label.replace(":", "")
                } ${index + 1}`}
                rows={2} // Smaller default size for array items
              />
              <button
                type="button"
                onClick={() => removeArrayItem(path, index)}
                className="remove-button"
              >
                {t.removeButton}
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addSimpleArrayItem(path)}
            className="add-button"
          >
            {addButtonLabel}
          </button>
        </div>
      );
    },
    [
      prompt,
      t.removeButton,
      handleSimpleArrayItemChange,
      removeArrayItem,
      addSimpleArrayItem,
    ]
  );

  const renderObjectArray = useCallback(
    (
      path,
      sectionTitle,
      addButtonLabel,
      defaultItemFactory,
      renderItemContent
    ) => {
      const items = getNestedValue(prompt, path.split(".")) || [];
      // Use base English title for dynamic item titles if needed
      const baseLabelKey = `${path.replace(/s$/, "")}Label`; // e.g., exampleResponseLabel
      const itemTitleBase = translations.en[baseLabelKey] || "Item";

      return (
        <>
          {sectionTitle && <h3>{sectionTitle}</h3>}
          <div className="form-group array-section">
            {items.map((item, index) => (
              <div key={index} className="object-array-item">
                <h4>
                  {itemTitleBase} {index + 1}
                </h4>
                {renderItemContent(item || {}, index)}{" "}
                {/* Pass empty obj if item is null/undefined */}
                <button
                  type="button"
                  onClick={() => removeArrayItem(path, index)}
                  className="remove-button"
                >
                  {t.removeButton}
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addObjectToArray(path, defaultItemFactory)}
              className="add-button"
            >
              {addButtonLabel}
            </button>
          </div>
        </>
      );
    },
    [prompt, t.removeButton, removeArrayItem, addObjectToArray]
  );

  return (
    <div className={`system-prompt-form lang-${language}`}>
      <h1>{t.title}</h1>

      {/* Language Selector */}
      <div className="language-selector">
        <span>{t.languageSelector}</span>
        <button
          type="button"
          onClick={() => setLanguage("en")}
          disabled={language === "en"}
        >
          {t.english}
        </button>
        <button
          type="button"
          onClick={() => setLanguage("he")}
          disabled={language === "he"}
        >
          {t.hebrew}
        </button>
      </div>

      {/* Load/Create Section */}
      <div className="form-section">
        <h2
          className="form-section-header"
          onClick={() => toggleSection("fetch")}
        >
          {t.fetchSectionTitle}
          <span className={`section-arrow ${openSections.fetch ? "open" : ""}`}>
            ▼
          </span>
        </h2>
        <div className={`section-content ${openSections.fetch ? "open" : ""}`}>
          <div className="fetch-section">
            <input
              type="text"
              list="prompt-names"
              placeholder={t.fetchPlaceholder}
              value={fetchInputName}
              onChange={(e) => setFetchInputName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLoadPrompt();
                }
              }}
              disabled={loading || saving}
            />
            <datalist id="prompt-names">
              {promptList.map((p) => (
                <option key={p._id || p.name} value={p.name} />
              ))}
            </datalist>
            <button
              type="button"
              onClick={() => handleLoadPrompt()}
              disabled={loading || saving || !fetchInputName.trim()}
            >
              {loading ? t.loading : t.fetchButton}
            </button>
            {mode !== "initial" && (
              <div className="mode-indicator">
                ({mode === "create" ? t.creatingPrompt : t.editingPrompt} "
                <strong>{prompt.name}</strong>")
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {mode !== "initial" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {/* Basic Information Section */}
          <div className="form-section">
            <h2
              className="form-section-header"
              onClick={() => toggleSection("basicInfo")}
            >
              {t.basicInfoSectionTitle}
              <span
                className={`section-arrow ${
                  openSections.basicInfo ? "open" : ""
                }`}
              >
                ▼
              </span>
            </h2>
            <div
              className={`section-content ${
                openSections.basicInfo ? "open" : ""
              }`}
            >
              <div className="form-group">
                <label htmlFor="prompt-name">{t.nameLabel}</label>
                <input
                  id="prompt-name"
                  name="name"
                  value={prompt.name || ""}
                  onChange={handleFieldChange}
                  required
                  disabled={mode === "update"}
                  placeholder={t.nameLabel}
                />
                {mode === "update" && (
                  <small className="field-note">{t.nameUpdateNote}</small>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="identity">{t.identityLabel}</label>
                <textarea
                  id="identity"
                  name="identity"
                  value={prompt.identity || ""}
                  onChange={handleFieldChange}
                  required
                  placeholder={t.identityLabel}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Language Settings Section */}
          <div className="form-section">
            <h2
              className="form-section-header"
              onClick={() => toggleSection("languageSettings")}
            >
              {t.languageSettingsSectionTitle}
              <span
                className={`section-arrow ${
                  openSections.languageSettings ? "open" : ""
                }`}
              >
                ▼
              </span>
            </h2>
            <div
              className={`section-content ${
                openSections.languageSettings ? "open" : ""
              }`}
            >
              <div className="form-group">
                <label htmlFor="primaryLanguage">
                  {t.primaryLanguageLabel}
                </label>
                <input
                  id="primaryLanguage"
                  name="primaryLanguage"
                  value={prompt.primaryLanguage || ""}
                  onChange={handleFieldChange}
                  required
                  placeholder={t.primaryLanguageLabel}
                />
              </div>
              <div className="form-group">
                <label htmlFor="secondaryLanguage">
                  {t.secondaryLanguageLabel}
                </label>
                <input
                  id="secondaryLanguage"
                  name="secondaryLanguage"
                  value={prompt.secondaryLanguage || ""}
                  onChange={handleFieldChange}
                  placeholder={t.secondaryLanguageLabel}
                />
              </div>
              {renderSimpleArray(
                "languageRules",
                t.languageRulesLabel,
                t.addRuleButton,
                t.languageRulesLabel.replace(":", "")
              )}
            </div>
          </div>

          {/* Store Information Section */}
          <div className="form-section">
            <h2
              className="form-section-header"
              onClick={() => toggleSection("storeInfo")}
            >
              {t.storeInfoSectionTitle}
              <span
                className={`section-arrow ${
                  openSections.storeInfo ? "open" : ""
                }`}
              >
                ▼
              </span>
            </h2>
            <div
              className={`section-content ${
                openSections.storeInfo ? "open" : ""
              }`}
            >
              <div className="form-group">
                <label htmlFor="storeName">{t.storeNameLabel}</label>
                <input
                  id="storeName"
                  name="storeName"
                  value={prompt.storeName || ""}
                  onChange={handleFieldChange}
                  required
                  placeholder={t.storeNameLabel}
                />
              </div>
              <div className="form-group">
                <label htmlFor="storeAddress">{t.addressLabel}</label>
                <input
                  id="storeAddress"
                  name="storeAddress"
                  value={prompt.storeAddress || ""}
                  onChange={handleFieldChange}
                  placeholder={t.addressLabel}
                />
              </div>
              <h3>{t.contactInfoTitle}</h3>
              <div className="form-group">
                <label htmlFor="storePhone">{t.phoneLabel}</label>
                <input
                  id="storePhone"
                  type="tel"
                  name="storePhone"
                  value={prompt.storePhone || ""}
                  onChange={handleFieldChange}
                  placeholder={t.phoneLabel}
                />
              </div>
              <div className="form-group">
                <label htmlFor="storeEmail">{t.emailLabel}</label>
                <input
                  id="storeEmail"
                  type="email"
                  name="storeEmail"
                  value={prompt.storeEmail || ""}
                  onChange={handleFieldChange}
                  placeholder={t.emailLabel}
                />
              </div>
              <h3>{t.openingHoursTitle}</h3>
              {Object.keys(prompt.openingHours || {}).map((day) => (
                <div className="form-group" key={day}>
                  <label htmlFor={`openingHours-${day}`}>
                    {t[`${day.toLowerCase()}Label`] || day}
                  </label>
                  <input
                    id={`openingHours-${day}`}
                    name={`openingHours.${day}`}
                    value={prompt.openingHours?.[day] || ""}
                    onChange={handleFieldChange}
                    placeholder={
                      t[`${day.toLowerCase()}Label`]?.replace(":", "") || day
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Store Policies Section */}
          <div className="form-section">
            <h2
              className="form-section-header"
              onClick={() => toggleSection("storePolicies")}
            >
              {t.storePoliciesTitle}
              <span
                className={`section-arrow ${
                  openSections.storePolicies ? "open" : ""
                }`}
              >
                ▼
              </span>
            </h2>
            <div
              className={`section-content ${
                openSections.storePolicies ? "open" : ""
              }`}
            >
              <div className="form-group">
                <label htmlFor="returnPolicy">{t.returnPolicyLabel}</label>
                <textarea
                  id="returnPolicy"
                  name="returnPolicy"
                  value={prompt.returnPolicy || ""}
                  onChange={handleFieldChange}
                  placeholder={t.returnPolicyLabel}
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label htmlFor="warrantyPolicy">{t.warrantyPolicyLabel}</label>
                <textarea
                  id="warrantyPolicy"
                  name="warrantyPolicy"
                  value={prompt.warrantyPolicy || ""}
                  onChange={handleFieldChange}
                  placeholder={t.warrantyPolicyLabel}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Behavior Settings Section */}
          <div className="form-section">
            <h2
              className="form-section-header"
              onClick={() => toggleSection("behaviorSettings")}
            >
              {t.behaviorSettingsSectionTitle}
              <span
                className={`section-arrow ${
                  openSections.behaviorSettings ? "open" : ""
                }`}
              >
                ▼
              </span>
            </h2>
            <div
              className={`section-content ${
                openSections.behaviorSettings ? "open" : ""
              }`}
            >
              {renderSimpleArray(
                "initialInteraction",
                t.initialInteractionLabel,
                t.addInteractionButton,
                t.initialInteractionLabel.replace(":", "")
              )}
              {renderSimpleArray(
                "customerServiceGuidelines",
                t.customerServiceGuidelinesLabel,
                t.addGuidelineButton,
                t.customerServiceGuidelinesLabel.replace(":", "")
              )}

              {renderObjectArray(
                "exampleResponses",
                t.exampleResponsesTitle,
                t.addExampleResponseButton,
                () => ({ scenario: "", response: "" }),
                (item, index) => (
                  <>
                    <label htmlFor={`example-${index}-scenario`}>
                      {t.scenarioLabel}
                    </label>
                    <textarea
                      id={`example-${index}-scenario`}
                      value={item.scenario || ""}
                      onChange={(e) =>
                        handleObjectArrayItemChange(
                          "exampleResponses",
                          index,
                          "scenario",
                          e.target.value
                        )
                      }
                      placeholder={t.scenarioLabel}
                      rows={2}
                    />
                    <label htmlFor={`example-${index}-response`}>
                      {t.responseLabel}
                    </label>
                    <textarea
                      id={`example-${index}-response`}
                      value={item.response || ""}
                      onChange={(e) =>
                        handleObjectArrayItemChange(
                          "exampleResponses",
                          index,
                          "response",
                          e.target.value
                        )
                      }
                      placeholder={t.responseLabel}
                      rows={3}
                    />
                  </>
                )
              )}

              {renderObjectArray(
                "edgeCases",
                t.edgeCasesTitle,
                t.addEdgeCaseButton,
                () => ({ case: "", action: "" }),
                (item, index) => (
                  <>
                    <label htmlFor={`edgecase-${index}-case`}>
                      {t.caseLabel}
                    </label>
                    <textarea
                      id={`edgecase-${index}-case`}
                      value={item.case || ""}
                      onChange={(e) =>
                        handleObjectArrayItemChange(
                          "edgeCases",
                          index,
                          "case",
                          e.target.value
                        )
                      }
                      placeholder={t.caseLabel}
                      rows={2}
                    />
                    <label htmlFor={`edgecase-${index}-action`}>
                      {t.actionLabel}
                    </label>
                    <textarea
                      id={`edgecase-${index}-action`}
                      value={item.action || ""}
                      onChange={(e) =>
                        handleObjectArrayItemChange(
                          "edgeCases",
                          index,
                          "action",
                          e.target.value
                        )
                      }
                      placeholder={t.actionLabel}
                      rows={2}
                    />
                  </>
                )
              )}
            </div>
          </div>

          {/* Available Categories Section */}
          <div className="form-section">
            <h2
              className="form-section-header"
              onClick={() => toggleSection("categories")}
            >
              {t.availableCategoriesSectionTitle}
              <span
                className={`section-arrow ${
                  openSections.categories ? "open" : ""
                }`}
              >
                ▼
              </span>
            </h2>
            <div
              className={`section-content ${
                openSections.categories ? "open" : ""
              }`}
            >
              {renderSimpleArray(
                "availableCategories",
                null,
                t.addCategoryButton,
                t.availableCategoriesSectionTitle.replace(":", "")
              )}
            </div>
          </div>

          {/* Tools Usage Section */}
          <div className="form-section">
            <h2
              className="form-section-header"
              onClick={() => toggleSection("tools")}
            >
              {t.toolsUsageSectionTitle}
              <span
                className={`section-arrow ${openSections.tools ? "open" : ""}`}
              >
                ▼
              </span>
            </h2>
            <div
              className={`section-content ${openSections.tools ? "open" : ""}`}
            >
              <div className="form-group">
                <label htmlFor="tools-name">{t.toolNameLabel}</label>
                <input
                  id="tools-name"
                  name="tools.name"
                  value={prompt.tools?.name || ""}
                  onChange={handleFieldChange}
                  placeholder={t.toolNameLabel}
                />
              </div>
              <div className="form-group">
                <label htmlFor="tools-description">{t.descriptionLabel}</label>
                <textarea
                  id="tools-description"
                  name="tools.description"
                  value={prompt.tools?.description || ""}
                  onChange={handleFieldChange}
                  placeholder={t.descriptionLabel}
                  rows={3}
                />
              </div>
              {renderSimpleArray(
                "tools.purposes",
                t.purposesLabel,
                t.addPurposeButton,
                t.purposesLabel.replace(":", "")
              )}
            </div>
          </div>

          {/* Privacy and Compliance Section */}
          <div className="form-section">
            <h2
              className="form-section-header"
              onClick={() => toggleSection("privacy")}
            >
              {t.privacyComplianceSectionTitle}
              <span
                className={`section-arrow ${
                  openSections.privacy ? "open" : ""
                }`}
              >
                ▼
              </span>
            </h2>
            <div
              className={`section-content ${
                openSections.privacy ? "open" : ""
              }`}
            >
              <div className="form-group">
                <label htmlFor="privacyAndComplianceGuidelines">
                  {t.guidelinesLabel}
                </label>
                <textarea
                  id="privacyAndComplianceGuidelines"
                  name="privacyAndComplianceGuidelines"
                  value={prompt.privacyAndComplianceGuidelines || ""}
                  onChange={handleFieldChange}
                  placeholder={t.guidelinesLabel}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* MCP Servers Section */}
          <div className="form-section">
            <h2
              className="form-section-header"
              onClick={() => toggleSection("mcpServers")}
            >
              {t.mcpServersSectionTitle}
              <span
                className={`section-arrow ${
                  openSections.mcpServers ? "open" : ""
                }`}
              >
                ▼
              </span>
            </h2>
            <div
              className={`section-content ${
                openSections.mcpServers ? "open" : ""
              }`}
            >
              {renderObjectArray(
                "mcpServers",
                null,
                t.addMcpServerButton,
                () => ({ name: "", command: "", args: [], enabled: true }),
                (item, idx) => (
                  <>
                    <div className="form-group">
                      <label htmlFor={`mcp-${idx}-name`}>
                        {t.mcpServerNameLabel}
                      </label>
                      <input
                        id={`mcp-${idx}-name`}
                        value={item.name || ""}
                        onChange={(e) =>
                          handleObjectArrayItemChange(
                            "mcpServers",
                            idx,
                            "name",
                            e.target.value
                          )
                        }
                        required
                        placeholder={t.mcpServerNameLabel}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`mcp-${idx}-command`}>
                        {t.mcpServerCommandLabel}
                      </label>
                      <input
                        id={`mcp-${idx}-command`}
                        value={item.command || ""}
                        onChange={(e) =>
                          handleObjectArrayItemChange(
                            "mcpServers",
                            idx,
                            "command",
                            e.target.value
                          )
                        }
                        required
                        placeholder={t.mcpServerCommandLabel}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`mcp-${idx}-args`}>
                        {t.mcpServerArgsLabel}
                      </label>
                      <input
                        id={`mcp-${idx}-args`}
                        value={
                          Array.isArray(item.args) ? item.args.join(", ") : ""
                        }
                        onChange={(e) =>
                          handleObjectArrayItemChange(
                            "mcpServers",
                            idx,
                            "args",
                            e.target.value
                          )
                        }
                        placeholder={t.mcpServerArgsLabel}
                      />
                    </div>
                    <div className="form-group mcp-enabled-group">
                      <label htmlFor={`mcp-${idx}-enabled`}>
                        {t.mcpServerEnabledLabel}
                      </label>
                      <input
                        id={`mcp-${idx}-enabled`}
                        type="checkbox"
                        checked={
                          item.enabled === undefined ? true : item.enabled
                        }
                        onChange={(e) =>
                          handleObjectArrayItemChange(
                            "mcpServers",
                            idx,
                            "enabled",
                            e.target.checked
                          )
                        }
                      />
                    </div>
                  </>
                )
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="save-button"
            >
              {saving
                ? t.savingButton
                : mode === "create"
                ? t.createButton
                : t.updateButton}
            </button>
            {saved && <span className="saved-message">{t.savedSuccess}</span>}
          </div>
        </form>
      )}
    </div>
  );
}
