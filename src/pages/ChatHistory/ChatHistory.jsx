//react-chatbot2/src/pages/ChatHistory/ChatHistory.jsx
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../constants/api";
import { FaSpinner } from "react-icons/fa";

import "./ChatHistory.css";

function ChatHistory({ user, isAdmin }) {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [error, setError] = useState("");
  const [listloading, setListLoading] = useState(false);
  const [chatloading, setChatLoading] = useState(false);

  useEffect(() => {
    setListLoading(true);
    fetch(`${API_BASE_URL}/chats`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch chats");
        return res.json();
      })
      .then((data) => setChats(data.chats))
      .catch((err) => setError(err.message))
      .finally(() => setListLoading(false));
  }, []);

  const handleChatClick = (chatId) => {
    setChatLoading(true);
    fetch(`${API_BASE_URL}/chats/${chatId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch chat");
        return res.json();
      })
      .then((data) => setSelectedChat(data.chat))
      .catch((err) => setError(err.message))
      .finally(() => setChatLoading(false));
  };

  return (
    <div className="chat-history">
      <h2>{isAdmin ? "All Chats" : "My Chats"}</h2>
      {error && <div className="error">{error}</div>}
      <div className="chat-main-layout">
        <div className="chat-list-panel">
          {listloading && (
            <div className="loading-indicator">
              <FaSpinner className="spinner" /> Loading...
            </div>
          )}
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
                <tr
                  key={chat._id}
                  className={
                    selectedChat && selectedChat._id === chat._id
                      ? "selected-row"
                      : ""
                  }
                >
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
          <div className="chat-detail-panel">
            <h3>Chat Detail</h3>
            {chatloading && (
              <div className="loading-indicator">
                <FaSpinner className="spinner" /> Loading...
              </div>
            )}
            <div>Session: {selectedChat.sessionId}</div>
            <div>
              User:{" "}
              {selectedChat.userId?.name || selectedChat.userId?.email || "Me"}
            </div>
            <div>Source: {selectedChat.source}</div>
            <div>Messages:</div>
            <ul className="chat-history-messages">
              {selectedChat.messages.map((msg) => (
                <li
                  key={msg._id}
                  className={`history-message-bubble ${msg.role}`}
                >
                  <div className="history-message-content">
                    {/* Render text or array parts */}
                    {Array.isArray(msg.content)
                      ? msg.content.map((part, i) => {
                          if (part.type === "text") {
                            return <span key={i}>{part.text}</span>;
                          } else if (
                            part.type === "image" &&
                            typeof part.image === "string"
                          ) {
                            return (
                              <img
                                key={i}
                                src={part.image}
                                alt={
                                  part.filename ||
                                  part.originalName ||
                                  "attached image"
                                }
                                className="attachment-img"
                                style={{
                                  maxWidth: 200,
                                  maxHeight: 200,
                                  margin: "6px 0",
                                }}
                              />
                            );
                          } else if (
                            part.type === "file" &&
                            typeof part.data === "string"
                          ) {
                            return (
                              <a
                                key={i}
                                href={part.data}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="attachment-link"
                                download={part.filename}
                              >
                                {part.filename ||
                                  part.originalName ||
                                  "Attached File"}
                              </a>
                            );
                          } else {
                            const attName =
                              part.filename ||
                              part.originalName ||
                              "unknown file";
                            return (
                              <span key={i}>[Unsupported: {attName}]</span>
                            );
                          }
                        })
                      : typeof msg.content === "object" && msg.content !== null
                      ? msg.content.text
                      : msg.content}
                    <span style={{ color: "#888", marginLeft: 8 }}>
                      ({new Date(msg.timestamp).toLocaleString()})
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatHistory;
