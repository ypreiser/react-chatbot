export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

if (!import.meta.env.VITE_API_BASE_URL) {
    console.warn("VITE_API_BASE_URL is not set in .env file. Falling back to '/api'. Ensure your build setup or proxy handles this correctly.");
}

