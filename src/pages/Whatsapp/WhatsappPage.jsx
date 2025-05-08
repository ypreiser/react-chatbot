import React, { useState, useEffect } from "react";
import "./WhatsappPage.css";
import { API_BASE_URL } from "../../constants/api";

const WhatsappPage = () => {
  const [sessionId, setSessionId] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [systemPromptName, setSystemPromptName] = useState("");
  const [error, setError] = useState(null);
  const [qrRetryCount, setQrRetryCount] = useState(0);

  console.log("Current state:", {
    sessionId,
    hasQrCode: !!qrCode,
    qrCode,
    qrCodeLength: qrCode ? qrCode.length : 0,
    isConnected,
    systemPromptName,
    error,
    qrRetryCount,
    apiBaseUrl: API_BASE_URL,
  });

  const connectWhatsApp = async () => {
    console.log(
      "Attempting to connect WhatsApp with system prompt:",
      systemPromptName
    );
    try {
      setError(null);
      const url = `${API_BASE_URL}/whatsapp/session`;
      console.log("Making POST request to:", url);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ systemPromptName }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Failed to create session. Status:",
          response.status,
          "Response:",
          errorText
        );
        throw new Error(`Failed to create session: ${errorText}`);
      }

      const data = await response.json();
      console.log("Session created successfully:", data);
      setSessionId(data.sessionId);
      setQrRetryCount(0);
      setTimeout(() => {
        fetchQRCode(data.sessionId);
      }, 2000);
    } catch (err) {
      console.error("Error in connectWhatsApp:", err);
      setError(err.message);
    }
  };

  const fetchQRCode = async (sid) => {
    console.log("Fetching QR code for session:", sid);
    try {
      const url = `${API_BASE_URL}/whatsapp/session/${sid}/qr`;
      console.log("Making GET request to:", url);
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Failed to fetch QR code. Status:",
          response.status,
          "Response:",
          errorText
        );
        // throw new Error(`Failed to fetch QR code: ${errorText}`);
      }

      const data = await response.json();
      console.log("QR code received successfully. Data type:", typeof data.qr);
      console.log("QR code data length:", data.qr ? data.qr.length : 0);

      if (!data.qr) {
        console.log("No QR code in response, will retry...");
        if (qrRetryCount < 5) {
          console.log("Retrying QR code fetch, attempt:", qrRetryCount);
          setQrRetryCount((prev) => prev + 1);
          setTimeout(() => fetchQRCode(sid), 2000);
        } else {
          throw new Error("Failed to get QR code after multiple attempts");
        }
        return;
      }
      
      console.log("QR code received successfully:", data.qr);
      setQrCode(data.qr);
    } catch (err) {
      console.error("Error in fetchQRCode:", err);
      setError(err.message);
    }
  };

  const disconnectWhatsApp = async () => {
    if (!sessionId) {
      console.log("No active session to disconnect");
      return;
    }

    console.log("Attempting to disconnect session:", sessionId);
    try {
      const url = `${API_BASE_URL}/whatsapp/session/${sessionId}`;
      console.log("Making DELETE request to:", url);
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Failed to disconnect. Status:",
          response.status,
          "Response:",
          errorText
        );
        throw new Error(`Failed to disconnect: ${errorText}`);
      }

      console.log("Successfully disconnected session");
      setSessionId(null);
      setQrCode(null);
      setIsConnected(false);
      setQrRetryCount(0);
    } catch (err) {
      console.error("Error in disconnectWhatsApp:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (sessionId && qrCode) {
      console.log(
        "Setting up connection check interval for session:",
        sessionId
      );
      const checkConnection = async () => {
        try {
          const url = `${API_BASE_URL}/whatsapp/session/${sessionId}/status`;
          console.log("Checking connection status at:", url);
          const response = await fetch(url);

          if (response.ok) {
            const data = await response.json();
            console.log("Connection status check successful:", data);
            if (data.status === "connected") {
              setIsConnected(true);
            } else {
              setIsConnected(false);
            }
          } else {
            const errorText = await response.text();
            console.log(
              "Connection status check failed. Status:",
              response.status,
              "Response:",
              errorText
            );
          }
        } catch (err) {
          console.error("Error checking connection:", err);
        }
      };

      const interval = setInterval(checkConnection, 5000);
      return () => {
        console.log("Cleaning up connection check interval");
        clearInterval(interval);
      };
    }
  }, [sessionId, qrCode]);

  // Log when connection status changes
  useEffect(() => {
    console.log("Connection status changed:", isConnected);
  }, [isConnected]);

  // Log when QR code changes
//   useEffect(() => {
//     if (qrCode) {
//       console.log("QR code updated, length:", qrCode.length);
//     }
//   }, [qrCode]);

  return (
    <div className="whatsapp-container">
      <h1>WhatsApp Connection</h1>

      <div className="connection-controls">
        <input
          type="text"
          value={systemPromptName}
          onChange={(e) => {
            console.log("System prompt name changed:", e.target.value);
            setSystemPromptName(e.target.value);
          }}
          placeholder="Enter system prompt name"
          className="system-prompt-input"
        />

        {!sessionId ? (
          <button onClick={connectWhatsApp} className="connect-button">
            Connect WhatsApp
          </button>
        ) : (
          <button onClick={disconnectWhatsApp} className="disconnect-button">
            Disconnect
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {console.error("Error displayed:", error)}
          {error}
        </div>
      )}

      {qrCode && !isConnected && (
        <div className="qr-container">
          <h2>Scan QR Code to Connect</h2>
          <img
            src={qrCode}
            alt="WhatsApp QR Code"
            className="qr-code"
            onError={(e) => {
              console.error("Error loading QR code image:", e);
              setError("Failed to load QR code image");
            }}
          />
          {qrRetryCount > 0 && (
            <p className="qr-retry-message">
              Attempting to get QR code... (Attempt {qrRetryCount}/5)
            </p>
          )}
        </div>
      )}

      {isConnected && (
        <div className="connection-status">
          <h2>WhatsApp Connected Successfully!</h2>
        </div>
      )}
    </div>
  );
};

export default WhatsappPage;
