// src\App.jsx
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "./constants/api";
import { Routes, Route, useNavigate } from "react-router-dom";
import ChatInterface from "./pages/ChatInterface/ChatInterface";
// import SystemPromptForm from "./pages/SystemPromptForm/SystemPromptForm"; // Old
import BotProfileForm from "./pages/BotProfileForm/BotProfileForm"; // New
import WhatsappPage from "./pages/Whatsapp/WhatsappPage";
import Header from "./components/Header/Header";
import NotFoundPage from "./pages/NotFound/NotFound";
import Login from "./pages/Login/LoginPage";
import Register from "./pages/Login/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import ChatHistory from "./pages/ChatHistory/ChatHistory";
import { LanguageProvider } from "./contexts/LanguageContext.jsx";

// axios import was here, assuming it's used elsewhere or can be removed if not used in App.jsx directly
// import axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  const [justLoggedOut, setJustLoggedOut] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    setJustLoggedOut(false);
    navigate("/"); // Or to a dashboard
  };

  const handleLogout = () => {
    // Clear tokens, cookies, etc.
    localStorage.clear(); // Example
    document.cookie.split(";").forEach((c) => {
      // Enhanced cookie clearing
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    setUser(null);
    setJustLoggedOut(true);
    navigate("/login");
  };

  useEffect(() => {
    if (!user && !justLoggedOut) {
      fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" })
        .then((res) => {
          if (res.ok) return res.json();
          // If !res.ok, don't try to parse as JSON if it's an error page,
          // and don't set user.
          return null;
        })
        .then((data) => {
          if (data && data.user) {
            setUser(data.user);
          } else {
            // No user or error, ensure navigation to login if not already there
            // and not on public pages. Handled by the route protection below.
          }
        })
        .catch((err) => {
          console.error("Error fetching /auth/me:", err);
          // Potentially navigate to login or show error
        });
    }
  }, [user, justLoggedOut, navigate]); // Added navigate to dependencies

  // Routes for non-authenticated users
  if (!user) {
    return (
      <LanguageProvider>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          {/* Redirect all other paths to login if not authenticated */}
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </LanguageProvider>
    );
  }

  // Routes for authenticated users
  return (
    <LanguageProvider>
      <>
        <Header user={user} onLogout={handleLogout} />
        <main className="app-main-content">
          {" "}
          {/* Added a class for potential global main styling */}
          <Routes>
            <Route path="/" element={<ChatInterface user={user} />} />
            <Route
              path="/bot-profile" // Updated route
              element={<BotProfileForm user={user} />} // Pass user prop
            />
            <Route
              path="/bot-profile/:profileId"
              element={<BotProfileForm user={user} />}
            />{" "}
            {/* For editing specific profile by ID */}
            <Route path="/whatsapp" element={<WhatsappPage user={user} />} />
            {user.privilegeLevel === "admin" && ( // Guard admin route
              <Route path="/admin" element={<AdminDashboard user={user} />} />
            )}
            <Route
              path="/chats"
              element={
                <ChatHistory
                  user={user}
                  isAdmin={user.privilegeLevel === "admin"}
                />
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </>
    </LanguageProvider>
  );
}

export default App;
