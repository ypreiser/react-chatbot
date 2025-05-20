//react-chatbot2/src/pages/Whatsapp/WhatsappPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import "./WhatsappPage.css";
import { API_BASE_URL, API_CHAT_URL } from "../../constants/api";

const STATUS_CHECK_INTERVAL = 10000; // Check status every 10 seconds
const QR_RETRY_INTERVAL = 10000; // Retry QR code fetch every 10 seconds
const MAX_QR_RETRIES = 10; // Max retries for QR code

const WhatsappPage = () => {
  const [connectionNameInput, setConnectionNameInput] = useState(""); // Name being typed
  const [activeConnectionName, setActiveConnectionName] = useState(null); // Name of the current/last active connection
  const [connectionStatus, setConnectionStatus] = useState(null); // Backend status string
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [systemPromptName, setSystemPromptName] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // General loading state (connect/disconnect)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [systemPrompts, setSystemPrompts] = useState([]); // List of system prompts
  const [userConnections, setUserConnections] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [connectionsError, setConnectionsError] = useState(null);

  // Refs for intervals to ensure they are cleared properly
  const statusIntervalRef = useRef(null);
  const qrRetryTimeoutRef = useRef(null);
  const qrRetryCountRef = useRef(0); // Ref to track retries

  // Helper to clear intervals/timeouts
  const clearTimers = () => {
    if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    if (qrRetryTimeoutRef.current) clearTimeout(qrRetryTimeoutRef.current);
    statusIntervalRef.current = null;
    qrRetryTimeoutRef.current = null;
    qrRetryCountRef.current = 0; // Reset retry count
  };

  // Fetch Status Function
  const checkConnectionStatus = useCallback(
    async (connName) => {
      if (!connName || isCheckingStatus) return;
      setIsCheckingStatus(true);
      // console.log(`Checking status for ${connName}...`);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/whatsapp/session/${connName}/status`,
          { withCredentials: true }
        );
        const newStatus = response.data.status;
        console.log(`Status for ${connName}: ${newStatus}`);
        setConnectionStatus(newStatus);

        // Handle state transitions based on status
        if (newStatus === "connected" || newStatus === "authenticated") {
          setQrCodeDataUrl(null); // Clear QR code if connected
          clearTimeout(qrRetryTimeoutRef.current); // Stop QR retries
        } else if (newStatus === "qr_ready") {
          // If status becomes qr_ready, try fetching QR immediately
          fetchQRCode(connName);
        } else if (
          newStatus === "disconnected" ||
          newStatus === "auth_failed" ||
          newStatus === "not_found"
        ) {
          // If disconnected/failed, clear everything and stop polling
          setError(
            newStatus === "auth_failed"
              ? "Authentication failed. Please scan QR again."
              : `Disconnected (${newStatus}). Session closed.`
          );
          clearTimers();
          setActiveConnectionName(null);
          setConnectionStatus(null);
          setQrCodeDataUrl(null);
          setIsLoading(false); // Ensure loading is stopped
          setConnectionNameInput(""); // Clear input field
        }
      } catch (err) {
        console.error(`Error checking status for ${connName}:`, err);
        // If status check fails (e.g., 404 session gone), treat as disconnected
        if (err.response && err.response.status === 404) {
          setError(`Session '${connName}' not found on server.`);
          clearTimers();
          setActiveConnectionName(null);
          setConnectionStatus(null);
          setQrCodeDataUrl(null);
          setIsLoading(false);
          setConnectionNameInput("");
        } else {
          // Temporary network error, maybe show a different error
          setError(`Error checking status: ${err.message}`);
        }
      } finally {
        setIsCheckingStatus(false);
      }
    },
    [isCheckingStatus]
  ); // Dependency

  // Fetch QR Code Function
  const fetchQRCode = useCallback(
    async (connName) => {
      if (!connName) return;
      console.log(
        `Fetching QR code for ${connName}, attempt ${
          qrRetryCountRef.current + 1
        }`
      );

      try {
        const response = await axios.get(
          `${API_BASE_URL}/whatsapp/session/${connName}/qr`,
          { withCredentials: true }
        );
        const qrData = response.data.qr;

        if (
          qrData &&
          typeof qrData === "string" &&
          qrData.startsWith("data:image/png;base64,")
        ) {
          console.log(`QR code received for ${connName}.`);
          setQrCodeDataUrl(qrData);
          setError(null);
          clearTimeout(qrRetryTimeoutRef.current); // Stop retrying once QR is received
          qrRetryCountRef.current = 0; // Reset retries
        } else {
          console.log(
            `No valid QR code yet for ${connName}, status might not be qr_ready or QR generation pending.`
          );
          // Continue retrying if status is still qr_ready and retries not exceeded
          if (
            connectionStatus === "qr_ready" &&
            qrRetryCountRef.current < MAX_QR_RETRIES
          ) {
            qrRetryCountRef.current++;
            qrRetryTimeoutRef.current = setTimeout(
              () => fetchQRCode(connName),
              QR_RETRY_INTERVAL
            );
          } else if (qrRetryCountRef.current >= MAX_QR_RETRIES) {
            setError(
              "Failed to retrieve QR code after multiple attempts. Try reconnecting."
            );
            clearTimers(); // Stop trying
          }
        }
      } catch (err) {
        console.error(`Error fetching QR code for ${connName}:`, err);
        // If QR fetch fails (e.g., 404), check status to see if session is still valid
        if (err.response && err.response.status === 404) {
          console.log("QR endpoint returned 404, checking session status...");
          checkConnectionStatus(connName); // Check status to see if session is still supposed to be in QR state
        } else {
          setError(`Failed to fetch QR code: ${err.message}`);
        }
        // Don't stop polling immediately on transient errors unless it's 404 or max retries
        if (
          connectionStatus === "qr_ready" &&
          qrRetryCountRef.current < MAX_QR_RETRIES
        ) {
          qrRetryCountRef.current++;
          qrRetryTimeoutRef.current = setTimeout(
            () => fetchQRCode(connName),
            QR_RETRY_INTERVAL
          );
        } else if (qrRetryCountRef.current >= MAX_QR_RETRIES) {
          setError(
            "Failed to retrieve QR code after multiple attempts. Try reconnecting."
          );
          clearTimers();
        }
      }
    },
    [connectionStatus]
  ); // Dependencies

  // Effect to start/stop status polling
  useEffect(() => {
    clearTimers(); // Clear any existing timers when activeConnectionName changes

    if (activeConnectionName) {
      console.log(`Starting status polling for ${activeConnectionName}`);
      // Initial check
      checkConnectionStatus(activeConnectionName);
      // Start interval
      statusIntervalRef.current = setInterval(
        () => checkConnectionStatus(activeConnectionName),
        STATUS_CHECK_INTERVAL
      );
    }

    // Cleanup function
    return () => {
      console.log(`Cleaning up timers for ${activeConnectionName}`);
      clearTimers();
    };
  }, [activeConnectionName]); // Rerun when activeConnectionName changes

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

  // Fetch user's WhatsApp connections on mount
  useEffect(() => {
    async function fetchConnections() {
      setConnectionsLoading(true);
      setConnectionsError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/whatsapp/connections`, {
          withCredentials: true,
        });
        setUserConnections(res.data.connections || []);
      } catch (err) {
        setConnectionsError(
          err.response?.data?.error?.message ||
            err.message ||
            "Failed to fetch WhatsApp connections."
        );
        setUserConnections([]);
      } finally {
        setConnectionsLoading(false);
      }
    }
    fetchConnections();
  }, []);

  // Connect Function
  const connectWhatsApp = async () => {
    const nameToConnect = connectionNameInput.trim();
    const promptToUse = systemPromptName.trim();
    if (!nameToConnect || !promptToUse) {
      setError("Both Connection Name and System Prompt Name are required.");
      return;
    }

    // Disconnect previous session if any
    if (activeConnectionName) {
      await disconnectWhatsApp(true); // Disconnect silently before starting new one
    }

    setIsLoading(true);
    setError(null);
    setQrCodeDataUrl(null);
    setConnectionStatus("initializing"); // Optimistic status
    qrRetryCountRef.current = 0; // Reset retries for new connection

    try {
      console.log(
        `Connecting with name: ${nameToConnect}, prompt: ${promptToUse}`
      );
      await axios.post(
        `${API_BASE_URL}/whatsapp/session`,
        {
          connectionName: nameToConnect,
          systemPromptName: promptToUse,
        },
        {
          withCredentials: true,
        }
      );
      setActiveConnectionName(nameToConnect); // Set active name, polling will start via useEffect
      // Status will be updated by the polling mechanism
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to initialize session";
      console.error("Error connecting WhatsApp:", err);
      setError(`Connection Error: ${errorMsg}`);
      setConnectionStatus("failed_to_initialize");
      setActiveConnectionName(null); // Ensure no active connection on failure
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect Function
  const disconnectWhatsApp = async (silent = false) => {
    if (!activeConnectionName) {
      if (!silent) console.log("No active connection to disconnect.");
      return;
    }

    const nameToDisconnect = activeConnectionName; // Capture name before state changes
    if (!silent) setIsLoading(true);
    if (!silent) setError(null);
    clearTimers(); // Stop polling immediately

    try {
      console.log(`Disconnecting ${nameToDisconnect}...`);
      await axios.delete(
        `${API_BASE_URL}/whatsapp/session/${nameToDisconnect}`,
        { withCredentials: true }
      );
      if (!silent)
        console.log(`Successfully disconnected ${nameToDisconnect}.`);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to disconnect session";
      console.error(`Error disconnecting ${nameToDisconnect}:`, err);
      if (!silent) setError(`Disconnection Error: ${errorMsg}`);
      // Continue with UI cleanup even if backend call fails
    } finally {
      // Reset state fully only if not silent (i.e., user initiated)
      if (!silent) {
        setActiveConnectionName(null);
        setConnectionStatus(null);
        setQrCodeDataUrl(null);
        setIsLoading(false);
        setConnectionNameInput(""); // Clear input only on manual disconnect
        setSystemPromptName(""); // Clear prompt name as well
      }
    }
  };

  const isConnected =
    connectionStatus === "connected" || connectionStatus === "authenticated";

  return (
    <div className="whatsapp-container">
      <h1>WhatsApp Connection</h1>

      {/* User Connections List */}
      <div className="whatsapp-connections-list-area">
        <h2>Your WhatsApp Connections</h2>
        {connectionsLoading ? (
          <div className="connections-loading">Loading connections...</div>
        ) : connectionsError ? (
          <div className="connections-error">{connectionsError}</div>
        ) : userConnections.length === 0 ? (
          <div className="connections-empty">
            No WhatsApp connections found.
          </div>
        ) : (
          <table className="whatsapp-connections-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>System Prompt</th>
                <th>Status</th>
                <th>Phone Number</th>
                <th>Last Connected</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userConnections.map((conn) => (
                <tr key={conn._id || conn.connectionName}>
                  <td>{conn.connectionName}</td>
                  <td>{conn.systemPromptName}</td>
                  <td>
                    <span
                      className={`status-badge status-${
                        conn.lastKnownStatus || "unknown"
                      }`}
                    >
                      {conn.lastKnownStatus || "unknown"}
                    </span>
                  </td>
                  <td>{conn.phoneNumber || "-"}</td>
                  <td>
                    {conn.lastConnectedAt
                      ? new Date(conn.lastConnectedAt).toLocaleString()
                      : "-"}
                  </td>
                  <td>
                    {conn.createdAt
                      ? new Date(conn.createdAt).toLocaleString()
                      : "-"}
                  </td>
                  <td>
                    <button
                      className="disconnect-button"
                      disabled={isLoading}
                      onClick={() => disconnectWhatsApp()}
                    >
                      {isLoading && activeConnectionName === conn.connectionName
                        ? "Disconnecting..."
                        : `Disconnect ${conn.connectionName}`}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="connection-controls">
        <input
          type="text"
          value={connectionNameInput}
          onChange={(e) => setConnectionNameInput(e.target.value)}
          placeholder="Connection name (e.g., MainOffice)"
          className="connection-name-input"
          disabled={isLoading || activeConnectionName} // Disable if loading or connected
        />
        <div className="system-prompt-dropdown-container">
          <select
            value={systemPromptName}
            onChange={(e) => setSystemPromptName(e.target.value)}
            className="system-prompt-input"
            disabled={isLoading || activeConnectionName} // Disable if loading or connected
          >
            <option value="">Select a System Prompt</option>
            {systemPrompts.map((prompt) => (
              <option
                key={prompt._id || prompt.id || prompt.name}
                value={prompt._id || prompt.id || prompt.name}
              >
                {prompt.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={connectWhatsApp}
          className="connect-button"
          disabled={
            isLoading ||
            activeConnectionName ||
            !connectionNameInput.trim() ||
            !systemPromptName.trim()
          }
        >
          {isLoading ? "Connecting..." : "Connect"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Display Area */}
      <div className="status-display-area">
        {connectionStatus === "initializing" && (
          <p>Initializing connection...</p>
        )}

        {connectionStatus === "qr_ready" && !isConnected && (
          <div className="qr-container">
            <h2>Scan QR Code to Connect</h2>
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="WhatsApp QR Code"
                className="qr-code"
              />
            ) : (
              <p>
                Loading QR Code... (Attempt {qrRetryCountRef.current + 1}/
                {MAX_QR_RETRIES})
              </p>
            )}
          </div>
        )}

        {isConnected && (
          <div className="connection-status connected">
            <h2>WhatsApp Connected Successfully!</h2>
            <p>
              Connection Name: <strong>{activeConnectionName}</strong>
            </p>
            <p>Status: {connectionStatus}</p>
          </div>
        )}

        {connectionStatus &&
          !isConnected &&
          connectionStatus !== "qr_ready" &&
          connectionStatus !== "initializing" && (
            <div className={`connection-status ${connectionStatus}`}>
              {" "}
              {/* Add class for specific styling */}
              <h2>Connection Status: {connectionStatus}</h2>
              <p>Connection Name: {activeConnectionName}</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default WhatsappPage;
