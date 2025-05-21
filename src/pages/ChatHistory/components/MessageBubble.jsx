import React from "react";
import styles from "./MessageBubble.module.css";

const MessageBubble = ({ message, formatDate }) => {
  const { role, content, timestamp } = message;

  const renderMessageContent = () => {
    if (Array.isArray(content)) {
      return content.map((part, i) => {
        if (part.type === "text") {
          return <span key={i}>{part.text}</span>;
        } else if (part.type === "image" && typeof part.image === "string") {
          return (
            <img
              key={i}
              src={part.image}
              alt={part.filename || part.originalName || "attached image"}
              className={styles.attachmentImg}
            />
          );
        } else if (part.type === "file" && typeof part.data === "string") {
          return (
            <a
              key={i}
              href={part.data}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.attachmentLink}
              download={part.filename}
            >
              {part.filename || part.originalName || "Attached File"}
            </a>
          );
        } else {
          const attName = part.filename || part.originalName || "unknown file";
          return <span key={i}>[Unsupported: {attName}]</span>;
        }
      });
    } else if (typeof content === "object" && content !== null) {
      return content.text;
    } else {
      return content;
    }
  };

  return (
    <li className={`${styles.messageBubble} ${styles[role]}`}>
      <div className={styles.messageContent}>
        {renderMessageContent()}
        <span className={styles.messageTimestamp}>
          {formatDate(timestamp)}
        </span>
      </div>
    </li>
  );
};

export default MessageBubble;
