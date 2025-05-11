import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios"; // Use axios for consistency if preferred
import "./ChatInterface.css";
import { API_BASE_URL } from "../../constants/api";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Combined loading state
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [promptNameInput, setPromptNameInput] = useState("");
  const [activePromptName, setActivePromptName] = useState("");
  const [error, setError] = useState(null); // Error state for user feedback
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input effect
  useEffect(() => {
    if (!isLoading && !isStartingSession && sessionId) { // Focus only when ready and session active
      inputRef.current?.focus();
    }
  }, [isLoading, isStartingSession, sessionId]);

  // Function to start a new session
  const startNewSession = useCallback(async () => {
    const trimmedPromptName = promptNameInput.trim();
    if (!trimmedPromptName) {
      setError("Please enter a system prompt name to start a new chat.");
      return;
    }
    setIsStartingSession(true);
    setError(null);
    setMessages([]); // Clear previous messages

    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/start`,
        { systemName: trimmedPromptName }
      );
      const { sessionId: newSessionId } = response.data;
      setSessionId(newSessionId);
      setActivePromptName(trimmedPromptName);
      setMessages([{ role: "system", content: `Chat started with prompt: "${trimmedPromptName}". Session ID: ${newSessionId}` }]);
      localStorage.setItem("chatSessionId", newSessionId);
      localStorage.setItem("chatActivePromptName", trimmedPromptName);
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || "Failed to start session";
      console.error("Error starting session:", err);
      setError(`Error starting session: ${errorMsg}`);
      setSessionId(null);
      setActivePromptName("");
      setMessages([{ role: "system", content: `Error: ${errorMsg}` }]);
      localStorage.removeItem("chatSessionId");
      localStorage.removeItem("chatActivePromptName");
    } finally {
      setIsStartingSession(false);
    }
  }, [promptNameInput]); // Dependency: promptNameInput

  // Function to send a message
  const sendMessage = useCallback(async (e) => {
    if (e) e.preventDefault(); // Prevent default form submission if event is passed
    const messageToSend = inputMessage.trim();
    if (!messageToSend || !sessionId || isLoading || isStartingSession) return;

    setIsLoading(true);
    setInputMessage("");
    setError(null);

    setMessages((prev) => [...prev, { role: "user", content: messageToSend }]);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/message`, {
        sessionId,
        message: messageToSend,
        // Optionally pass systemName if backend needs it for routing/context verification
        // systemName: activePromptName
      });
      const { response: assistantResponse } = response.data;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantResponse || "..." }, // Handle empty response
      ]);
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || "Failed to send message";
      console.error("Error sending message:", err);
      setError(`Error: ${errorMsg}`);
      setMessages((prev) => [...prev, { role: "system", content: `Error sending message: ${errorMsg}` }]);
       // Optionally try to recover or suggest ending session
       if (err.response?.status === 404) { // Session not found on backend
           setError("Session expired or invalid. Please start a new session.");
           endSession(true); // Force end session UI state
       }
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, inputMessage, isLoading, isStartingSession, activePromptName]); // Dependencies

  // Function to end the current session
  const endSession = useCallback(async (force = false) => {
    if (!sessionId || (isLoading && !force)) return;

    setIsLoading(true); // Use general loading state
    setError(null);

    try {
      // Only call backend if not forced (e.g., forced due to 404 error)
      if (!force) {
          await axios.post(`${API_BASE_URL}/chat/end`, { sessionId });
      }
    } catch (err) {
      // Log error but still reset UI state
      console.error("Error ending session on backend:", err);
       // Optionally display a less critical error message
       // setError(`Could not cleanly end session on server: ${err.message}`);
    } finally {
      setSessionId(null);
      setActivePromptName("");
      setPromptNameInput(""); // Clear the input field as well
      setMessages([{ role: "system", content: "Session ended. Enter a prompt name to start a new chat." }]);
      localStorage.removeItem("chatSessionId");
      localStorage.removeItem("chatActivePromptName");
      setIsLoading(false);
      setIsStartingSession(false); // Ensure this is reset too
    }
  }, [sessionId, isLoading]); // Dependency: sessionId, isLoading

  // Attempt to resume session on initial mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem("chatSessionId");
    const savedPromptName = localStorage.getItem("chatActivePromptName");

    if (savedSessionId && savedPromptName) {
        console.log("Attempting to resume session:", savedSessionId);
      // TODO: Add backend validation call here if needed
      // For now, just restore state
      setSessionId(savedSessionId);
      setActivePromptName(savedPromptName);
      setMessages([{ role: "system", content: `Resumed session with prompt: "${savedPromptName}". Session ID: ${savedSessionId}` }]);
       // Optionally fetch history here
    } else {
        setMessages([{ role: "system", content: "Enter a system prompt name to start a chat." }]);
    }
  }, []); // Run only on mount

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        {!sessionId ? (
          <div className="system-prompt-container">
            <input
              type="text"
              name="promptNameInput"
              value={promptNameInput}
              placeholder="System prompt name"
              onChange={(e) => setPromptNameInput(e.target.value)}
              disabled={isStartingSession}
              onKeyDown={(e) => { if (e.key === 'Enter') startNewSession(); }}
            />
            <button onClick={startNewSession} disabled={isStartingSession || !promptNameInput.trim()}>
              {isStartingSession ? "Starting..." : "Start Chat"}
            </button>
          </div>
        ) : (
          <div className="system-prompt-container active-prompt-display">
            <span>Active Prompt:</span>
            <strong>{activePromptName}</strong>
          </div>
        )}
        <button onClick={() => endSession()} className="end-session-btn" disabled={!sessionId || isLoading || isStartingSession}>
          End Session
        </button>
      </div>

      {error && <div className="error-message chat-error">{error}</div>}

      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        {isLoading && !isStartingSession && ( // Show typing indicator only during message sending
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="input-form">
        <textarea
          id="input-message"
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={sessionId ? "Type your message..." : "Start a session first..."}
          disabled={isLoading || isStartingSession || !sessionId}
          rows={1}
          style={{ resize: "none" }}
        />
        <button type="submit" disabled={isLoading || isStartingSession || !inputMessage.trim() || !sessionId}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;