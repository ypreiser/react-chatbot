import React from "react";
import { FaSpinner } from "react-icons/fa";
import styles from "./LoadingIndicator.module.css";

const LoadingIndicator = ({ text = "Loading..." }) => {
  return (
    <div className={styles.loadingIndicator}>
      <FaSpinner className={styles.spinner} /> {text}
    </div>
  );
};

export default LoadingIndicator;
