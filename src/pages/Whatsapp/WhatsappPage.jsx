import React, { useState, useEffect } from "react";
import "./WhatsappPage.css";
import { API_BASE_URL } from "../../constants/api";

const WhatsappPage = () => {
  const [sessionId, setSessionId] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [systemPromptName, setSystemPromptName] = useState("");
  const [error, setError] = useState(null);

  console.log("Current state:", {
    sessionId,
    hasQrCode: !!qrCode,
    isConnected,
    systemPromptName,
    error,
  });

  const connectWhatsApp = async () => {
    console.log(
      "Attempting to connect WhatsApp with system prompt:",
      systemPromptName
    );
    try {
      setError(null);
      console.log(`Making POST request to ${API_BASE_URL}/whatsapp/session`);
      const response = await fetch(`${API_BASE_URL}/whatsapp/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ systemPromptName }),
      });

      if (!response.ok) {
        console.error("Failed to create session. Status:", response.status);
        throw new Error("Failed to create session");
      }

      const data = await response.json();
      console.log("Session created successfully:", data);
      setSessionId(data.sessionId);
      setTimeout(() => {
        fetchQRCode(data.sessionId);
      }, 500);
    } catch (err) {
      console.error("Error in connectWhatsApp:", err);
      setError(err.message);
    }
  };

  const fetchQRCode = async (sid) => {
    console.log("Fetching QR code for session:", sid);
    try {
      const response = await fetch(`${API_BASE_URL}/whatsapp/session/${sid}/qr`);
      if (!response.ok) {
        console.error("Failed to fetch QR code. Status:", response.status);
        throw new Error("Failed to fetch QR code");
      }
      const data = await response.json();
      console.log("QR code received successfully");
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
      const response = await fetch(`${API_BASE_URL}/whatsapp/session/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("Failed to disconnect. Status:", response.status);
        throw new Error("Failed to disconnect");
      }

      console.log("Successfully disconnected session");
      setSessionId(null);
      setQrCode(null);
      setIsConnected(false);
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
          console.log("Checking connection status for session:", sessionId);
          const response = await fetch(
            `${API_BASE_URL}/whatsapp/session/${sessionId}/status`
          );
          if (response.ok) {
            console.log("Connection status check successful");
            setIsConnected(true);
          } else {
            console.log(
              "Connection status check failed. Status:",
              response.status
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
  useEffect(() => {
    if (qrCode) {
      console.log("QR code updated");
    }
  }, [qrCode]);

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
          {console.error("Error displayed:", error)} {error}
        </div>
      )}

      {qrCode && !isConnected && (
        <div className="qr-container">
          <h2>Scan QR Code to Connect</h2>
          <img src={qrCode} alt="WhatsApp QR Code" className="qr-code" />
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
