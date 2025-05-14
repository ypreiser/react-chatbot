import React from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/logoTenLow-02.jpg";

export default function Header({ user }) {
  const handleLogOut = () => {
    window.confirm("Are you sure you want to log out?");
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/login";
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
