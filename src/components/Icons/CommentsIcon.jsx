// src/components/Icons/CommentsIcon.jsx
import React from "react";

/**
 * Comments (Speech Bubble) Icon SVG.
 * @param {object} props - Component props.
 * @param {string} [props.size='24px'] - The size of the icon.
 * @param {string} [props.color='currentColor'] - The fill color of the icon.
 * @param {string} [props.className] - Additional CSS classes.
 */
const CommentsIcon = ({ size = "24px", color = "currentColor", className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color} // This icon is typically filled
    stroke="none" // No stroke for a solid fill, or can be 'currentColor' with adjusted path
    className={className}
    aria-hidden="true" // Decorative icon
  >
    <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
    {/* Alternative outlined path:
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path> 
    If using outlined, set fill="none" and stroke={color}
    */}
  </svg>
);

export default CommentsIcon;
