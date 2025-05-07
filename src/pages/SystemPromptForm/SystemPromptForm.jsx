// --- START OF FILE src/pages/SystemPromptForm/SystemPromptForm.jsx ---
import React, { useState } from "react";
import "./SystemPromptForm.css"; // Import local CSS
import axios from "axios";

// Import shared data and utilities
import { translations } from "../../data/translations";
import { API_BASE_URL } from "../../constants/api";
import { getNestedValue, setNestedValue, updateArrayByPath } from "../../utils/stateHelpers";


export default function SystemPromptForm() {
  // State for the input field used to fetch/specify a prompt name
  const [fetchInputName, setFetchInputName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  // 'create' means the form is ready to create a NEW prompt with prompt.name
  // 'update' means the form is editing an EXISTING prompt (name is disabled)
  const [mode, setMode] = useState("initial"); // 'initial', 'create', or 'update'
  const [language, setLanguage] = useState("en"); // 'en' or 'he'

  // State to manage which sections are open
  const [openSections, setOpenSections] = useState({
    fetch: true, // Keep fetch section open initially
    basicInfo: false,
    languageSettings: false,
    storeInfo: false,
    storePolicies: false,
    behaviorSettings: false,
    categories: false,
    tools: false,
    privacy: false,
    mcpServers: false,
  });

  // Initialize state based on schema structure
  // Use a function for initial state to prevent recalculation on every render
  const getInitialPromptState = (name = "") => ({
    name: name, // Use name passed or empty string
    identity: "",
    primaryLanguage: "",
    secondaryLanguage: "",
    languageRules: [], // Array of strings
    storeName: "",
    storeAddress: "",
    storePhone: "",
    storeEmail: "",
    openingHours: { // Object with string values
      Sunday: "",
      Monday: "",
      Tuesday: "",
      Wednesday: "",
      Thursday: "",
      Friday: "",
      Saturday: "",
    },
    availableCategories: [], // Array of strings
    returnPolicy: "",
    warrantyPolicy: "",
    initialInteraction: [], // Array of strings
    customerServiceGuidelines: [], // Array of strings
    exampleResponses: [], // Array of objects { scenario: "", response: "" }
    edgeCases: [], // Array of objects { case: "", action: "" }
    tools: { // Nested object with array
      name: "",
      description: "",
      purposes: [], // Array of strings
    },
    privacyAndComplianceGuidelines: "",
    mcpServers: [], // Array of objects { name: "", command: "", args: [], enabled: boolean }
  });

  // State holding the actual prompt data being edited/created
  const [prompt, setPrompt] = useState(getInitialPromptState());

  // Fetch prompt by name
  const handleLoadPrompt = async () => {
    const trimmedName = fetchInputName.trim();
    if (!trimmedName) {
      setError(t.fetchPlaceholder);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSaved(false); // Hide saved message
      setPrompt(getInitialPromptState()); // Clear previous prompt data while loading

      const response = await axios.get(
        `${API_BASE_URL}/systemprompt/${encodeURIComponent(trimmedName)}` // Encode name
      );

      if (response.data) {
        // Prompt found: set to update mode
        setPrompt(response.data);
        setMode("update");
        setError(null); // Clear error
         // Keep fetch input name to show what was loaded, or clear?
         // Let's clear it to make it ready for a new fetch/create name
         setFetchInputName("");

      } else {
         // This should ideally be handled by the 404 catch below
         // If not found, reset form for creation with the entered name
         setPrompt(getInitialPromptState(trimmedName));
         setMode("create");
         setError(null);
         console.log(`Prompt '${trimmedName}' not found. Ready to create.`);
          // Clear fetch input after trying to fetch
         setFetchInputName("");
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // Prompt not found: set to create mode with the new name
        const trimmedName = fetchInputName.trim(); // Use the name user typed
        setPrompt(getInitialPromptState(trimmedName)); // Initialize with the name
        setMode("create");
        setError(`${t.promptNotFound} "${trimmedName}"`); // Clear any previous error
        console.log(`Prompt '${trimmedName}' not found. Ready to create.`);
      } else {
        console.error("Error fetching prompt:", err);
        setError(
          `${t.errorFetching} ${err.message}`
        );
         // Clear prompt data and mode on hard error
         setPrompt(getInitialPromptState());
         setMode("initial");
      }
       // Clear fetch input on error or not found
      setFetchInputName("");
    } finally {
      setLoading(false);
    }
  };

  // Save or update prompt
  const handleSave = async () => {
    // Ensure prompt name is set (it should be if mode is 'create' or 'update')
    if (!prompt.name.trim()) {
      setError("Prompt name is missing."); // Should not happen if UI flow is correct
      return;
    }

    // Basic validation (can be expanded)
    if (
      !prompt.identity.trim() ||
      !prompt.primaryLanguage.trim() ||
      !prompt.storeName.trim()
      // Add more required fields here if needed
    ) {
      setError(
        "Please fill in mandatory fields (Identity, Primary Language, Store Name)."
      );
      // Optionally highlight fields or open relevant sections
       setOpenSections(prev => ({ ...prev, basicInfo: true, languageSettings: true, storeInfo: true }));
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSaved(false); // Hide previous saved message

      const url =
        mode === "create"
          ? `${API_BASE_URL}/systemprompt`
          : `${API_BASE_URL}/systemprompt/${encodeURIComponent(prompt.name)}`; // Use encoded prompt.name for update URL

      const method = mode === "create" ? "POST" : "PUT";

      await axios({
        method: method,
        url: url,
        data: prompt, // Send the entire prompt state
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000); // Clear saved message after 3 seconds
      setMode("update"); // After creating, the mode becomes update
       // Clear fetch input after successful save/update if it wasn't cleared already
       setFetchInputName("");
       setError(null); // Clear any lingering errors after successful save

    } catch (err) {
        console.error("Error saving prompt:", err);
      setError(
        `${t.errorSaving} ${
          err.response?.data?.message || err.message // Use backend error message if available
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  // Generic handler for simple field changes (uses dot notation for nested objects)
  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    const valueToUse = type === 'checkbox' ? checked : value;
    const pathParts = name.split('.'); // e.g., ['openingHours', 'Sunday']

    setPrompt(prev => setNestedValue(prev, pathParts, valueToUse));
  };

  // Handler for updating items in simple arrays (array of strings)
  const handleSimpleArrayItemChange = (path, index, value) => {
      setPrompt(prev => updateArrayByPath(prev, path, arr => {
          if (arr[index] !== undefined) { // Prevent errors if index is somehow invalid
            arr[index] = value;
          }
          return arr;
      }));
  };

  // Handler for updating fields in objects within arrays
  const handleObjectArrayItemChange = (path, index, field, value) => {
       setPrompt(prev => updateArrayByPath(prev, path, arr => {
           if (!arr[index]) arr[index] = {}; // Ensure object exists
           // Special handling for args which is an array of strings from comma-separated input
           if (path === 'mcpServers' && field === 'args' && typeof value === 'string') {
               arr[index][field] = value.split(',').map(arg => arg.trim()).filter(arg => arg !== '');
           } else {
              arr[index][field] = value; // Update the field directly
           }
           return arr;
       }));
  };


  // Add item to simple array (array of strings)
  const addSimpleArrayItem = (path, defaultValue = "") => {
    setPrompt(prev => updateArrayByPath(prev, path, arr => {
        arr.push(defaultValue);
        return arr;
    }));
  };

  // Add complex object to array
  const addObjectToArray = (path, defaultObj) => {
     setPrompt(prev => updateArrayByPath(prev, path, arr => {
        arr.push(defaultObj);
        return arr;
    }));
  };

  // Remove item from any array
  const removeArrayItem = (path, index) => {
    setPrompt(prev => updateArrayByPath(prev, path, arr => {
        arr.splice(index, 1);
        return arr;
    }));
  };

  // Toggle section visibility
  const toggleSection = (sectionName) => {
    setOpenSections((prev) => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const t = translations[language]; // Shorthand for current language translations

  // Helper function to render array items consistently (strings)
  const renderSimpleArray = (path, label, addButtonLabel, itemPlaceholderBase) => {
    const items = getNestedValue(prompt, path.split('.')) || []; // Get array value safely
    return (
      <div className="form-group array-section">
        <label>{label}</label>
        {(items).map((item, index) => (
          <div key={index} className="array-item">
            <textarea
              value={item}
              onChange={(e) =>
                handleSimpleArrayItemChange(path, index, e.target.value)
              }
              // required // Consider if array items are always required
              placeholder={`${itemPlaceholderBase} ${index + 1}`}
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
          onClick={() => addSimpleArrayItem(path, "")}
          className="add-button"
        >
          {addButtonLabel}
        </button>
      </div>
    );
  };

   // Helper function to render object array items consistently
    const renderObjectArray = (path, sectionTitle, addButtonLabel, defaultItem, renderItemContent) => {
        const items = getNestedValue(prompt, path.split('.')) || []; // Get array value safely
        // Use the base English title for dynamic item titles if needed, otherwise just "Item"
        const itemTitleBase = translations.en[`${path.replace(/s$/, 'Title')}`] || "Item";

        return (
             <>
             {/* Only render h3 if there's a title */}
             {sectionTitle && <h3>{sectionTitle}</h3>}
            <div className="form-group array-section">
              {(items).map((item, index) => (
                <div key={index} className="object-array-item">
                  <h4>
                     {/* Translate example response/edge case title and add index */}
                    {itemTitleBase} {index + 1} {/* Dynamic title e.g., "Example Response 1" */}
                  </h4>
                  {/* Render the specific content for each item */}
                  {renderItemContent(item, index)}

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
                onClick={() => addObjectToArray(path, defaultItem)}
                className="add-button"
              >
                {addButtonLabel}
              </button>
            </div>
            </>
        );
    };


  return (
    <div className={`system-prompt-form lang-${language}`}>
      <h1>{t.title}</h1>

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
              placeholder={t.fetchPlaceholder}
              value={fetchInputName}
              onChange={(e) => setFetchInputName(e.target.value)}
               // Allow pressing Enter to load
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLoadPrompt(); }}}
            />
            <button type="button" onClick={handleLoadPrompt} disabled={loading || saving || !fetchInputName.trim()}>
              {loading ? t.loading : t.fetchButton}
            </button>
             {/* Display current mode and prompt name */}
            {mode !== 'initial' && (
                 <div className="mode-indicator">
                    {mode === 'create' ? t.creatingPrompt : t.editingPrompt} "<strong>{prompt.name}</strong>"
                 </div>
             )}
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Show the form details only when a prompt is loaded or being created */}
      {mode !== 'initial' && (
         <form onSubmit={(e) => e.preventDefault()}>
        {/* Basic Information Section */}
        <div className="form-section">
          <h2
            className="form-section-header"
            onClick={() => toggleSection("basicInfo")}
          >
            {t.basicInfoSectionTitle}
             <span className={`section-arrow ${openSections.basicInfo ? "open" : ""}`}>
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
                value={prompt.name}
                onChange={handleFieldChange} // Keep onChange but it will be disabled in update mode
                required
                disabled={mode === "update"} // Disable name input in update mode
                placeholder={t.nameLabel}
              />
              {mode === "update" && (
                <small
                  style={{
                    display: "block",
                    marginTop: "5px",
                    color: "#555",
                    fontSize: "0.8rem",
                  }}
                >
                  Prompt name cannot be changed after creation.
                </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="identity">{t.identityLabel}</label>
              <textarea
                 id="identity"
                name="identity"
                value={prompt.identity}
                onChange={handleFieldChange}
                required
                placeholder={t.identityLabel}
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
             <span className={`section-arrow ${openSections.languageSettings ? "open" : ""}`}>
               ▼
            </span>
          </h2>
          <div
            className={`section-content ${
              openSections.languageSettings ? "open" : ""
            }`}
          >
            <div className="form-group">
              <label htmlFor="primaryLanguage">{t.primaryLanguageLabel}</label>
              <input
                 id="primaryLanguage"
                name="primaryLanguage"
                value={prompt.primaryLanguage}
                onChange={handleFieldChange}
                required
                placeholder={t.primaryLanguageLabel}
              />
            </div>

            <div className="form-group">
              <label htmlFor="secondaryLanguage">{t.secondaryLanguageLabel}</label>
              <input
                 id="secondaryLanguage"
                name="secondaryLanguage"
                value={prompt.secondaryLanguage}
                onChange={handleFieldChange}
                required
                placeholder={t.secondaryLanguageLabel}
              />
            </div>

            {renderSimpleArray(
                "languageRules",
                t.languageRulesLabel,
                t.addRuleButton,
                translations.en.languageRulesLabel.replace(':', '')
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
             <span className={`section-arrow ${openSections.storeInfo ? "open" : ""}`}>
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
                value={prompt.storeName}
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
                value={prompt.storeAddress}
                onChange={handleFieldChange}
                required
                placeholder={t.addressLabel}
              />
            </div>

            <h3>{t.contactInfoTitle}</h3>
            <div className="form-group">
              <label htmlFor="storePhone">{t.phoneLabel}</label>
              <input
                 id="storePhone"
                name="storePhone"
                value={prompt.storePhone}
                onChange={handleFieldChange}
                required
                placeholder={t.phoneLabel}
                type="tel"
              />
            </div>

            <div className="form-group">
              <label htmlFor="storeEmail">{t.emailLabel}</label>
              <input
                 id="storeEmail"
                name="storeEmail"
                value={prompt.storeEmail}
                onChange={handleFieldChange}
                required
                placeholder={t.emailLabel}
                type="email"
              />
            </div>

            <h3>{t.openingHoursTitle}</h3>
            {Object.keys(prompt.openingHours).map((day) => (
              <div className="form-group" key={day}>
                <label htmlFor={`openingHours-${day}`}>{t[`${day.toLowerCase()}Label`]}:</label>
                <input
                  id={`openingHours-${day}`}
                  name={`openingHours.${day}`}
                  value={prompt.openingHours[day]}
                  onChange={handleFieldChange}
                  required
                  placeholder={t[`${day.toLowerCase()}Label`]}
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
             <span className={`section-arrow ${openSections.storePolicies ? "open" : ""}`}>
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
                value={prompt.returnPolicy}
                onChange={handleFieldChange}
                required
                placeholder={t.returnPolicyLabel}
              />
            </div>

            <div className="form-group">
              <label htmlFor="warrantyPolicy">{t.warrantyPolicyLabel}</label>
              <textarea
                 id="warrantyPolicy"
                name="warrantyPolicy"
                value={prompt.warrantyPolicy}
                onChange={handleFieldChange}
                required
                placeholder={t.warrantyPolicyLabel}
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
             <span className={`section-arrow ${openSections.behaviorSettings ? "open" : ""}`}>
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
                 translations.en.initialInteractionLabel.replace(':', '')
            )}

            {renderSimpleArray(
                "customerServiceGuidelines",
                t.customerServiceGuidelinesLabel,
                t.addGuidelineButton,
                 translations.en.customerServiceGuidelinesLabel.replace(':', '')
            )}

            {renderObjectArray(
                "exampleResponses",
                t.exampleResponsesTitle,
                t.addExampleResponseButton,
                { scenario: "", response: "" },
                (item, index) => (
                    <>
                        <label htmlFor={`example-${index}-scenario`}>{t.scenarioLabel}</label>
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
                           required
                           placeholder={t.scenarioLabel}
                         />

                        <label htmlFor={`example-${index}-response`}>{t.responseLabel}</label>
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
                           required
                           placeholder={t.responseLabel}
                         />
                    </>
                )
            )}

            {renderObjectArray(
                "edgeCases",
                 t.edgeCasesTitle,
                t.addEdgeCaseButton,
                { case: "", action: "" },
                (item, index) => (
                    <>
                       <label htmlFor={`edgecase-${index}-case`}>{t.caseLabel}</label>
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
                          required
                          placeholder={t.caseLabel}
                        />

                       <label htmlFor={`edgecase-${index}-action`}>{t.actionLabel}</label>
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
                          required
                          placeholder={t.actionLabel}
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
             <span className={`section-arrow ${openSections.categories ? "open" : ""}`}>
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
                t.availableCategoriesSectionTitle.replace(':', ''),
                t.addCategoryButton,
                 translations.en.availableCategoriesSectionTitle.replace(':', '')
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
             <span className={`section-arrow ${openSections.tools ? "open" : ""}`}>
               ▼
            </span>
          </h2>
          <div
            className={`section-content ${openSections.tools ? "open" : ""}`}
          >
            {/* Tools is a single object, not an array of objects */}
            <div className="form-group">
              <label htmlFor="tools-name">{t.toolNameLabel}</label>
              <input
                 id="tools-name"
                name="tools.name"
                value={prompt.tools?.name || ""}
                onChange={handleFieldChange}
                required
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
                required
                placeholder={t.descriptionLabel}
              />
            </div>

             {renderSimpleArray(
                "tools.purposes",
                t.purposesLabel,
                t.addPurposeButton,
                translations.en.purposesLabel.replace(':', '')
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
             <span className={`section-arrow ${openSections.privacy ? "open" : ""}`}>
               ▼
            </span>
          </h2>
          <div
            className={`section-content ${openSections.privacy ? "open" : ""}`}
          >
            <div className="form-group">
              <label htmlFor="privacyAndComplianceGuidelines">{t.guidelinesLabel}</label>
              <textarea
                 id="privacyAndComplianceGuidelines"
                name="privacyAndComplianceGuidelines"
                value={prompt.privacyAndComplianceGuidelines}
                onChange={handleFieldChange}
                required
                placeholder={t.guidelinesLabel}
              />
            </div>
          </div>
        </div>

        {/* MCP Servers Section */}
        <div className="form-section"> {/* Wrap in form-section for collapsible behavior */}
            <h2
              className="form-section-header"
              onClick={() => toggleSection("mcpServers")}
            >
             {t.mcpServersSectionTitle}
              <span className={`section-arrow ${openSections.mcpServers ? "open" : ""}`}>
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
                     { name: "", command: "", args: [], enabled: true },
                     (item, idx) => (
                         <>
                            <label htmlFor={`mcp-${idx}-name`}>{t.mcpServerNameLabel}</label>
                            <input
                               id={`mcp-${idx}-name`}
                               value={item.name}
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
                             <label htmlFor={`mcp-${idx}-command`}>{t.mcpServerCommandLabel}</label>
                             <input
                                id={`mcp-${idx}-command`}
                               value={item.command}
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
                             <label htmlFor={`mcp-${idx}-args`}>{t.mcpServerArgsLabel}</label>
                             <input
                                 id={`mcp-${idx}-args`}
                               value={Array.isArray(item.args) ? item.args.join(", ") : (item.args || "")}
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
                             <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                 <label htmlFor={`mcp-${idx}-enabled`} style={{marginBottom: 0}}>{t.mcpServerEnabledLabel}</label>
                                 <input
                                    id={`mcp-${idx}-enabled`}
                                   type="checkbox"
                                   checked={item.enabled}
                                   onChange={(e) =>
                                     handleObjectArrayItemChange(
                                       "mcpServers",
                                       idx,
                                       "enabled",
                                       e.target.checked
                                     )
                                   }
                                   style={{width: 'auto', margin: 0}}
                                 />
                            </div>
                         </>
                     )
                 )}
            </div>
        </div>


        <div className="form-actions">
          <button
            type="button"
            onClick={handleSave}
             // Disable save if loading, saving, or mandatory fields are empty (name is disabled if update mode)
            disabled={saving || loading || !prompt.name.trim() || !prompt.identity.trim() || !prompt.primaryLanguage.trim() || !prompt.storeName.trim()}
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
