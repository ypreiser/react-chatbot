// src\components\Icons\TimesIcon.jsx
import React from "react";

/**
 * Times (Close) Icon SVG.
 * @param {object} props - Component props.
 * @param {string} [props.size='24px'] - The size of the icon.
 * @param {string} [props.color='currentColor'] - The color of the icon.
 * @param {number} [props.strokeWidth=2] - The stroke width of the icon lines.
 * @param {string} [props.className] - Additional CSS classes.
 */
const TimesIcon = ({
  size = "24px",
  color = "currentColor",
  strokeWidth = 2.5, // Slightly thicker for better visibility
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true" // Decorative icon
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default TimesIcon;
