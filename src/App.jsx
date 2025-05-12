import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ChatInterface from "./pages/ChatInterface/ChatInterface";
import SystemPromptForm from "./pages/SystemPromptForm/SystemPromptForm";
import WhatsappPage from "./pages/Whatsapp/WhatsappPage";
import Header from "./components/Header/Header";
import NotFoundPage from "./pages/NotFound/NotFound";
import Login from "./pages/Login/LoginPage";
import Register from "./pages/Login/RegisterPage";
import axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    navigate("/");
  };

  // Optionally, add logic to check authentication status on mount
  // e.g., useEffect(() => { ... }, [])

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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
