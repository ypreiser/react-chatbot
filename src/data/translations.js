// src\data\translations.js
export const translations = {
  en: {
    // --- General UI & Common ---
    loading: "Loading... please wait 🐧",
    savingButton: "Saving... just a sec 🐧",
    removeButton: "Remove",
    languageSelectorShort: "Lang:", // For Header
    english: "English",
    hebrew: "Hebrew",
    errorRequiredField: "Oops! This field is a must-have.",
    errorInvalidEmail: "Hmm, that email doesn't look right.",
    errorPasswordTooShort: "Password needs to be a bit longer (min 6 chars).",
    errorInvalidPhone: "Is that a real phone number? Check it out!",
    errorGenericSave:
      "Oh no! Something went wrong while saving. Give it another go?",
    errorGenericLoad: "Bummer! Couldn't load the data. Maybe try again?",
    nextButton: "Next Step!",
    prevButton: "Go Back",
    viewButton: "View",
    editButton: "Edit",
    deleteButton: "Delete",
    yesButton: "Yes",
    noButton: "No",
    areYouSureTitle: "Are you sure?",
    areYouSureLogout: "Are you sure you want to log out?",
    appTitle: "Chatbot Admin",
    navChatInterface: "Chat Interface",
    navBotSettings: "Bot Settings",
    navWhatsapp: "WhatsApp",
    navChatHistory: "Chat History",
    navAdminDashboard: "Admin Dashboard",
    navLogout: "Logout",
    addGenericItemButton: "Add Item",

    // --- Registration Page Specific (from previous step, ensure they fit) ---
    registerTitle: "Join the Party! Create Your Account",
    stepIndicator: "Step {currentStep} of {totalSteps}",
    personalInformationLegend: "About You (The Human)",
    businessInformationLegend: "Your Awesome Project/Business",
    contactPersonLegend: "Your Go-To Contact Person",
    fullNameLabel: "Full Name",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    passwordRequirements: "Min. 6 characters. Make it strong!",
    businessNameLabel: "Project/Business Name",
    businessEntityTypeLabel: "Type (e.g., Personal Project, LLC, Startup)",
    businessIdLabel: "Registration/ID (if applicable)",
    companyPhoneLabel: "Main Phone (if you have one)",
    businessFieldLabel: "What's it all about? (Field/Industry)",
    websiteLabel: "Website (Optional, but cool!)",
    addressLabel: "Main Address (Optional)",
    contactNameLabel: "Contact Person's Name",
    contactPhoneLabel: "Contact Person's Phone",
    submitRegisterButton: "Let's Go!",
    loginLinkText: "Login",
    registerLinkText: "Sign Up",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "New here?",

    // --- Bot Profile Form Specific ---
    botProfileEditorTitle: "🤖 Bot Brain Central 🧠",
    profiTip: "Profi's Tip 🐧: ",
    profiWelcomeNewBot:
      "Hey there! Let's build an amazing new bot buddy together! Fill in these details to bring it to life. 🚀",
    profiWelcomeEditBot:
      "Welcome back! Let's fine-tune this bot's brain. What shall we tweak today? ✨",
    profiFetchTip:
      "Got an existing bot? Type its name to load it up. Starting fresh? Just type a new name and hit the button!",
    fetchBotSectionTitle: "Find or Create a Bot Buddy",
    fetchBotPlaceholder: "Bot name (e.g., 'Support Star', 'My First Bot')",
    fetchBotButton: "Load / Start New Bot",
    botNotFound: "Bot not found. Let's create a new one named:",
    editingBot: "Currently Tinkering With:",
    creatingBot: "Building a New Bot:",
    errorSavingBot: "Error saving Bot Profile:",
    botSavedSuccess: "Bot Profile saved! High five! 🐧",

    // Bot Profile Steps & Sections
    step1_identity_title: "1. Who is Your Bot?",
    step2_knowledge_title: "2. What Does It Know?",
    step3_interaction_title: "3. How Does It Talk?",
    step4_advanced_title: "4. Techy Stuff & Tools",

    basicInfoSectionTitle: "Core Identity",
    botNameLabel: "Bot's Name:",
    botNamePlaceholder: "e.g., 'Helpful Harry', 'Sassy Sally'",
    botNameUpdateNote:
      "Can't change name after creation (it's like a tattoo!).",
    botDescriptionLabel: "Bot's Bio (Quick Intro):",
    botDescriptionPlaceholder: "A few words about what this bot does or is.",
    botIdentityLabel: "Bot's Persona / Role:",
    botIdentityPlaceholder:
      "e.g., 'A friendly assistant for customer support', 'A witty expert on space travel'",
    botCommunicationStyleLabel: "Communication Style:",
    styleFormal: "Formal & Proper",
    styleFriendly: "Friendly & Casual",
    styleHumorous: "Witty & Humorous",
    styleProfessional: "Crisp & Professional",
    styleCustom: "Custom (you define it in persona!)",
    botIsEnabledLabel: "Bot Enabled (Ready for Action?):",
    profiNameTip: "A catchy name helps your bot stand out!",
    profiIdentityTip:
      "Think of your bot's personality. Is it serious? Funny? Super smart?",

    languageSettingsSectionTitle: "Language Skills",
    primaryLanguageLabel: "Main Language:",
    secondaryLanguageLabel: "Other Language (Optional):",
    languageRulesLabel: "Special Language Rules/Quirks:",
    addRuleButton: "Add Rule",
    languageRuleItemPlaceholder: "e.g., 'Always use emojis', 'Avoid slang'",
    profiLangTip:
      "Bots can be multilingual! Pick the languages it needs to master.",

    knowledgeBaseSectionTitle: "Knowledge Power-Ups",
    knowledgeBaseItemsLabel: "Specific Info Snippets:",
    addKnowledgeItemButton: "Add Info Snippet",
    knowledgeItemTopicLabel: "Topic/Question:",
    knowledgeItemTopicPlaceholder:
      "e.g., 'Return Policy', 'How to reset password?'",
    knowledgeItemContentLabel: "Answer/Details:",
    knowledgeItemContentPlaceholder: "The information your bot should provide.",
    knowledgeItemTitle: "Info Snippet", // For ObjectArrayInput item titles
    tagsLabel: "Keywords/Tags (comma-separated):", // Updated label for clarity
    // addTagButton: "Add Tag", // Not needed if using comma-separated input
    tagItemPlaceholder: "e.g., support, faq, product-info",
    profiKnowledgeTip:
      "Think of this as your bot's personal cheat sheet! The more useful stuff you add here, the smarter and more helpful it becomes. No one likes a bot that only says 'I don't know'!",
    profiTagTip:
      "Tags are like little keywords for your bot's brain! Add a few (comma-separated) to help it organize info, like 'greetings', 'pricing', or 'silly-jokes'.",

    interactionSectionTitle: "Conversation Flow",
    initialInteractionLabel: "Greeting & Opening Lines:",
    addInitialInteractionButton: "Add Greeting",
    initialInteractionPlaceholder: "e.g., 'Hello! How can I help you today?'",
    interactionGuidelinesLabel: "General Chatting Rules:",
    addInteractionGuidelineButton: "Add Guideline",
    interactionGuidelinePlaceholder:
      "e.g., 'Be polite', 'Keep answers concise'",
    profiInteractionTip:
      "First impressions matter! How should your bot start a chat?",

    exampleResponsesSectionTitle: "Learn by Example",
    addExampleResponseButton: "Add Example",
    exampleResponseTitle: "Example",
    scenarioLabel: "When User Says/Asks (Scenario):",
    scenarioPlaceholder: "e.g., 'I want a refund'",
    responseLabel: "Bot Should Say (Response):",
    responsePlaceholder:
      "e.g., 'I can help with that. Could you please provide your order number?'",
    profiExampleTip:
      "Giving your bot specific examples is like training a new team member! Show it *exactly* how to respond to common questions. The more good examples, the better it'll learn to handle similar situations on its own.",

    edgeCasesSectionTitle: "Tricky Situations",
    addEdgeCaseButton: "Add Tricky Case",
    edgeCaseTitle: "Tricky Case",
    caseLabel: "If This Happens (Case):",
    casePlaceholder: "e.g., 'User is angry', 'Bot doesn't know answer'",
    actionLabel: "Bot Should Do/Say (Action):",
    actionPlaceholder:
      "e.g., 'Apologize and escalate to human', 'Say I am still learning'",
    profiEdgeCaseTip:
      "Prepare your bot for when things get weird or unexpected!",

    toolsUsageSectionTitle: "Superpowers (Tools)",
    toolNameLabel: "Tool Name:",
    toolDescriptionLabel: "Tool Description:",
    toolPurposesLabel: "Tool Purposes:",
    addPurposeButton: "Add Purpose",
    purposePlaceholder: "e.g., 'Fetch order status', 'Book appointment'",
    profiToolsTip:
      "Got any special tricks or systems your bot can use? List them here! Even if it's just 'checking the weather', letting the bot know about its 'tools' can make it more versatile. This part is totally optional, no pressure!",

    privacyComplianceSectionTitle: "Privacy & Rules",
    privacyGuidelinesLabel: "Data Handling & Compliance Notes:",
    privacyGuidelinesPlaceholder:
      "e.g., 'Do not store personal data', 'Comply with GDPR'",
    profiPrivacyTip:
      "Important stuff! Make sure your bot respects user privacy.",

    mcpServersSectionTitle: "MCP Server Links (Advanced)",
    addMcpServerButton: "Add MCP Server",
    mcpServerTitle: "Server Config",
    mcpServerNameLabel: "Server Name:",
    mcpServerCommandLabel: "Command:",
    mcpServerArgsLabel: "Arguments (comma-separated):",
    mcpServerEnabledLabel: "Enabled:",
    profiMcpTip:
      "For the tech adventurers! 🚀 If your bot needs to talk to other special 'MCP' servers to get things done, this is the place. It's a bit advanced, so skip it if you're not sure. Your bot will still be awesome!",

    // Form Actions
    saveBotButton: "Save Bot Brain",
    createBotButton: "Build This Bot!",
    updateBotButton: "Update Bot Brain",
  },
  he: {
    // --- General UI & Common ---
    loading: "טוען... נא להמתין 🐧",
    savingButton: "שומר... עוד רגע 🐧",
    removeButton: "הסר",
    languageSelectorShort: "שפה:",
    english: "אנגלית",
    hebrew: "עברית",
    errorRequiredField: "אופס! השדה הזה הוא חובה.",
    errorInvalidEmail: "המממ, האימייל הזה לא נראה תקין.",
    errorPasswordTooShort:
      "סיסמה צריכה להיות קצת יותר ארוכה (מינימום 6 תווים).",
    errorInvalidPhone: "זה מספר טלפון אמיתי? כדאי לבדוק!",
    errorGenericSave: "אוי לא! משהו השתבש בשמירה. ננסה שוב?",
    errorGenericLoad: "באסה! לא הצלחנו לטעון את הנתונים. אולי לנסות שוב?",
    nextButton: "לשלב הבא!",
    prevButton: "חזרה",
    viewButton: "הצג",
    editButton: "ערוך",
    deleteButton: "מחק",
    yesButton: "כן",
    noButton: "לא",
    areYouSureTitle: "האם אתה בטוח?",
    areYouSureLogout: "האם אתה בטוח שברצונך להתנתק?",
    appTitle: "מנהל צ'אטבוטים",
    navChatInterface: "ממשק צ'אט",
    navBotSettings: "הגדרות בוט",
    navWhatsapp: "ווטסאפ",
    navChatHistory: "היסטוריית צ'אטים",
    navAdminDashboard: "לוח מחוונים (מנהל)",
    navLogout: "התנתקות",
    addGenericItemButton: "הוסף פריט",

    // --- Registration Page Specific ---
    registerTitle: "הצטרפו למסיבה! צור חשבון",
    stepIndicator: "שלב {currentStep} מתוך {totalSteps}",
    personalInformationLegend: "עליך (האנושי/ת)",
    businessInformationLegend: "הפרויקט/עסק המגניב שלך",
    contactPersonLegend: "איש/אשת הקשר שלך",
    fullNameLabel: "שם מלא",
    emailLabel: "כתובת דוא״ל",
    passwordLabel: "סיסמה",
    passwordRequirements: "מינימום 6 תווים. שתהיה חזקה!",
    businessNameLabel: "שם הפרויקט/עסק",
    businessEntityTypeLabel: 'סוג (למשל, פרויקט אישי, חברה בע"מ, סטארטאפ)',
    businessIdLabel: "מספר רישום/זיהוי (אם רלוונטי)",
    companyPhoneLabel: "טלפון ראשי (אם יש)",
    businessFieldLabel: "במה מדובר? (תחום/ענף)",
    websiteLabel: "אתר אינטרנט (אופציונלי, אבל מגניב!)",
    addressLabel: "כתובת ראשית (אופציונלי)",
    contactNameLabel: "שם איש/אשת הקשר",
    contactPhoneLabel: "טלפון איש/אשת הקשר",
    submitRegisterButton: "קדימה!",
    loginLinkText: "התחברות",
    registerLinkText: "הרשמה",
    alreadyHaveAccount: "כבר יש לך חשבון?",
    dontHaveAccount: "חדש/ה כאן?",

    // --- Bot Profile Form Specific ---
    botProfileEditorTitle: "🤖 מרכז הבקרה של המוח הבוטי 🧠",
    profiTip: "הטיפ של פרופי 🐧: ",
    profiWelcomeNewBot:
      "היי! בואו נבנה יחד חבר בוט מדהים! מלאו את הפרטים האלה כדי להפיח בו חיים. 🚀",
    profiWelcomeEditBot:
      "ברוכים השבים! בואו נכוונן את מוחו של הבוט. מה נשפצר היום? ✨",
    profiFetchTip:
      "יש לך בוט קיים? הקלד את שמו כדי לטעון אותו. מתחיל מאפס? פשוט הקלד שם חדש ולחץ על הכפתור!",
    fetchBotSectionTitle: "מצא או צור חבר בוט חדש",
    fetchBotPlaceholder: "שם הבוט (למשל, 'כוכב תמיכה', 'הבוט הראשון שלי')",
    fetchBotButton: "טען / התחל בוט חדש",
    botNotFound: "הבוט לא נמצא. בוא ניצור אחד חדש בשם:",
    editingBot: "משפץ כרגע את:",
    creatingBot: "בונה בוט חדש:",
    errorSavingBot: "שגיאה בשמירת פרופיל הבוט:",
    botSavedSuccess: "פרופיל הבוט נשמר! כיף אלוף! 🐧",

    step1_identity_title: "1. מי הבוט שלך?",
    step2_knowledge_title: "2. מה הוא יודע?",
    step3_interaction_title: "3. איך הוא מדבר?",
    step4_advanced_title: "4. דברים טכניים וכלים",

    basicInfoSectionTitle: "זהות ליבה",
    botNameLabel: "שם הבוט:",
    botNamePlaceholder: "למשל, 'עוזרר הארי', 'שנונהשושנה'",
    botNameUpdateNote: "לא ניתן לשנות שם לאחר היצירה (זה כמו קעקוע!).",
    botDescriptionLabel: "ביו של הבוט (הקדמה קצרה):",
    botDescriptionPlaceholder: "כמה מילים על מה הבוט הזה עושה או מי הוא.",
    botIdentityLabel: "פרסונה / תפקיד הבוט:",
    botIdentityPlaceholder:
      "למשל, 'עוזר ידידותי לתמיכת לקוחות', 'מומחה שנון למסע בחלל'",
    botCommunicationStyleLabel: "סגנון תקשורת:",
    styleFormal: "רשמי ומנומס",
    styleFriendly: "ידידותי וקליל",
    styleHumorous: "שנון והומוריסטי",
    styleProfessional: "חד ומקצועי",
    styleCustom: "מותאם אישית (אתה מגדיר בפרסונה!)",
    botIsEnabledLabel: "בוט מאופשר (מוכן לפעולה?):",
    profiNameTip: "שם קליט עוזר לבוט שלך לבלוט!",
    profiIdentityTip: "חשוב על אישיות הבוט. האם הוא רציני? מצחיק? סופר חכם?",

    languageSettingsSectionTitle: "כישורי שפה",
    primaryLanguageLabel: "שפה ראשית:",
    secondaryLanguageLabel: "שפה נוספת (אופציונלי):",
    languageRulesLabel: "כללי שפה / מוזרויות מיוחדות:",
    addRuleButton: "הוסף כלל",
    languageRuleItemPlaceholder: "למשל, 'תמיד להשתמש באימוג'י', 'להימנע מסלנג'",
    profiLangTip:
      "בוטים יכולים להיות רב-לשוניים! בחר את השפות שהוא צריך לשלוט בהן.",

    knowledgeBaseSectionTitle: "תוספות כוח לידע",
    knowledgeBaseItemsLabel: "קטעי מידע ספציפיים:",
    addKnowledgeItemButton: "הוסף קטע מידע",
    knowledgeItemTopicLabel: "נושא/שאלה:",
    knowledgeItemTopicPlaceholder: "למשל, 'מדיניות החזרות', 'איך לאפס סיסמה?'",
    knowledgeItemContentLabel: "תשובה/פרטים:",
    knowledgeItemContentPlaceholder: "המידע שהבוט שלך צריך לספק.",
    knowledgeItemTitle: "קטע מידע",
    tagsLabel: "מילות מפתח/תגיות (מופרדות בפסיק):",
    // addTagButton: "הוסף תגית",
    tagItemPlaceholder: "למשל, תמיכה, שאלות נפוצות, מידע-מוצר",
    profiKnowledgeTip:
      "חשוב על זה כדף הצ'יטים האישי של הבוט שלך! ככל שתוסיף יותר דברים שימושיים, כך הוא יהפוך לחכם ועוזר יותר. אף אחד לא אוהב בוט שאומר רק 'אני לא יודע'!",
    profiTagTip:
      "תגיות הן כמו מילות מפתח קטנות למוח של הבוט שלך! הוסף כמה (מופרדות בפסיק) כדי לעזור לו לארגן מידע, כמו 'ברכות', 'תמחור', או 'בדיחות-טיפשיות'.",

    interactionSectionTitle: "זרימת שיחה",
    initialInteractionLabel: "ברכות ומשפטי פתיחה:",
    addInitialInteractionButton: "הוסף ברכה",
    initialInteractionPlaceholder: "למשל, 'שלום! איך אוכל לעזור לך היום?'",
    interactionGuidelinesLabel: "כללי שיחה כלליים:",
    addInteractionGuidelineButton: "הוסף הנחיה",
    interactionGuidelinePlaceholder:
      "למשל, 'להיות מנומס', 'לשמור על תשובות תמציתיות'",
    profiInteractionTip: "רושם ראשוני חשוב! איך הבוט שלך צריך להתחיל שיחה?",

    exampleResponsesSectionTitle: "ללמוד מתוך דוגמה",
    addExampleResponseButton: "הוסף דוגמה",
    exampleResponseTitle: "דוגמה",
    scenarioLabel: "כאשר משתמש אומר/שואל (תרחיש):",
    scenarioPlaceholder: "למשל, 'אני רוצה החזר כספי'",
    responseLabel: "הבוט צריך לומר (תגובה):",
    responsePlaceholder:
      "למשל, 'אני יכול לעזור בזה. תוכל בבקשה לספק את מספר ההזמנה שלך?'",
    profiExampleTip:
      "לתת לבוט שלך דוגמאות ספציפיות זה כמו לאמן עובד חדש! הראה לו *בדיוק* איך להגיב לשאלות נפוצות. ככל שיהיו יותר דוגמאות טובות, כך הוא ילמד טוב יותר להתמודד עם מצבים דומים בעצמו.",

    edgeCasesSectionTitle: "מצבים מסובכים",
    addEdgeCaseButton: "הוסף מקרה מסובך",
    edgeCaseTitle: "מקרה מסובך",
    caseLabel: "אם זה קורה (מקרה):",
    casePlaceholder: "למשל, 'משתמש כועס', 'בוט לא יודע תשובה'",
    actionLabel: "הבוט צריך לעשות/לומר (פעולה):",
    actionPlaceholder: "למשל, 'להתנצל ולהעביר לאנושי', 'לומר שאני עדיין לומד'",
    profiEdgeCaseTip: "הכן את הבוט שלך למצבים שבהם דברים משתבשים או לא צפויים!",

    toolsUsageSectionTitle: "כוחות על (כלים)",
    toolNameLabel: "שם הכלי:",
    toolDescriptionLabel: "תיאור הכלי:",
    toolPurposesLabel: "מטרות הכלי:",
    addPurposeButton: "הוסף מטרה",
    purposePlaceholder: "למשל, 'אחזור סטטוס הזמנה', 'קביעת פגישה'",
    profiToolsTip:
      "יש לך טריקים מיוחדים או מערכות שהבוט שלך יכול להשתמש בהן? רשום אותם כאן! גם אם זה רק 'בדיקת מזג האוויר', ליידע את הבוט על 'הכלים' שלו יכול להפוך אותו לרב-גוני יותר. החלק הזה הוא אופציונלי לחלוטין, בלי לחץ!",

    privacyComplianceSectionTitle: "פרטיות וחוקים",
    privacyGuidelinesLabel: "הערות טיפול בנתונים ותאימות:",
    privacyGuidelinesPlaceholder:
      "למשל, 'אין לאחסן נתונים אישיים', 'יש לציית ל-GDPR'",
    profiPrivacyTip: "דברים חשובים! ודא שהבוט שלך מכבד את פרטיות המשתמש.",

    mcpServersSectionTitle: "קישורי שרת MCP (מתקדם)",
    addMcpServerButton: "הוסף שרת MCP",
    mcpServerTitle: "תצורת שרת",
    mcpServerNameLabel: "שם השרת:",
    mcpServerCommandLabel: "פקודה:",
    mcpServerArgsLabel: "ארגומנטים (מופרדים בפסיק):",
    mcpServerEnabledLabel: "מאופשר:",
    profiMcpTip:
      "להרפתקני הטכנולוגיה! 🚀 אם הבוט שלך צריך לדבר עם שרתי 'MCP' מיוחדים אחרים כדי לבצע דברים, זה המקום. זה קצת מתקדם, אז דלג על זה אם אינך בטוח. הבוט שלך עדיין יהיה מדהים!",

    saveBotButton: "שמור את מוח הבוט",
    createBotButton: "בנה את הבוט הזה!",
    updateBotButton: "עדכן את מוח הבוט",
  },
};
