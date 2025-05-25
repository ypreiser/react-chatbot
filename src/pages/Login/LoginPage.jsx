// src\pages\Login\LoginPage.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../constants/api";
import "./LoginPage.css"; // Shared CSS file

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Ref for the error message to manage focus on error
  const errorRef = useRef(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus(); // Focus the error message for screen readers
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      if (res.data.user) {
        onLogin(res.data.user);
      } else {
        // Handle cases where user might not be in response, though API should be consistent
        setError("Login failed. Unexpected response from server.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        "Login failed. Please check your credentials and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page-container login-container" id="main-content">
      {/* Added login-container for backward compatibility if some styles were specific */}
      <form
        className="auth-form login-form" // Added auth-form for new styles, login-form for backward compatibility
        onSubmit={handleSubmit}
        noValidate // Disable browser's default validation, we handle it
        aria-labelledby="login-title"
      >
        <h2 id="login-title">Login</h2>

        {error && (
          <div
            className="form-message form-error-message login-error" // Use new classes, keep old for compatibility
            role="alert" // Announce errors to screen readers
            aria-live="assertive" // Ensures immediate announcement of the error
            ref={errorRef}
            tabIndex={-1} // Make it focusable programmatically
          >
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            autoComplete="email"
            aria-describedby={error ? "login-error-message" : undefined} // if we had field specific errors
            aria-invalid={!!error} // A general error makes the form potentially invalid
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            aria-describedby={error ? "login-error-message" : undefined}
            aria-invalid={!!error}
          />
        </div>

        <button type="submit" disabled={loading} aria-busy={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div
          className="form-footer-link"
          style={{ marginTop: "calc(var(--spacing-unit) * 4)" }}
        >
          {"Don't have an account? "}
          <Link to="/register">Register</Link>
        </div>
      </form>
    </main>
  );
};

export default Login;
