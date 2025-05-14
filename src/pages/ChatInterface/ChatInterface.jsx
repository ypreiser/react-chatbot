import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./ChatInterface.css";
import { API_CHAT_URL } from "../../constants/api";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [systemPromptIdInput, setSystemPromptIdInput] = useState("");
  const [activeSystemPromptId, setActiveSystemPromptId] = useState("");
  const [error, setError] = useState(null);
  const [systemPrompts, setSystemPrompts] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input effect
  useEffect(() => {
    if (!isLoading && !isStartingSession && sessionId) {
      inputRef.current?.focus();
    }
  }, [isLoading, isStartingSession, sessionId]);

  // Fetch all active system prompts on mount
  useEffect(() => {
    async function fetchPrompts() {
      try {
        const response = await axios.get(`${API_CHAT_URL}/prompts`);
        setSystemPrompts(response.data || []);
      } catch (err) {
        const errorMsg =
          err.response?.data?.error || err.message || "Failed to fetch prompts";
        setError(errorMsg);
        setSystemPrompts([]);
      }
    }
    fetchPrompts();
  }, []);

  // Function to start a new session
  const startNewSession = useCallback(async () => {
    const promptId = systemPromptIdInput.trim();
    if (!promptId) {
      setError("Please select a System Prompt to start a new chat.");
      return;
    }
    setIsStartingSession(true);
    setError(null);
    setMessages([]);

    try {
      const response = await axios.post(`${API_CHAT_URL}/${promptId}/start`);
      const { sessionId: newSessionId } = response.data;
      setSessionId(newSessionId);
      setActiveSystemPromptId(promptId);
      setMessages([
        {
          role: "system",
          content: `Chat started with SystemPrompt: ${
            systemPrompts.find((p) => p._id === promptId)?.name || promptId
          }`,
        },
      ]);
      localStorage.setItem("chatSessionId", newSessionId);
      localStorage.setItem("chatActiveSystemPromptId", promptId);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to start session";
      setError(`Error starting session: ${errorMsg}`);
      setSessionId(null);
      setActiveSystemPromptId("");
      setMessages([{ role: "system", content: `Error: ${errorMsg}` }]);
      localStorage.removeItem("chatSessionId");
      localStorage.removeItem("chatActiveSystemPromptId");
    } finally {
      setIsStartingSession(false);
    }
  }, [systemPromptIdInput, systemPrompts]);

  // Function to send a message
  const sendMessage = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      const messageToSend = inputMessage.trim();
      if (!messageToSend || !sessionId || isLoading || isStartingSession)
        return;

      setIsLoading(true);
      setInputMessage("");
      setError(null);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: messageToSend },
      ]);

      try {
        const response = await axios.post(
          `${API_CHAT_URL}/${activeSystemPromptId}/msg`,
          {
            sessionId,
            message: messageToSend,
          }
        );
        const { response: assistantResponse } = response.data;
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: assistantResponse || "..." },
        ]);
      } catch (err) {
        const errorMsg =
          err.response?.data?.error || err.message || "Failed to send message";
        setError(`Error: ${errorMsg}`);
        setMessages((prev) => [
          ...prev,
          { role: "system", content: `Error sending message: ${errorMsg}` },
        ]);
        if (err.response?.status === 404) {
          setError("Session expired or invalid. Please start a new session.");
          endSession(true);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      sessionId,
      inputMessage,
      isLoading,
      isStartingSession,
      activeSystemPromptId,
    ]
  );

  // Function to end the current session
  const endSession = useCallback(
    async (force = false) => {
      if (!sessionId || (isLoading && !force)) return;

      setIsLoading(true);
      setError(null);

      try {
        if (!force) {
          await axios.post(`${API_CHAT_URL}/${activeSystemPromptId}/end`, {
            sessionId,
          });
        }
      } catch (err) {
        console.error("Error ending session:", err);
      } finally {
        setSessionId(null);
        setActiveSystemPromptId("");
        setSystemPromptIdInput("");
        setMessages([
          {
            role: "system",
            content:
              "Session ended. Select a System Prompt to start a new chat.",
          },
        ]);
        localStorage.removeItem("chatSessionId");
        localStorage.removeItem("chatActiveSystemPromptId");
        setIsLoading(false);
        setIsStartingSession(false);
      }
    },
    [sessionId, isLoading, activeSystemPromptId]
  );

  // Resume session on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem("chatSessionId");
    const savedPromptId = localStorage.getItem("chatActiveSystemPromptId");

    if (savedSessionId && savedPromptId) {
      setSessionId(savedSessionId);
      setActiveSystemPromptId(savedPromptId);
      setMessages([
        {
          role: "system",
          content: `Resuming chat session...`,
        },
      ]);

      // Fetch chat history
      axios
        .get(
          `${API_CHAT_URL}/${savedPromptId}/history?sessionId=${savedSessionId}`
        )
        .then((response) => {
          setMessages([
            {
              role: "system",
              content: `Resumed chat session with SystemPrompt: ${
                systemPrompts.find((p) => p._id === savedPromptId)?.name ||
                savedPromptId
              }`,
            },
            ...(response.data.messages || []),
          ]);
        })
        .catch(() => {
          // If session is invalid, clear storage and start fresh
          localStorage.removeItem("chatSessionId");
          localStorage.removeItem("chatActiveSystemPromptId");
          setSessionId(null);
          setActiveSystemPromptId("");
          setMessages([
            {
              role: "system",
              content:
                "Previous session expired. Select a System Prompt to start a new chat.",
            },
          ]);
        });
    } else {
      setMessages([
        {
          role: "system",
          content: "Select a System Prompt to start a chat.",
        },
      ]);
    }
  }, [systemPrompts]);

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
            <select
              name="systemPromptSelect"
              value={systemPromptIdInput}
              onChange={(e) => setSystemPromptIdInput(e.target.value)}
              disabled={isStartingSession || systemPrompts.length === 0}
            >
              <option value="">Select a System Prompt...</option>
              {systemPrompts.map((prompt) => (
                <option key={prompt._id} value={prompt._id}>
                  {prompt.name}
                </option>
              ))}
            </select>
            <button
              onClick={startNewSession}
              disabled={isStartingSession || !systemPromptIdInput}
            >
              {isStartingSession ? "Starting..." : "Start Chat"}
            </button>
          </div>
        ) : (
          <div className="system-prompt-container active-prompt-display">
            <span>Active SystemPrompt:</span>
            <strong>
              {systemPrompts.find((p) => p._id === activeSystemPromptId)
                ?.name || activeSystemPromptId}
            </strong>
          </div>
        )}
        <button
          onClick={() => endSession()}
          className="end-session-btn"
          disabled={!sessionId || isLoading || isStartingSession}
        >
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
        {isLoading && !isStartingSession && (
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
        <textarea
          id="input-message"
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            sessionId ? "Type your message..." : "Start a session first..."
          }
          disabled={isLoading || isStartingSession || !sessionId}
          rows={1}
          style={{ resize: "none" }}
        />
        <button
          type="submit"
          disabled={
            isLoading || isStartingSession || !inputMessage.trim() || !sessionId
          }
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
