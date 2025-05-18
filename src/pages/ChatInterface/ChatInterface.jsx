import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./ChatInterface.css";
import { API_BASE_URL, API_CHAT_URL } from "../../constants/api";

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "audio/mpeg",
  "audio/wav",
  "video/mp4",
];

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom effect
  useEffect(() => {
    console.log("Messages updated:", messages);

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

  // File upload handler
  const handleFileChange = async (e) => {
    setUploadError(null);
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setUploadError("Invalid file type.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadError(`File too large (max ${MAX_FILE_SIZE_MB}MB).`);
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      const { file: fileMeta } = res.data;
      // Send a message referencing the uploaded file
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: "[File Attachment]",
          attachments: [fileMeta],
        },
      ]);
      // Optionally, send to backend as a message (implement backend support)
      await axios.post(`${API_CHAT_URL}/${activeSystemPromptId}/msg`, {
        sessionId,
        message: "[File Attachment]",
        attachments: [fileMeta],
      });
      // Fetch latest chat history to ensure UI matches DB (including attachments)
      const historyRes = await axios.get(
        `${API_CHAT_URL}/${activeSystemPromptId}/history?sessionId=${sessionId}`
      );
      setMessages([
        {
          role: "system",
          content: `Resumed chat session with SystemPrompt: ${
            systemPrompts.find((p) => p._id === activeSystemPromptId)?.name ||
            activeSystemPromptId
          }`,
        },
        ...(historyRes.data.messages || []),
      ]);
    } catch (err) {
      setUploadError(
        err.response?.data?.error || err.message || "Upload failed."
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

      {error && (
        <div className="error-message chat-error">
          {typeof error === "string"
            ? error
            : error?.message || JSON.stringify(error)}
        </div>
      )}
      {uploadError && (
        <div className="error-message chat-error">{uploadError}</div>
      )}

      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {/* Handle multi-part content (array) or string */}
            <div className="message-content">
              {Array.isArray(message.content)
                ? message.content.map((part, i) => {
                    if (part.type === "text") {
                      return <span key={i}>{part.text}</span>;
                    } else if (part.type === "image") {
                      // Find the matching attachment by mimeType and originalName
                      const att = (message.attachments || []).find(
                        (a) =>
                          a.mimeType.startsWith("image/") &&
                          (!part.filename || a.originalName === part.filename)
                      );
                      if (att) {
                        return (
                          <img
                            key={i}
                            src={att.url}
                            alt={att.originalName}
                            className="attachment-img"
                            style={{ maxWidth: 200, maxHeight: 200 }}
                          />
                        );
                      }
                      return <span key={i}>[Image not found]</span>;
                    } else if (part.type === "file") {
                      // Find the matching attachment by originalName
                      const att = (message.attachments || []).find(
                        (a) => a.originalName === part.filename
                      );
                      if (att) {
                        return (
                          <a
                            key={i}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-link"
                          >
                            {att.originalName}
                          </a>
                        );
                      }
                      return <span key={i}>[File not found]</span>;
                    } else {
                      return <span key={i}>[Unsupported part]</span>;
                    }
                  })
                : message.content}
            </div>
            {/* Fallback: show attachments if not already shown above */}
            {message.attachments &&
              message.attachments.length > 0 &&
              (!Array.isArray(message.content) ||
                message.content.length < message.attachments.length) && (
                <div className="attachments">
                  {message.attachments.map((att, i) => {
                    if (att.mimeType.startsWith("image/")) {
                      return (
                        <img
                          key={i}
                          src={att.url}
                          alt={att.originalName}
                          className="attachment-img"
                          style={{ maxWidth: 200, maxHeight: 200 }}
                        />
                      );
                    } else if (att.mimeType.startsWith("audio/")) {
                      return (
                        <audio
                          key={i}
                          controls
                          src={att.url}
                          style={{ maxWidth: 200 }}
                        />
                      );
                    } else if (att.mimeType.startsWith("video/")) {
                      return (
                        <video
                          key={i}
                          controls
                          src={att.url}
                          style={{ maxWidth: 200 }}
                        />
                      );
                    } else {
                      return (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="attachment-link"
                        >
                          {att.originalName}
                        </a>
                      );
                    }
                  })}
                </div>
              )}
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
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={uploading || isLoading || isStartingSession || !sessionId}
          accept={ALLOWED_FILE_TYPES.join(",")}
          style={{ marginLeft: 8 }}
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
