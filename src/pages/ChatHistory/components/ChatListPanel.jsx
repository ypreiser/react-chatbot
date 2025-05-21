// src\pages\ChatHistory\components\ChatListPanel.jsx
import React from "react";
import LoadingIndicator from "./LoadingIndicator";
import styles from "./ChatListPanel.module.css";

const ChatListPanel = ({
  chats,
  selectedChat,
  handleChatClick,
  listLoading,
  showList,
  formatDate,
  truncateText,
  getMessageCount,
}) => {
  return (
    <div
      className={`${styles.chatListPanel} ${
        !showList ? styles.mobileHidden : ""
      }`}
    >
      {listLoading && <LoadingIndicator />}

      <div className={styles.tableContainer}>
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
                    ? styles.selectedRow
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
                  <div style={{ display: "flex", gap: "5px" }}>
                    <button
                      style={{
                        background: "#3182ce",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        padding: "0.3rem 0.8rem",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        console.log(
                          "View button clicked for chat ID:",
                          chat._id
                        );
                        handleChatClick(chat._id);
                      }}
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChatListPanel;
