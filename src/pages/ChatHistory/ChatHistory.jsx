import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../constants/api";

import "./ChatHistory.css";

function ChatHistory({ user, isAdmin }) {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/chats`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch chats");
        return res.json();
      })
      .then((data) => setChats(data.chats))
      .catch((err) => setError(err.message));
  }, []);

  const handleChatClick = (chatId) => {
    fetch(`${API_BASE_URL}/chats/${chatId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch chat");
        return res.json();
      })
      .then((data) => setSelectedChat(data.chat))
      .catch((err) => setError(err.message));
  };

  return (
    <div className="chat-history">
      <h2>{isAdmin ? "All Chats" : "My Chats"}</h2>
      {error && <div className="error">{error}</div>}
      <div className="chat-list">
        <table>
          <thead>
            <tr>
              <th>Session</th>
              <th>User</th>
              <th>Source</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {chats.map((chat) => (
              <tr key={chat._id}>
                <td>{chat.sessionId}</td>
                <td>{chat.userId?.name || chat.userId?.email || "Me"}</td>
                <td>{chat.source}</td>
                <td>{new Date(chat.updatedAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleChatClick(chat._id)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedChat && (
        <div className="chat-detail">
          <h3>Chat Detail</h3>
          <div>Session: {selectedChat.sessionId}</div>
          <div>
            User:{" "}
            {selectedChat.userId?.name || selectedChat.userId?.email || "Me"}
          </div>
          <div>Source: {selectedChat.source}</div>
          <div>Messages:</div>
          <ul>
            {selectedChat.messages.map((msg) => (
              <li key={msg._id}>
                <b>{msg.role}:</b> {msg.content}{" "}
                <span style={{ color: "#888" }}>
                  ({new Date(msg.timestamp).toLocaleString()})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ChatHistory;
