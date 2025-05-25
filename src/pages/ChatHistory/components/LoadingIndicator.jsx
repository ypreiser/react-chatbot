// src\pages\ChatHistory\components\LoadingIndicator.jsx
import React from "react"; // Added React import
import SpinnerIcon from "../../../components/Icons/SpinnerIcon"; // Import custom spinner
import styles from "./LoadingIndicator.module.css";

const LoadingIndicator = ({ text = "Loading..." }) => {
  return (
    <div className={styles.loadingIndicator}>
      <SpinnerIcon className={styles.spinner} size="1.5rem" color="#3182ce" />{" "}
      {/* Use SpinnerIcon */}
      {text}
    </div>
  );
};

export default LoadingIndicator;
