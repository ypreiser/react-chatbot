// src\pages\Login\RegisterPage.jsx
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
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessIdNumber, setBusinessIdNumber] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [businessField, setBusinessField] = useState("");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(
        `${API_BASE_URL}/auth/register`,
        {
          email,
          password,
          name,
          businessName,
          businessType,
          businessIdNumber,
          companyPhone,
          businessField,
          website,
          contactName,
          contactPhone,
        },
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
        <label htmlFor="businessName">שם העסק</label>
        <input
          id="businessName"
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />
        <label htmlFor="businessType">ח.פ/ע.מ/ע.פ</label>
        <input
          id="businessType"
          type="text"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          required
        />
        <label htmlFor="businessIdNumber">מספר ח.פ/ע.מ/ע.פ</label>
        <input
          id="businessIdNumber"
          type="text"
          value={businessIdNumber}
          onChange={(e) => setBusinessIdNumber(e.target.value)}
          required
        />
        <label htmlFor="companyPhone">מספר טלפון של החברה</label>
        <input
          id="companyPhone"
          type="tel"
          value={companyPhone}
          onChange={(e) => setCompanyPhone(e.target.value)}
          required
        />
        <label htmlFor="businessField">תחום העסק</label>
        <input
          id="businessField"
          type="text"
          value={businessField}
          onChange={(e) => setBusinessField(e.target.value)}
          required
        />
        <label htmlFor="website">כתובת אתר אינטרנט (אם יש)</label>
        <input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
        <label htmlFor="contactName">שם איש הקשר</label>
        <input
          id="contactName"
          type="text"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          required
        />
        <label htmlFor="contactPhone">מספר טלפון של איש הקשר</label>
        <input
          id="contactPhone"
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
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
