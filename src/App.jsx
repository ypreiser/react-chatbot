import React from "react";
import { Routes, Route } from "react-router-dom";
import ChatInterface from "./pages/ChatInterface/ChatInterface";
import SystemPromptForm from "./pages/SystemPromptForm/SystemPromptForm";
import WhatsappPage from "./pages/Whatsapp/WhatsappPage";
import Header from "./components/Header/Header";
import NotFoundPage from "./pages/NotFound/NotFound";

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<ChatInterface />} />
          <Route path="/system" element={<SystemPromptForm />} />
          <Route path="/whatsapp" element={<WhatsappPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;