//react-chatbot2/src/pages/Login/RegisterPage.jsx
import React, { useState } from "react";
import axios from "axios";
import "./LoginPage.css";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../constants/api";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(
        `${API_BASE_URL}/auth/register`,
        { email, password, name },
        { withCredentials: true }
      );
      setSuccess("Registration successful! You can now log in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
        <h2>Register</h2>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="login-error">{error}</div>}
        {success && (
          <div style={{ color: "green", marginBottom: 10 }}>{success}</div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
        <div style={{ marginTop: 10, textAlign: "center" }}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
