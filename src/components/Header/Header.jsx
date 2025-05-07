import React from "react";
import "./Header.css"; // Import local CSS
import logo from "../../assets/logoTenLow-02.jpg"; // Correct path relative to src

export default function Header() {
  return (
    <header className="header"> {/* Use semantic <header> tag */}
      {/* Logo should be in src/assets */}
      <img src={logo} alt="App Logo" className="header-logo" /> {/* Added logo */}
      <h1>Chatbot Admin</h1> {/* More descriptive title for header */}
      <nav className="nav"> {/* Use semantic <nav> tag */}
        <a href="/">Chat Interface</a> 
        <a href="/system">System Prompt Editor</a> 
        <a href="/whatsapp">WhatsApp Connection</a> 
      </nav>
    </header>
  );
}
