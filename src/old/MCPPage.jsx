import React, { useState } from "react";
import { generateText, tool, experimental_createMCPClient } from "ai";
import { Experimental_StdioMCPTransport } from "ai/mcp-stdio";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import axios from "axios";
import { z } from "zod";

import "./ChatbotPage.css";

const GOOGLE_GENERATIVE_AI_API_KEY = import.meta.env
  .VITE_GOOGLE_GENERATIVE_AI_API_KEY;
if (!GOOGLE_GENERATIVE_AI_API_KEY) {
  console.error(
    "Google Generative AI API key is not set. Please set it in your environment variables."
  );
  throw new Error("Google Generative AI API key is not set.");
}
const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17";

const google = createGoogleGenerativeAI({
  apiKey: GOOGLE_GENERATIVE_AI_API_KEY,
  model: GEMINI_MODEL_NAME,
  useSearchGrounding: true,
  useSearch: true,
});

const validFakeStoreCategories = [
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing",
];

// Function to fetch data from the Fake Store API for a specific category
async function fetchCategoryData(category) {
  if (!validFakeStoreCategories.includes(category)) {
    return {
      error: `Invalid category: "${category}". Please choose from: ${validFakeStoreCategories.join(
        ", "
      )}`,
    };
  }
  try {
    const response = await axios.get(
      `https://fakestoreapi.com/products/category/${encodeURIComponent(
        category
      )}`
    );
    if (response.status !== 200) {
      return {
        error: `Failed to fetch data: HTTP status ${response.status}`,
      };
    }
    console.log("Data fetched successfully!");
    console.log(response.data);
    return {
      products: response.data,
    };
  } catch (err) {
    console.error("Error fetching category data:", err);
    return {
      error: `Failed to fetch products for category "${category}". Please try again later.`,
    };
  }
}

let clientOne;
// Initialize an MCP client to connect to a `stdio` MCP server:
const transport = new Experimental_StdioMCPTransport({
  command: "node",
  args: ["C:/mcp/weather/build/index.js"],
});
clientOne = await experimental_createMCPClient({
  transport,
});

const toolSetOne = await clientOne.tools();
const tools = {
  ...toolSetOne,
};

// Helper function to parse message content and extract text and image URLs
const parseMessageContent = (content) => {
  const parts = [];
  const regex = /@@@(.+?)@@@/g;
  let lastIndex = 0;
  let match;

  // Find all image URLs wrapped in @@@
  while ((match = regex.exec(content)) !== null) {
    // Add text before the image URL, if any
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        value: content.slice(lastIndex, match.index),
      });
    }
    // Add the image URL
    parts.push({
      type: "image",
      value: match[1],
    });
    lastIndex = regex.lastIndex;
  }

  // Add any remaining text after the last image
  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      value: content.slice(lastIndex),
    });
  }

  // If no images were found, treat the entire content as text
  if (parts.length === 0) {
    parts.push({
      type: "text",
      value: content,
    });
  }

  return parts;
};

const MCPPage = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newChatHistory = [
      ...chatHistory,
      { role: "user", content: userInput },
    ];
    setChatHistory(newChatHistory);
    setUserInput("");

    try {
      const result = await generateText({
        model: google(GEMINI_MODEL_NAME),
        system: `You are a helpful shop assistant chatbot.
        Use the provided tools to find products based on the user's category requests.
        For each product, include its image by formatting the URL as @@@image_url@@@.
        Example: "Product: Example Item, Image: @@@https://example.com/image.jpg@@@".`,
        messages: newChatHistory,
        tools,
        maxSteps: 2,
      });

      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: result.text },
      ]);
    } catch (err) {
      console.error("Error during sendMessage:", err);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "An error occurred. Please try again." },
      ]);
    }
  };

  return (
    <div className="chatbot-container">
      <h1>עוזר ורטואלי</h1>
      <div className="chat-history">
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${
              message.role === "user" ? "user" : "ai"
            }`}
          >
            {message.role === "user" && (
              <>
                <strong>אתה:</strong> {message.content}
              </>
            )}
            {message.role === "assistant" && message.content && (
              <>
                <strong>בוט:</strong>
                <div>
                  {parseMessageContent(message.content).map(
                    (part, partIndex) => (
                      <React.Fragment key={partIndex}>
                        {part.type === "text" && <span>{part.value}</span>}
                        {part.type === "image" && (
                          <img
                            src={part.value}
                            alt="Product"
                            style={{
                              maxWidth: "200px",
                              marginTop: "10px",
                              display: "block",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none"; // Hide broken images
                              console.error(
                                `Failed to load image: ${part.value}`
                              );
                            }}
                          />
                        )}
                      </React.Fragment>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="תקליד פה..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <button onClick={handleSendMessage}>שלח</button>
      </div>
    </div>
  );
};

export default MCPPage;
