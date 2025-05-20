//react-chatbot2/src/pages/ChatInterface/ChatInterface.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./ChatInterface.css"; // Assuming you have this CSS file for styling
import { API_BASE_URL, API_CHAT_URL } from "../../constants/api"; // Ensure these constants are correct

const MAX_FILE_SIZE_MB = 20; // Increased to match backend limit
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "video/mp4",
  "video/webm",
];

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Covers AI response loading
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [systemPromptIdInput, setSystemPromptIdInput] = useState("");
  const [activeSystemPromptId, setActiveSystemPromptId] = useState("");
  const [error, setError] = useState(null); // General chat errors
  const [systemPrompts, setSystemPrompts] = useState([]);
  const [uploading, setUploading] = useState(false); // Specific for file upload status
  const [uploadError, setUploadError] = useState(null); // Specific for upload errors

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom effect
  useEffect(() => {
    // Use a timeout to ensure DOM updates before scrolling
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100); // A small delay

    return () => clearTimeout(timer); // Clean up the timer
  }, [messages]); // Depend on messages state changing

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
    if (sessionId) {
      // If a session is already active, end it gracefully before starting a new one
      await endSession(true); // Pass true to force end without checking isLoading
    }

    setIsStartingSession(true);
    setError(null);
    setMessages([]); // Clear messages for a new chat

    try {
      const response = await axios.post(`${API_CHAT_URL}/${promptId}/start`);
      const { sessionId: newSessionId } = response.data;
      setSessionId(newSessionId);
      setActiveSystemPromptId(promptId);

      // Find the prompt name for the initial system message
      const promptName =
        systemPrompts.find((p) => p._id === promptId)?.name || promptId;

      setMessages([
        {
          role: "system",
          content: `Chat started with SystemPrompt: ${promptName}`,
        },
      ]);
      // Store session info in localStorage
      localStorage.setItem("chatSessionId", newSessionId);
      localStorage.setItem("chatActiveSystemPromptId", promptId);
      console.log(
        `New session started: ${newSessionId} with prompt: ${promptId}`
      );
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to start session";
      setError(`Error starting session: ${errorMsg}`);
      setSessionId(null);
      setActiveSystemPromptId("");
      setMessages([{ role: "system", content: `Error: ${errorMsg}` }]); // Display error in chat
      // Clean up localStorage on error
      localStorage.removeItem("chatSessionId");
      localStorage.removeItem("chatActiveSystemPromptId");
      console.error({ err }, "Failed to start session.");
    } finally {
      setIsStartingSession(false);
      // Focus input after session starts
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [systemPromptIdInput, systemPrompts, sessionId]); // Added sessionId and endSession to dependencies

  // Function to send a text message
  const sendTextMessage = useCallback(
    async (messageToSend) => {
      if (!messageToSend || !sessionId || isLoading || isStartingSession)
        return;

      setIsLoading(true);
      setError(null);

      // Optimistically add the user message to the UI
      const tempMessageId = `temp-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: messageToSend,
          status: "pending",
          _id: tempMessageId,
        },
      ]);

      try {
        const response = await axios.post(
          `${API_CHAT_URL}/${activeSystemPromptId}/msg`,
          {
            sessionId,
            message: messageToSend,
            // No attachments for a text-only message
          }
        );

        // Assuming the chat endpoint returns the assistant's response directly
        const assistantResponse = response.data.text || response.data.response; // Adjust based on actual backend response structure

        // Update the optimistic message status to sent and add the assistant's response
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempMessageId
              ? { ...msg, status: "sent" } // Mark user message as sent
              : msg
          )
        );

        if (assistantResponse) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: assistantResponse },
          ]);
        } else {
          // Handle cases where AI response might be just tool calls or empty
          // You might want to fetch history here or handle toolCalls in UI
          console.log(
            "Assistant response text was empty or missing for text message."
          );
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to send message";
        setError(`Error: ${errorMsg}`);

        // Update the optimistic message status to failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempMessageId
              ? { ...msg, status: "failed", content: `${msg.content} (Failed)` }
              : msg
          )
        );

        if (err.response?.status === 404) {
          setError("Session expired or invalid. Please start a new session.");
          endSession(true); // Force end session on 404
        }
        console.error({ err }, "Failed to send text message.");
      } finally {
        setIsLoading(false);
        // No need to fetch history here if we are handling optimistic updates + appending assistant response
        // If backend returns full history on send, this would be different.
        // For now, assume backend just returns the AI's direct reply.
      }
    },
    [sessionId, isLoading, isStartingSession, activeSystemPromptId]
  );

  // Combined send handler for text and attachments
  const handleSendMessage = useCallback(
    (e) => {
      if (e) e.preventDefault();
      const messageToSend = inputMessage.trim();

      if (
        !messageToSend &&
        (!fileInputRef.current?.files ||
          fileInputRef.current.files.length === 0)
      ) {
        // Don't send if no text and no files selected
        return;
      }
      if (!sessionId || isLoading || isStartingSession || uploading) {
        // Don't send if session not active or busy
        return;
      }

      if (fileInputRef.current?.files?.length > 0) {
        // If files are selected, handle upload first
        // The file upload handler will take care of sending the message after upload
        handleFileChange({ target: fileInputRef.current }); // Pass file input ref to handler
        setInputMessage(""); // Clear text input immediately
      } else if (messageToSend) {
        // If only text, send text message directly
        sendTextMessage(messageToSend);
        setInputMessage(""); // Clear text input after sending
      }
    },
    [
      inputMessage,
      sessionId,
      isLoading,
      isStartingSession,
      uploading,
      sendTextMessage,
    ]
  );

  // Function to end the current session
  const endSession = useCallback(
    async (force = false) => {
      if (!sessionId || (isLoading && !force && !uploading)) {
        // Only allow ending if session exists AND (not loading or explicitly forced)
        // Added check for `uploading` to prevent ending during upload unless forced
        return;
      }

      setIsLoading(true); // Indicate loading state during session end
      setError(null); // Clear any errors

      try {
        // Only make the API call if not forced (e.g., forced by 404 error)
        if (!force) {
          await axios.post(`${API_CHAT_URL}/${activeSystemPromptId}/end`, {
            sessionId,
          });
          console.log(`Session end API call successful for ${sessionId}`);
        } else {
          console.log(`Force ending session ${sessionId}, skipping API call.`);
        }
      } catch (err) {
        console.error("Error ending session:", err);
        // Log the error but don't necessarily display it to the user if it's just failing to inform the backend of an already broken session.
        // You might want more sophisticated error handling here.
      } finally {
        // Always reset state regardless of API call success/failure if we are ending the session
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
        // Clean up localStorage
        localStorage.removeItem("chatSessionId");
        localStorage.removeItem("chatActiveSystemPromptId");

        setIsLoading(false); // Turn off loading state
        setIsStartingSession(false); // Ensure this is also false
        setUploading(false); // Ensure uploading state is reset
        setUploadError(null); // Clear any pending upload errors

        // Reset file input value so same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Focus system prompt select or input after ending
        setTimeout(() => {
          if (systemPrompts.length > 0) {
            // Focus the select if prompts are available
            const selectElement = document.querySelector(
              ".system-prompt-container select"
            );
            if (selectElement) selectElement.focus();
          } else {
            // Fallback focus (less likely)
            inputRef.current?.focus();
          }
        }, 0);
      }
    },
    [
      sessionId,
      isLoading,
      isStartingSession,
      activeSystemPromptId,
      uploading,
      systemPrompts,
    ] // Added dependencies
  );

  // Resume session on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem("chatSessionId");
    const savedPromptId = localStorage.getItem("chatActiveSystemPromptId");

    if (savedSessionId && savedPromptId) {
      setSessionId(savedSessionId);
      setActiveSystemPromptId(savedPromptId);
      // Set initial message state to indicate resuming
      setMessages([
        {
          role: "system",
          content: `Attempting to resume chat session...`,
        },
      ]);

      // Fetch chat history
      axios
        .get(
          `${API_CHAT_URL}/${savedPromptId}/history?sessionId=${savedSessionId}`
        )
        .then((response) => {
          // Find the prompt name for the system message
          const promptName =
            systemPrompts.find((p) => p._id === savedPromptId)?.name ||
            savedPromptId;

          setMessages([
            {
              role: "system",
              content: `Resumed chat session with SystemPrompt: ${promptName}`,
            },
            ...(response.data.messages || []), // Append historical messages
          ]);
          console.log(`Resumed session ${savedSessionId} and loaded history.`);
        })
        .catch((err) => {
          console.error("Failed to fetch chat history:", err);

          // If fetching history fails, assume session is invalid
          localStorage.removeItem("chatSessionId");
          localStorage.removeItem("chatActiveSystemPromptId");
          setSessionId(null);
          setActiveSystemPromptId("");
          setMessages([
            {
              role: "system",
              content:
                "Previous session expired or history unavailable. Please start a new chat.",
            },
          ]);
          // Focus system prompt select after failure
          setTimeout(() => {
            const selectElement = document.querySelector(
              ".system-prompt-container select"
            );
            if (selectElement) selectElement.focus();
          }, 0);
        });
    } else {
      // No saved session, display initial message
      setMessages([
        {
          role: "system",
          content: "Select a System Prompt to start a chat.",
        },
      ]);
      // Focus system prompt select
      setTimeout(() => {
        const selectElement = document.querySelector(
          ".system-prompt-container select"
        );
        if (selectElement) selectElement.focus();
      }, 0);
    }
  }, [systemPrompts]); // Added systemPrompts to dependency array

  // File upload handler - now ONLY handles the upload and subsequent message send
  const handleFileChange = useCallback(
    async (e) => {
      setUploadError(null);
      const file = e.target.files[0]; // Get the selected file
      if (!file) {
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear input if selection was cancelled
        return;
      }

      // --- Frontend Validation ---
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setUploadError(
          `Invalid file type: ${
            file.type
          }. Allowed types are: ${ALLOWED_FILE_TYPES.join(", ")}.`
        );
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input on error
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setUploadError(
          `File too large (${(file.size / (1024 * 1024)).toFixed(
            2
          )}MB). Max size is ${MAX_FILE_SIZE_MB}MB.`
        );
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input on error
        return;
      }
      if (!sessionId) {
        setUploadError("Start a chat session before uploading files.");
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input
        return;
      }
      // --- End Frontend Validation ---

      setUploading(true); // Indicate upload is in progress
      setIsLoading(true); // Indicate overall processing is happening
      setError(null); // Clear any previous general chat errors

      // Optimistically add a pending message to the UI
      const tempMessageId = `temp-${Date.now()}`;
      // Create optimistic attachment data without the final URL yet
      const optimisticAttachment = {
        originalName: file.name, // Use file.name directly from File object
        mimeType: file.type, // Use file.type directly from File object
        size: file.size, // Use file.size directly from File object
        // url will be added after upload response
      };

      // Add the optimistic message to the state
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: `Uploading ${file.name}...`, // Placeholder content during upload
          attachments: [optimisticAttachment], // Store initial metadata
          status: "pending_upload", // Custom status for upload in progress
          _id: tempMessageId, // Add temporary ID for easy update/removal
        },
      ]);

      try {
        // --- Step 1: Upload file to Cloudinary ---
        const formData = new FormData();
        formData.append("file", file); // 'file' should match the field name in upload.single('file')

        console.log(`Uploading file to ${API_BASE_URL}/upload`);
        const uploadRes = await axios.post(`${API_BASE_URL}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true, // Ensure cookies/auth are sent
        });
        console.log("uploadRes", uploadRes.data);

        // Assumes /api/upload returns a JSON object like { url, originalName, mimeType, size }
        const cloudinaryFileMeta = uploadRes.data.file; // This should contain the Cloudinary URL
        console.log("Cloudinary upload response url:", cloudinaryFileMeta.url);

        if (!cloudinaryFileMeta || !cloudinaryFileMeta.url) {
          throw new Error(
            "Cloudinary upload successful but missing URL in response."
          );
        }
        console.log("Cloudinary upload successful.");

        // --- Step 2: Send message payload to chat endpoint with Cloudinary URL ---
        // Construct the content part(s) for the message payload sent to the backend
        const messageContentParts = [];
        // Optionally include the current text input value if you want to send text + file together
        // For this simple flow, we are sending an attachment-only message
        // if (inputMessage.trim()) {
        //    messageContentParts.push({ type: "text", text: inputMessage.trim() });
        // }

        // Add the file/image part using the Cloudinary URL
        const attachmentContentType = cloudinaryFileMeta.mimeType.startsWith(
          "image/"
        )
          ? "image"
          : "file";
        if (attachmentContentType === "image") {
          messageContentParts.push({
            type: "image",
            image: cloudinaryFileMeta.url, // Pass the Cloudinary URL
            mimeType: cloudinaryFileMeta.mimeType,
            filename: cloudinaryFileMeta.originalName, // Include filename in part for backend/AI
          });
        } else {
          messageContentParts.push({
            type: "file",
            mimeType: cloudinaryFileMeta.mimeType,
            data: cloudinaryFileMeta.url, // Pass the Cloudinary URL
            filename: cloudinaryFileMeta.originalName, // Include filename in part for backend/AI
          });
        }

        // If no text input, use a placeholder or leave message field empty if backend handles it
        const messageTextPayload = inputMessage.trim() || "[File Attachment]";

        console.log(
          `Sending message to ${API_CHAT_URL}/${activeSystemPromptId}/msg`,
          {
            sessionId,
            message: messageTextPayload, // Use placeholder or combined text
            attachments: messageContentParts, // Send the attachment metadata with the Cloudinary URL
          }
        );
        const chatResponse = await axios.post(
          `${API_CHAT_URL}/${activeSystemPromptId}/msg`,
          {
            sessionId,
            message: messageTextPayload, // Use placeholder or combined text
            // Send the attachment metadata with the Cloudinary URL
            attachments: [cloudinaryFileMeta], // Ensure this is the array format expected by backend
            // Send the AI SDK compatible content structure directly if backend expects it,
            // or let the backend construct it from message/attachments.
            // Based on backend code, sending `message` and `attachments` is correct.
          }
        );
        console.log("Message sent successfully to chat endpoint.");

        // --- Step 3: Fetch full history to update UI ---
        // This is the simplest way to get the final state including AI response
        console.log(`Fetching updated chat history for session ${sessionId}`);
        const historyRes = await axios.get(
          `${API_CHAT_URL}/${activeSystemPromptId}/history?sessionId=${sessionId}`
        );
        console.log("Chat history fetched successfully.");

        // Replace existing messages with fetched history (This will include the user's message with correct content structure and the AI's reply)
        const promptName =
          systemPrompts.find((p) => p._id === activeSystemPromptId)?.name ||
          activeSystemPromptId;
        setMessages([
          {
            role: "system",
            content: `Resumed chat session with SystemPrompt: ${promptName}`,
          },
          ...(historyRes.data.messages || []),
        ]);
      } catch (err) {
        console.error({ err }, "File upload or message send failed.");
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Upload or message send failed.";
        setUploadError(errorMsg);

        // Find the optimistic message and update its status to failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempMessageId
              ? {
                  ...msg,
                  status: "failed",
                  content: `${msg.content} (Failed: ${errorMsg})`,
                }
              : msg
          )
        );
      } finally {
        setUploading(false); // Uploading finished
        setIsLoading(false); // Overall processing finished
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input value
        setInputMessage(""); // Clear text input field
        // Focus input after processing
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    },
    [
      sessionId,
      activeSystemPromptId,
      isLoading,
      isStartingSession,
      systemPrompts,
    ]
  ); // Added dependencies

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(); // Use the combined handler
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
              disabled={
                isStartingSession ||
                systemPrompts.length === 0 ||
                isLoading ||
                uploading
              } // Disable if busy
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
              disabled={
                isStartingSession ||
                !systemPromptIdInput ||
                isLoading ||
                uploading
              } // Disable if busy
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
          disabled={!sessionId || isLoading || isStartingSession || uploading} // Disable if busy
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
        <div className="error-message chat-upload-error">{uploadError}</div> // Different class for upload errors
      )}

      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={message._id || index} className={`message ${message.role}`}>
            {/* Chat bubble content */}
            <div className="message-content">
              {Array.isArray(message.content)
                ? message.content.map((part, i) => {
                    if (part.type === "text") {
                      return <span key={i}>{part.text}</span>;
                    } else if (
                      part.type === "image" &&
                      typeof part.image === "string"
                    ) {
                      return (
                        <img
                          key={i}
                          src={part.image}
                          alt={
                            part.filename ||
                            part.originalName ||
                            "attached image"
                          }
                          className="attachment-img"
                          style={{ maxWidth: 250, maxHeight: 250 }}
                        />
                      );
                    } else if (
                      part.type === "file" &&
                      typeof part.data === "string"
                    ) {
                      return (
                        <a
                          key={i}
                          href={part.data}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="attachment-link"
                          download={part.filename}
                        >
                          {part.filename ||
                            part.originalName ||
                            "Attached File"}
                        </a>
                      );
                    } else {
                      const attName =
                        part.filename || part.originalName || "unknown file";
                      return (
                        <span key={i}>
                          [Unsupported or invalid part: {attName}]
                        </span>
                      );
                    }
                  })
                : message.content}
              {/* Display status for pending/failed messages */}
              {message.status &&
                (message.status === "pending_upload" ||
                  message.status === "pending" ||
                  message.status === "failed") && (
                  <span
                    className={`message-status ${message.status.replace(
                      "_",
                      "-"
                    )}`}
                  >
                    {" "}
                    ({message.status.replace("_", " ")})
                  </span>
                )}
            </div>
          </div>
        ))}
        {(isLoading || uploading) && !isStartingSession && (
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

      <form onSubmit={handleSendMessage} className="input-form">
        {" "}
        {/* Use combined handler */}
        <textarea
          id="input-message"
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            sessionId
              ? uploading
                ? "Uploading file..."
                : "Type your message or attach a file..."
              : "Start a session first..."
          }
          disabled={isLoading || isStartingSession || !sessionId || uploading} // Disable if busy
          rows={1}
          style={{ resize: "none" }}
        />
        {/* File input hidden, triggered by a button/icon */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange} // File selection directly triggers handleFileChange
          disabled={uploading || isLoading || isStartingSession || !sessionId} // Disable if busy
          accept={ALLOWED_FILE_TYPES.join(",")}
          style={{ display: "none" }} // Hide the default file input
        />
        {/* Button/Icon to trigger file input */}
        <button
          type="button" // Important: type="button" to prevent form submission
          onClick={() => fileInputRef.current?.click()} // Trigger hidden input click
          disabled={uploading || isLoading || isStartingSession || !sessionId} // Disable if busy
          className="attach-button"
        >
          {/* You can replace this with an icon */}
          📎
        </button>
        <button
          type="submit"
          disabled={
            isLoading ||
            isStartingSession ||
            (!inputMessage.trim() &&
              (!fileInputRef.current?.files ||
                fileInputRef.current.files.length === 0)) ||
            !sessionId ||
            uploading // Disable if no input, no files, or busy
          }
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
