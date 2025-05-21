//react-chatbot2/src/pages/ChatHistory/ChatHistory.jsx
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../constants/api";
import { FaSpinner, FaList, FaComments } from "react-icons/fa";

import "./ChatHistory.css";

function ChatHistory({ user, isAdmin }) {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [error, setError] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [showList, setShowList] = useState(true);
  const [showDetail, setShowDetail] = useState(false);

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

  // Helper to get message count for a chat (if available)
  const getMessageCount = (chat) =>
    typeof chat.messageCount === "number"
      ? chat.messageCount
      : chat.messages
      ? chat.messages.length
      : 0;

  const handleChatClick = (chatId) => {
    setChatLoading(true);
    // For mobile view, hide list and show detail
    if (window.innerWidth < 768) {
      setShowList(false);
      setShowDetail(true);
    }

    fetch(`${API_BASE_URL}/chats/${chatId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch chat");
        return res.json();
      })
      .then((data) => setSelectedChat(data.chat))
      .catch((err) => setError(err.message))
      .finally(() => setChatLoading(false));
  };

  const toggleView = (view) => {
    if (view === "list") {
      setShowList(true);
      setShowDetail(false);
    } else if (view === "detail") {
      setShowList(false);
      setShowDetail(true);
    }
  };

  // Format date with shorter output on mobile
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (window.innerWidth < 768) {
      return date.toLocaleDateString();
    }
    return date.toLocaleString();
  };

  // Render truncated text with ellipsis
  const truncateText = (text, maxLength = 20) => {
    if (!text) return "-";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <div className="chat-history">
      <h2>{isAdmin ? "All Chats" : "My Chats"}</h2>
      {error && <div className="error">{error}</div>}

      {/* Mobile view controls */}
      {selectedChat && (
        <div className="mobile-controls">
          <button className="mobile-toggle" onClick={() => toggleView("list")}>
            <FaList style={{ marginRight: "8px" }} /> Show Chat List
          </button>
        </div>
      )}

      {!selectedChat && (
        <div className="mobile-controls">
          <button className="mobile-toggle" style={{ display: "none" }}>
            <FaComments style={{ marginRight: "8px" }} /> Show Chat Detail
          </button>
        </div>
      )}

      <div className="chat-main-layout">
        <div className={`chat-list-panel ${!showList ? "mobile-hidden" : ""}`}>
          {listLoading && (
            <div className="loading-indicator">
              <FaSpinner className="spinner" /> Loading...
            </div>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Session</th>
                  <th>User</th>
                  <th>Source</th>
                  <th>System Prompt</th>
                  <th>Last Active</th>
                  <th>Messages</th>
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
                    <td>{truncateText(chat.sessionId, 10)}</td>
                    <td>
                      {truncateText(
                        chat.userId?.name || chat.userId?.email || "Me",
                        15
                      )}
                    </td>
                    <td>{truncateText(chat.source, 12)}</td>
                    <td>{truncateText(chat.systemPromptName, 15) || "-"}</td>
                    <td>{formatDate(chat.updatedAt)}</td>
                    <td>{getMessageCount(chat)}</td>
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
        </div>

        {selectedChat && (
          <div
            className={`chat-detail-panel ${
              !showDetail ? "mobile-hidden" : ""
            }`}
          >
            <h3>Chat Detail</h3>
            <button
              className="close-button"
              onClick={() => {
                setSelectedChat(null);
                setShowList(true);
                setShowDetail(false);
              }}
            >
              X
            </button>

            {chatLoading && (
              <div className="loading-indicator">
                <FaSpinner className="spinner" /> Loading...
              </div>
            )}

            <div className="chat-detail-header">
              <div>
                <strong>Session:</strong> {selectedChat.sessionId}
              </div>
              <div>
                <strong>User:</strong>{" "}
                {selectedChat.userId?.name ||
                  selectedChat.userId?.email ||
                  "Me"}
              </div>
              <div>
                <strong>Source:</strong> {selectedChat.source}
              </div>
              <div>
                <strong>System Prompt:</strong>{" "}
                {selectedChat.systemPromptName || "-"}
              </div>
            </div>

            <div>
              <strong>Messages:</strong>
            </div>
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
                    <span className="message-timestamp">
                      {formatDate(msg.timestamp)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Mobile back button */}
            {window.innerWidth < 768 && (
              <button
                className="mobile-toggle"
                onClick={() => toggleView("list")}
                style={{ marginTop: "1.5rem" }}
              >
                <FaList style={{ marginRight: "8px" }} /> Back to Chat List
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatHistory;
