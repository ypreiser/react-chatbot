import React from "react";
import { FaList, FaComments } from "react-icons/fa";
import styles from "./MobileControls.module.css";

const MobileControls = ({ selectedChat, toggleView }) => {
  return (
    <div className={styles.mobileControls}>
      {selectedChat ? (
        <button className={styles.mobileToggle} onClick={() => toggleView("list")}>
          <FaList style={{ marginRight: "8px" }} /> Show Chat List
        </button>
      ) : (
        <button className={styles.mobileToggle} style={{ display: "none" }}>
          <FaComments style={{ marginRight: "8px" }} /> Show Chat Detail
        </button>
      )}
    </div>
  );
};

export default MobileControls;
