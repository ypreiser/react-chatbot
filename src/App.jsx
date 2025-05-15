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
import axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    navigate("/");
  };

  useEffect(() => {
    if (!user) {
      fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.user) setUser(data.user);
          console.log("User data fetched:", data);
        });
    }
  }, [user]);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login onLogin={handleLogin} />} />
      </Routes>
    );
  }

  return (
    <>
      <Header user={user} />
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
  );
}

export default App;
