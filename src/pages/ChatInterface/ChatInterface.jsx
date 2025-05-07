// --- START OF FILE src/pages/ChatInterface/ChatInterface.jsx ---
import React, { useState, useEffect, useRef } from "react";
import "./ChatInterface.css"; // Import local CSS
import { API_BASE_URL } from "../../constants/api"; // Import API base URL
// Removed logo import as it's now in the Header

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [promptNameInput, setPromptNameInput] = useState(""); // State for the prompt name input
  const [activePromptName, setActivePromptName] = useState(""); // State to display the active prompt name after session starts
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null); // Ref for the input textarea

  // Auto-focus input when the component mounts or isLoading changes
  useEffect(() => {
    if (!isLoading) {
      // Use optional chaining just in case ref is not yet assigned
      inputRef.current?.focus();
    }
  }, [isLoading]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startNewSession = async () => {
    const trimmedPromptName = promptNameInput.trim();
    if (!trimmedPromptName) {
      alert("Please enter a system prompt name."); // Basic validation
      return;
    }
    setIsLoading(true);
    setError(null); // Clear any previous error message
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/${encodeURIComponent(trimmedPromptName)}/start`, // Use encoded name in URL
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
          const errorData = await response.json();
           throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSessionId(data.sessionId);
      setActivePromptName(trimmedPromptName); // Set the active prompt name
      setMessages([{ role: "system", content: `New session started with prompt: "${trimmedPromptName}"` }]); // Add system message indicating session started
      localStorage.setItem("sessionId", data.sessionId); // Optional: Persist session ID
       localStorage.setItem("activePromptName", trimmedPromptName); // Optional: Persist prompt name

    } catch (error) {
      console.error("Error starting session:", error);
       setMessages([{ role: "system", content: `Error starting session: ${error.message}` }]); // Display error in chat
      setSessionId(null); // Ensure no session ID is set on error
      setActivePromptName(""); // Clear active prompt name on error
      localStorage.removeItem("sessionId");
       localStorage.removeItem("activePromptName");
    } finally {
         setIsLoading(false);
    }
  };

   // Check for existing session ID on mount (optional persistence)
   // Also attempt to restore the prompt name
  useEffect(() => {
      const savedSessionId = localStorage.getItem("sessionId");
      const savedPromptName = localStorage.getItem("activePromptName");

      if (savedSessionId) {
          // In a real app, you'd validate this session on the backend
          // and potentially fetch session history.
          setSessionId(savedSessionId);
          setActivePromptName(savedPromptName || "Unknown Prompt"); // Restore name or show unknown
          setMessages([{ role: "system", content: `Resumed previous session (ID: ${savedSessionId}). Prompt: "${savedPromptName || 'Unknown'}"` }]);
          // The prompt name input remains hidden
      }
  }, []);


  const sendMessage = async (e) => {
    e.preventDefault();
    const messageToSend = inputMessage.trim();
    if (!messageToSend || !sessionId || isLoading) return;

    setIsLoading(true);
    setInputMessage(""); // Clear input immediately
    setError(null); // Clear any previous error message

    // Add user message to the UI immediately
    setMessages((prev) => [...prev, { role: "user", content: messageToSend }]);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          message: messageToSend,
        }),
      });

       if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
       }

      const data = await response.json();
      console.log("Received:", data); // Log full response for debugging

      // Add assistant's response to the UI
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || "No response received." }, // Ensure content is not null/undefined
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "system", // Use system role for errors
          content:
            `Sorry, there was an error processing your message: ${error.message}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
      // Auto-focus the input after loading finishes
       // This is handled by the useEffect now
    }
  };

  const endSession = async () => {
    if (!sessionId || isLoading) return; // Prevent ending while sending message

    setIsLoading(true); // Indicate activity
     setError(null); // Clear any previous error message
    try {
      const response = await fetch(`${API_BASE_URL}/chat/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

       if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
       }

      // Clear the current session and reset state
      setSessionId(null);
      setActivePromptName(""); // Clear active prompt name
      setMessages([{ role: "system", content: "Session ended. Enter a new system prompt name to start another session." }]); // Add session end message
      localStorage.removeItem("sessionId");
      localStorage.removeItem("activePromptName");

    } catch (error) {
      console.error("Error ending session:", error);
       setMessages((prev) => [
         ...prev,
          { role: "system", content: `Error ending session: ${error.message}` }
       ]);
    } finally {
        setIsLoading(false);
         // Focus input area, which is now handled by the useEffect
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const [error, setError] = useState(null); // Add error state

  return (
    // Add direction attribute to container based on locale if needed,
    // but for chat bubbles, it's often simpler to manage internally.
    // Assuming default LTR for chat container itself, with bubble content managing direction.
    <div className="chat-container">
      <div className="chat-header">
        {/* Removed Logo and Heading */}

          {/* System Prompt Input/Display */}
          {!sessionId ? ( // Show input if no session
            <div className="system-prompt-container">
              <input
                type="text"
                name="promptNameInput"
                value={promptNameInput} // Controlled component
                placeholder="Enter existing system prompt name" // Clarify purpose
                onChange={(e) => setPromptNameInput(e.target.value)}
                 disabled={isLoading} // Disable while loading
              />
              <button onClick={startNewSession} disabled={isLoading || !promptNameInput.trim()}>
                  Set Prompt & Start Chat
                </button>
            </div>
          ) : (
              // Display the system prompt name if session exists
               <div className="system-prompt-container">
                  Active Prompt: <strong>{activePromptName}</strong> {/* Display the name used */}
               </div>
          )}

           {/* End Session Button */}
           <button onClick={endSession} className="end-session-btn" disabled={!sessionId || isLoading}>
             סיים שיחה
           </button>
      </div>

       {error && <div className="error">{error}</div>} {/* Display general errors */}

      {/* Main Chat Messages Area */}
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              {message.content}
            </div>
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
        <div ref={messagesEndRef} /> {/* Scroll anchor */}
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="input-form">
        <textarea
          id="input-message" // Added ID
          ref={inputRef} // Attach ref
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="הקלד את הודעתך..."
          disabled={isLoading || !sessionId} // Disable if loading or no session started
          rows={1}
          style={{ resize: "none" }}
        />
        <button type="submit" disabled={isLoading || !inputMessage.trim() || !sessionId}> {/* Disable if no session */}
          שלח
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
// --- END OF FILE src/pages/ChatInterface/ChatInterface.jsx ---