// src\components\Header\Header.jsx
//react-chatbot2/src/components/Header/Header.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/logoTenLow-02.jpg";

export default function Header({ user, onLogout }) {
  const handleLogOut = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      onLogout();
    } else {
      console.log("Logout canceled");
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="App Logo" className="header-logo" />
      </div>

      <div className="header-center">
        <h1>Chatbot Admin:</h1>
        <h1>{user.name}</h1>
      </div>

      <div className="header-right">
        <nav className="nav">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Chat Interface
          </NavLink>

          <NavLink
            to="/chat-settings"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Bot Settings
          </NavLink>

          <NavLink
            to="/whatsapp"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            WhatsApp
          </NavLink>

          <NavLink
            to="/chats"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Chat History
          </NavLink>

          {user.privilegeLevel === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              Admin Dashboard
            </NavLink>
          )}

          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? "active-link" : "")}
            onClick={handleLogOut}
          >
            Logout
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
