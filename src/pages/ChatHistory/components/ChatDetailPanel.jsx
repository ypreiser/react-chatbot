// src\pages\ChatHistory\components\ChatDetailPanel.jsx
import React from "react";
import { FaList, FaSpinner } from "react-icons/fa";
import LoadingIndicator from "./LoadingIndicator";
import MessageBubble from "./MessageBubble";
import styles from "./ChatDetailPanel.module.css";

const ChatDetailPanel = ({
  selectedChat,
  chatLoading,
  showDetail,
  formatDate,
  toggleView,
  onClose,
}) => {
  if (!selectedChat) return null;

  return (
    <div
      className={`${styles.chatDetailPanel} ${
        !showDetail ? styles.mobileHidden : ""
      }`}
    >
      <h3 className={styles.title}>Chat Detail</h3>
      <button className={styles.closeButton} onClick={onClose}>
        X
      </button>

      {chatLoading && <LoadingIndicator />}

      <div className={styles.chatDetailHeader}>
        <div>
          <strong>Session:</strong> {selectedChat.sessionId}
        </div>
        <div>
          <strong>User:</strong>{" "}
          {selectedChat.userId?.name || selectedChat.userId?.email || "Me"}
        </div>
        <div>
          <strong>Source:</strong> {selectedChat.source}
        </div>
        <div>
          <strong>System Prompt:</strong> {selectedChat.systemPromptName || "-"}
        </div>
      </div>

      <div>
        <strong>Messages:</strong>
      </div>
      <ul className={styles.chatHistoryMessages}>
        {selectedChat.messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} formatDate={formatDate} />
        ))}
      </ul>

      {/* Mobile back button */}
      {window.innerWidth < 768 && (
        <button
          className={styles.mobileToggle}
          onClick={() => toggleView("list")}
          style={{ marginTop: "1.5rem" }}
        >
          <FaList style={{ marginRight: "8px" }} /> Back to Chat List
        </button>
      )}
    </div>
  );
};

export default ChatDetailPanel;
