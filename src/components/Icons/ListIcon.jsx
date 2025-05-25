// src\components\Icons\ListIcon.jsx
import React from "react";

/**
 * List (Hamburger) Icon SVG.
 * @param {object} props - Component props.
 * @param {string} [props.size='24px'] - The size of the icon.
 * @param {string} [props.color='currentColor'] - The color of the icon.
 * @param {number} [props.strokeWidth=2] - The stroke width of the icon lines.
 * @param {string} [props.className] - Additional CSS classes.
 */
const ListIcon = ({
  size = "24px",
  color = "currentColor",
  strokeWidth = 2,
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
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

export default ListIcon;
