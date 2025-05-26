// src\data\registerTranslations.js
export const translations = {
  en: {
    // General
    loading: "Loading...",
    savingButton: "Saving...",
    removeButton: "Remove",
    errorRequiredField: "This field is required.",
    errorInvalidEmail: "Please enter a valid email address.",
    errorPasswordTooShort: "Password must be at least 6 characters.",
    errorInvalidPhone: "Please enter a valid phone number.",
    errorPromptNameExists: "A bot with this name already exists.", // Example from original, might not be used here
    errorGenericSave: "Could not save. Please check details.",
    errorGenericLoad: "Could not load data.", // Example from original

    // Registration Page Specific
    registerTitle: "Create Your Account",
    languageSelector: "Language:",
    english: "English",
    hebrew: "Hebrew",

    // Steps
    stepIndicator: "Step {currentStep} of {totalSteps}",
    personalInformationLegend: "Personal Information",
    businessInformationLegend: "Business Information",
    contactPersonLegend: "Contact Person Information",

    // Labels & Placeholders
    fullNameLabel: "Full Name",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    passwordRequirements: "Password must be at least 6 characters.",

    businessNameLabel: "Business Name",
    businessEntityTypeLabel: "Business Entity Type (e.g., Ltd., Corp.)", // Original: "ח.פ/ע.מ/ע.פ"
    businessIdLabel: "Business ID / Registration Number", // Original: "מספר ח.פ/ע.מ/ע.פ" -> Image: "ח.פ / עוסק מורשה"
    companyPhoneLabel: "Company Phone",
    businessFieldLabel: "Field of Business",
    websiteLabel: "Website (Optional)",
    addressLabel: "Full Business Address", // For the business address

    contactNameLabel: "Contact Person Name",
    contactPhoneLabel: "Contact Person Phone",

    // Buttons
    nextButton: "Next",
    prevButton: "Previous",
    submitRegisterButton: "Register", // Was createButton/updateButton in prompt editor context

    // Login/Register Links (from original files)
    loginLinkText: "Login",
    registerLinkText: "Register",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
  },
  he: {
    // General
    loading: "טוען...",
    savingButton: "שומר...",
    removeButton: "הסר",
    errorRequiredField: "שדה זה הינו חובה.",
    errorInvalidEmail: "אנא הזן כתובת אימייל תקינה.",
    errorPasswordTooShort: "הסיסמה חייבת להכיל לפחות 6 תווים.",
    errorInvalidPhone: "אנא הזן מספר טלפון תקין.",
    errorPromptNameExists: "בוט בשם זה כבר קיימת.",
    errorGenericSave: "לא ניתן היה לשמור. אנא בדוק את הפרטים.",
    errorGenericLoad: "לא ניתן היה לטעון את הנתונים.",

    // Registration Page Specific
    registerTitle: "יצירת חשבון",
    languageSelector: "שפה:",
    english: "אנגלית",
    hebrew: "עברית",

    // Steps
    stepIndicator: "שלב {currentStep} מתוך {totalSteps}",
    personalInformationLegend: "פרטים אישיים",
    businessInformationLegend: "פרטים כלליים על העסק", // From image
    contactPersonLegend: "פרטי איש קשר",

    // Labels & Placeholders
    fullNameLabel: "שם מלא",
    emailLabel: "כתובת דוא״ל",
    passwordLabel: "סיסמה",
    passwordRequirements: "הסיסמה חייבת להכיל לפחות 6 תווים.",

    businessNameLabel: "שם העסק", // From image
    businessEntityTypeLabel: 'סוג עסק (למשל, חברה בע"מ, עוסק מורשה)', // "ח.פ/ע.מ/ע.פ"
    businessIdLabel: "ח.פ / עוסק מורשה", // From image, "מספר ח.פ/ע.מ/ע.פ"
    companyPhoneLabel: "טלפון של החברה", // From image "טלפון" (used for company)
    businessFieldLabel: "תחום העיסוק", // From image
    websiteLabel: "אתר אינטרנט (אם יש)", // From image
    addressLabel: "כתובת מלאה של העסק", // From image "כתובת"

    contactNameLabel: "שם איש הקשר",
    contactPhoneLabel: "טלפון של איש הקשר",

    // Buttons
    nextButton: "הבא",
    prevButton: "הקודם",
    submitRegisterButton: "הרשמה",

    // Login/Register Links
    loginLinkText: "התחבר",
    registerLinkText: "הרשמה",
    alreadyHaveAccount: "כבר יש לך חשבון?",
    dontHaveAccount: "אין לך חשבון?",
  },
};
