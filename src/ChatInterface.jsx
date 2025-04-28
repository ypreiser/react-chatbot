import React, { useState, useEffect, useRef } from "react";
import "./ChatInterface.css";
import logo from "../public/logoTenLow-02.jpg";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_BASE_URL = "http://localhost:3000/api";

  useEffect(() => {
    startNewSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startNewSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setSessionId(data.sessionId);
      localStorage.setItem("sessionId", data.sessionId);
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !sessionId) return;

    setIsLoading(true);
    const userMessage = inputMessage;
    setInputMessage("");

    // Add user message to the UI immediately
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
        }),
      });

      const data = await response.json();

      // Add assistant's response to the UI
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content:
            "Sorry, there was an error processing your message. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      await fetch(`${API_BASE_URL}/chat/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      // Clear the current session and start a new one
      setSessionId(null);
      setMessages([]);
      startNewSession();
      localStorage.removeItem("sessionId");
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src={logo} alt="TenLow Logo" className="logo" />
        <h1>צ'אט עוזר חנות</h1>
        <button onClick={endSession} className="end-session-btn">
          סיים שיחה
        </button>
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="input-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="הקלד את הודעתך..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputMessage.trim()}>
          שלח
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
