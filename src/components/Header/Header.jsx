import React from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/logoTenLow-02.jpg";

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="App Logo" className="header-logo" />
        <h1>Chatbot Admin</h1>
      </div>
      <nav className="nav">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          Chat Interface
        </NavLink>
        <NavLink
          to="/system"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          System Prompts
        </NavLink>
        <NavLink
          to="/whatsapp"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          WhatsApp
        </NavLink>
      </nav>
    </header>
  );
}