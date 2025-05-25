// src\App.jsx
//react-chatbot2/src/App.jsx
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "./constants/api";
import { Routes, Route, useNavigate } from "react-router-dom";
import ChatInterface from "./pages/ChatInterface/ChatInterface";
import SystemPromptForm from "./pages/SystemPromptForm/SystemPromptForm";
import WhatsappPage from "./pages/Whatsapp/WhatsappPage";
import Header from "./components/Header/Header";
import NotFoundPage from "./pages/NotFound/NotFound";
import Login from "./pages/Login/LoginPage";
import Register from "./pages/Login/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import ChatHistory from "./pages/ChatHistory/ChatHistory";
import { LanguageProvider } from "./contexts/LanguageContext.jsx";

import axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  const [justLoggedOut, setJustLoggedOut] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    setJustLoggedOut(false);
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=" +
      window.location.pathname +
      ";";
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie =
        name.trim() + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    });
    setUser(null);
    setJustLoggedOut(true);
    navigate("/login");
  };

  useEffect(() => {
    if (!user && !justLoggedOut) {
      fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.user) setUser(data.user);
          console.log("User data fetched:", data);
        });
    }
  }, [user, justLoggedOut]);

  if (!user) {
    return (
      <LanguageProvider>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <>
        <Header user={user} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={<ChatInterface user={user} />} />
            <Route path="/system" element={<SystemPromptForm user={user} />} />
            <Route path="/whatsapp" element={<WhatsappPage user={user} />} />
            <Route path="/admin" element={<AdminDashboard user={user} />} />
            <Route
              path="/chats"
              element={
                <ChatHistory
                  user={user}
                  isAdmin={user.privlegeLevel === "admin"}
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
