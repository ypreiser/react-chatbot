// src\components\Icons\SpinnerIcon.jsx
import React from "react";

/**
 * Spinner Icon SVG for loading states.
 * Animation should be applied via CSS.
 * @param {object} props - Component props.
 * @param {string} [props.size='24px'] - The size of the icon.
 * @param {string} [props.color='currentColor'] - The color of the icon.
 * @param {number} [props.strokeWidth=2.5] - The stroke width of the icon.
 * @param {string} [props.className] - Additional CSS classes for styling (e.g., animation).
 */
const SpinnerIcon = ({
  size = "24px",
  color = "currentColor",
  strokeWidth = 2.5,
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
    {/* Simple circle path for spinner, the animation will make it look like a spinner */}
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default SpinnerIcon;
