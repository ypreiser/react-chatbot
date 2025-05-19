//react-chatbot2/src/constants/api.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
export const API_CHAT_URL = import.meta.env.VITE_API_CHAT_URL || "/chat";

if (
  !import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL === ""
) {
  console.warn(
    "VITE_API_BASE_URL is not set in .env file. Falling back to '/api'. Ensure your build setup or proxy handles this correctly."
  );
}
