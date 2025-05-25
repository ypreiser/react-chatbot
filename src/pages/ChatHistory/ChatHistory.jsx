// src\pages\ChatHistory\ChatHistory.jsx
//react-chatbot2/src/pages/ChatHistory/ChatHistory.jsx
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../constants/api";
// Removed FaSpinner, FaList, FaComments from react-icons as they are now handled by child components with custom SVGs
import axios from "axios";

// Import CSS module
import styles from "./ChatHistory.module.css";

// Import components
import ChatListPanel from "./components/ChatListPanel";
import ChatDetailPanel from "./components/ChatDetailPanel";
import MobileControls from "./components/MobileControls"; // MobileControls now uses custom SVGs

function ChatHistory({ user, isAdmin }) {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [error, setError] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [showList, setShowList] = useState(true);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      setListLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/chats`, {
          withCredentials: true,
        });
        setChats(res.data.chats);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to fetch chats"
        );
      } finally {
        setListLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Helper to get message count for a chat (if available)
  const getMessageCount = (chat) =>
    typeof chat.messageCount === "number"
      ? chat.messageCount
      : chat.messages
      ? chat.messages.length
      : 0;

  const handleChatClick = async (chatId) => {
    setChatLoading(true);
    setShowDetail(true);

    // For mobile view, hide list and show detail
    if (window.innerWidth < 768) {
      setShowList(false);
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/chats/${chatId}`, {
        withCredentials: true,
      });
      console.log("Chat details:", res.data.chat);

      setSelectedChat(res.data.chat);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch chat"
      );
    } finally {
      setChatLoading(false);
    }
  };

  const toggleView = (view) => {
    if (view === "list") {
      setShowList(true);
      setShowDetail(false);
    } else if (view === "detail") {
      setShowList(false);
      setShowDetail(true);
    }
  };

  // Format date with shorter output on mobile
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      // Added typeof window check
      return date.toLocaleDateString();
    }
    return date.toLocaleString();
  };

  // Render truncated text with ellipsis
  const truncateText = (text, maxLength = 20) => {
    if (!text) return "-";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const handleCloseDetail = () => {
    setSelectedChat(null);
    setShowList(true);
    setShowDetail(false);
  };

  return (
    <div className={styles.chatHistory}>
      <h2 className={styles.title}>{isAdmin ? "All Chats" : "My Chats"}</h2>
      {error && <div className={styles.error}>{error}</div>}

      {/* Mobile view controls - now uses custom SVGs internally */}
      <MobileControls selectedChat={selectedChat} toggleView={toggleView} />

      <div className={styles.chatMainLayout}>
        <ChatListPanel
          chats={chats}
          selectedChat={selectedChat}
          handleChatClick={handleChatClick}
          listLoading={listLoading}
          showList={showList}
          formatDate={formatDate}
          truncateText={truncateText}
          getMessageCount={getMessageCount}
        />

        {selectedChat && (
          <ChatDetailPanel
            selectedChat={selectedChat}
            chatLoading={chatLoading}
            showDetail={showDetail}
            formatDate={formatDate}
            toggleView={toggleView}
            onClose={handleCloseDetail}
          />
        )}
      </div>
    </div>
  );
}

export default ChatHistory;
