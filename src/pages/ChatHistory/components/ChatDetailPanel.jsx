// src\pages\ChatHistory\components\ChatDetailPanel.jsx
import React from "react"; // Added React import
// Removed FaList, FaSpinner, FaTimes from react-icons
import LoadingIndicator from "./LoadingIndicator";
import MessageBubble from "./MessageBubble";
import TimesIcon from "../../../components/Icons/TimesIcon"; // Import custom TimesIcon
import ListIcon from "../../../components/Icons/ListIcon"; // Import custom ListIcon
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
      <div className={styles.panelHeader}>
        <h3 className={styles.title}>Chat Detail</h3>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close chat detail"
        >
          <TimesIcon size="18px" />{" "}
          {/* Use TimesIcon, adjusted size for button */}
        </button>
      </div>

      {chatLoading && <LoadingIndicator />}

      <div className={styles.chatDetailHeader}>
        <div className={styles.headerItem}>
          <strong className={styles.headerLabel}>Session:</strong>
          <span className={styles.headerValue}>{selectedChat.sessionId}</span>
        </div>
        <div className={styles.headerItem}>
          <strong className={styles.headerLabel}>User:</strong>
          <span className={styles.headerValue}>
            {selectedChat.userId?.name || selectedChat.userId?.email || "Me"}
          </span>
        </div>
        <div className={styles.headerItem}>
          <strong className={styles.headerLabel}>Source:</strong>
          <span className={styles.headerValue}>{selectedChat.source}</span>
        </div>
        <div className={styles.headerItem}>
          <strong className={styles.headerLabel}>Bot:</strong>
          <span className={styles.headerValue}>
            {selectedChat.systemPromptName || "-"}
          </span>
        </div>
      </div>

      <h4 className={styles.messagesTitle}>Messages</h4>
      <ul className={styles.chatHistoryMessages}>
        {selectedChat.messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} formatDate={formatDate} />
        ))}
      </ul>

      {typeof window !== "undefined" && window.innerWidth < 768 && (
        <button
          className={styles.mobileToggle}
          onClick={() => toggleView("list")}
        >
          <ListIcon size="1em" style={{ marginRight: "8px" }} /> Back to Chat
          List {/* Use ListIcon */}
        </button>
      )}
    </div>
  );
};

export default ChatDetailPanel;
