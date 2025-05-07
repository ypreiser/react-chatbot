import React from "react";
import ChatInterface from "./pages/ChatInterface/ChatInterface";
import SystemPromptForm from "./pages/SystemPromptForm/SystemPromptForm";
import WhatsappPage from "./pages/Whatsapp/WhatsappPage";
import Header from "./components/Header/Header";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<ChatInterface />} />
        <Route path="/system" element={<SystemPromptForm />} />
        <Route path="/whatsapp" element={<WhatsappPage />} />
      </Routes>
    </>
  );
}

export default App;
