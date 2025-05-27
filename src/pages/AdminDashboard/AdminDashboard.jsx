// src\pages\AdminDashboard\AdminDashboard.jsx
//react-chatbot2/src/pages/AdminDashboard/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../constants/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/users`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or failed to fetch users");
        return res.json();
      })
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message));
  }, []);

  const handleUserClick = (userId) => {
    setSelectedUser(userId);
    setPrompts([]);
    setError("");
    fetch(
      `${API_BASE_URL}/admin/user/${userId}
      `,
      {
        credentials: "include",
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch bots");
        return res.json();
      })
      .then((data) => setPrompts(data.prompts))
      .catch((err) => setError(err.message));
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      {error && <div className="error">{error}</div>}
      <div className="user-list">
        <h2>Users</h2>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Privilege</th>
              <th>Lifetime Tokens</th>
              <th>Monthly Usage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id || user.userId}>
                <td>{user.email}</td>
                <td>{user.name}</td>
                <td>{user.privlegeLevel}</td>
                <td>{user.totalLifetimeTokens}</td>
                <td>
                  {user.monthlyTokenUsageHistory &&
                    Object.entries(user.monthlyTokenUsageHistory).map(
                      ([month, usage]) => (
                        <div key={month}>
                          {month}: {usage.totalTokens} tokens
                        </div>
                      )
                    )}
                </td>
                <td>
                  <button
                    onClick={() => handleUserClick(user._id || user.userId)}
                  >
                    View Bots
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedUser && (
        <div className="prompt-list">
          <h2>Bots for User</h2>
          {prompts.length === 0 ? (
            <div>No bots found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Identity</th>
                  <th>Tokens Used</th>
                  <th>Last Used</th>
                </tr>
              </thead>
              <tbody>
                {prompts.map((prompt) => (
                  <tr key={prompt._id}>
                    <td>{prompt.name}</td>
                    <td>{prompt.identity}</td>
                    <td>{prompt.totalTokensUsed}</td>
                    <td>
                      {prompt.lastUsedAt
                        ? new Date(prompt.lastUsedAt).toLocaleString()
                        : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
