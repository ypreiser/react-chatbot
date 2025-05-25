// src\pages\ChatHistory\components\MobileControls.jsx
import React from "react";
import ListIcon from "../../../components/Icons/ListIcon"; // Import custom ListIcon
import CommentsIcon from "../../../components/Icons/CommentsIcon"; // Import custom CommentsIcon
import styles from "./MobileControls.module.css";

const MobileControls = ({ selectedChat, toggleView }) => {
  return (
    <div className={styles.mobileControls}>
      {selectedChat ? (
        <button
          className={styles.mobileToggle}
          onClick={() => toggleView("list")}
        >
          <ListIcon size="1em" style={{ marginRight: "8px" }} /> Show Chat List{" "}
          {/* Use ListIcon */}
        </button>
      ) : (
        // This button is currently styled with display: none inline,
        // consider if it should be conditionally rendered instead for cleaner DOM.
        // For now, sticking to original logic.
        <button className={styles.mobileToggle} style={{ display: "none" }}>
          <CommentsIcon size="1em" style={{ marginRight: "8px" }} /> Show Chat
          Detail {/* Use CommentsIcon */}
        </button>
      )}
    </div>
  );
};

export default MobileControls;
