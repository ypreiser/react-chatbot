// src/components/Header/Header.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./Header.css"; // Assuming variables.css is globally imported or imported within Header.css
import logo from "../../assets/logoTenLow-02.jpg";
import { useLanguage } from "../../contexts/LanguageContext"; // Import useLanguage

export default function Header({ user, onLogout }) {
  const { language, setLanguage, t } = useLanguage(); // Use context

  const handleLogOut = () => {
    // Use translated confirm message if available, otherwise fallback
    const confirmMessage =
      t && typeof t === "function"
        ? t("areYouSureLogout") || "Are you sure you want to log out?"
        : "Are you sure you want to log out?";
    if (window.confirm(confirmMessage)) {
      onLogout();
    } else {
      console.log("Logout canceled");
    }
  };

  const toggleLanguage = () => {
    setLanguage((lang) => (lang === "en" ? "he" : "en"));
  };

  // Fallback for t if LanguageProvider hasn't wrapped this part of tree yet (e.g. during initial load / login screen)
  const safeT = (key, defaultText = key) =>
    t && typeof t === "function" ? t(key) || defaultText : defaultText;

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="App Logo" className="header-logo" />
        {user && ( // Only show language toggle if user is logged in and t is available
          <div className="language-toggle-header">
            <button
              onClick={toggleLanguage}
              className="language-button"
              title={safeT("languageSelectorShort", "Switch Language")}
            >
              {language === "en"
                ? safeT("hebrew", "עב")
                : safeT("english", "EN")}
            </button>
          </div>
        )}
      </div>

      <div className="header-center">
        <h1>{safeT("appTitle", "Chatbot Admin")}:</h1>
        {user && <h1>{user.name}</h1>}
      </div>

      <div className="header-right">
        {user ? (
          <nav className="nav">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              {safeT("navChatInterface", "Chat Interface")}
            </NavLink>

            <NavLink
              to="/bot-profile" // Updated route
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              {safeT("navBotSettings", "Bot Settings")}
            </NavLink>

            <NavLink
              to="/whatsapp"
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              {safeT("navWhatsapp", "WhatsApp")}
            </NavLink>

            <NavLink
              to="/chats"
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              {safeT("navChatHistory", "Chat History")}
            </NavLink>

            {user.privilegeLevel === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                {safeT("navAdminDashboard", "Admin Dashboard")}
              </NavLink>
            )}

            <a href="#" onClick={handleLogOut} className="logout-link">
              {" "}
              {/* Changed to <a> for simpler styling without NavLink active state */}
              {safeT("navLogout", "Logout")}
            </a>
          </nav>
        ) : (
          <div className="logged-out-message">
            {/* Optionally, show something if user is not logged in, or nothing */}
          </div>
        )}
      </div>
    </header>
  );
}
