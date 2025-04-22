import React, { useState } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import axios from "axios";
import "./ChatbotPage.css";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error(
    "Error: GEMINI_API_KEY not found in environment variables. Please set it in your .env file."
  );
}

// Ensure API key is available before attempting to initialize
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;
const MODEL_NAME = "gemini-2.5-flash-preview-04-17";

const validFakeStoreCategories = [
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing",
];

const getProductsByCategory = {
  name: "getProductsByCategory",
  description: "Fetches products from the Fake Store API based on a category.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: "string",
        description: `The name of the product category to fetch. Must be one of: electronics, jewelery, men's clothing, women's clothing.`,
        enum: ["electronics", "jewelery", "men's clothing", "women's clothing"],
      },
    },
    required: ["category"],
  },
};

const displayProductImage = {
  name: "displayProductImage",
  description: "Display the image of a product.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      imageUrl: {
        type: "string",
        description: "The URL of the product image.",
      },
    },
    required: ["imageUrl"],
  },
};

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
      // Return error response structure for the model
      return {
        error: `Failed to fetch data: HTTP status ${response.status}`,
      };
    }
    // Return successful response structure for the model
    return {
      products: response.data,
    };
  } catch (err) {
    console.error("Error fetching category data:", err); // Log the actual error
    // Return error response structure for the model
    return {
      error: `Failed to fetch products for category "${category}". Please try again later.`,
    };
  }
}

const ChatbotPage = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");

  // Initialize chat only if API key is available
  const [chat, setChat] = useState(() => {
    if (!ai) return null; // Return null if API key is missing

    return ai.chats.create({
      model: MODEL_NAME,
      config: {
        tools: [
          // Add the googleSearch tool definition
          { googleSearch: {} },
          {
            functionDeclarations: [getProductsByCategory, displayProductImage],
          },
        ],
        systemInstruction: `אתה צ'אט בוט מועיל בחנות. 
השתמש בכלים המסופקים כדי למצוא מוצרים בהתבסס על בקשות הקטגוריה של המשתמש. 
תענה בשפה שבה הלקוח כותב. תתרגם את שמות ופרטי המוצרים לפה המדוברת. 
אם המשתמש שואל שאלה שאינה קשורה למציאת מוצרים לפי קטגוריה, נסה לענות בשיחה או לכוון אותו לקטגוריות מוצרים. 
השתמש בכלי getProductsByCategory רק עבור בקשות מוצרים. 
אם המשתמש מבקש להציג תמונה של מוצר, השתמש בכלי displayProductImage. 
אם יש שגיאה או בעיה, נסה להסביר את הבעיה למשתמש. 
אם המשתמש שואל שאלה לגבי מוצר ספציפי העזר בחיפוש באינטרנט על מנת לספק מידע מדויק.`,
      },
      history: [],
    });
  });

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    if (!chat) {
      // Prevent sending if chat wasn't initialized (API key missing)
      setChatHistory((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Chatbot is not configured. Please provide a valid API key.",
        },
      ]);
      setUserInput("");
      return;
    }

    const newChatHistory = [...chatHistory, { role: "user", text: userInput }];
    setChatHistory(newChatHistory);
    setUserInput(""); // Clear input immediately

    try {
      // Step 1: Send user message to the model
      const result = await chat.sendMessage({
        message: {
          role: "user",
          parts: [{ text: newChatHistory[newChatHistory.length - 1].text }], // Use the text from the state update
        },
      });

      console.log("--- Model First Response ---");
      console.log("Result:", result);
      console.log("Function Calls:", result?.functionCalls);
      console.log("Text:", result?.text);
      console.log("----------------------------");

      // Step 2: Check if the model returned a function call
      if (result && result.functionCalls && result.functionCalls.length > 0) {
        const functionCall = result.functionCalls[0]; // Assuming only one function call at a time for simplicity

        if (functionCall.name === "getProductsByCategory") {
          console.log(
            "Detected getProductsByCategory call with args:",
            functionCall.args
          );
          const category = functionCall.args?.category;

          if (category) {
            // Step 3: Execute the function call
            console.log(
              `Executing fetchCategoryData for category: ${category}`
            );
            const functionResponseData = await fetchCategoryData(category);
            console.log("Function Response Data:", functionResponseData);

            // Step 4: Send the function response back to the model
            const finalResponseResult = await chat.sendMessage({
              message: {
                // Message containing the function response
                role: "model", // The function response is sent from the "model" role's perspective
                parts: [
                  {
                    functionResponse: {
                      name: "getProductsByCategory",
                      response: functionResponseData,
                    },
                  },
                ],
              },
            });

            console.log(
              "--- Model Final Response (after functionResponse) ---"
            );
            console.log("Final Result:", finalResponseResult);
            console.log("Final Text:", finalResponseResult?.text);
            console.log("---------------------------------------------------");

            // Step 5: Display the model's final text response
            setChatHistory((prev) => [
              ...prev,
              {
                role: "ai",
                text:
                  finalResponseResult?.text ||
                  "No response after function call.",
              },
            ]);
          } else {
            // If functionCall was detected but category arg was missing
            setChatHistory((prev) => [
              ...prev,
              {
                role: "ai",
                text: "Sorry, I couldn't understand the product category requested.",
              },
            ]);
          }
        } else if (functionCall.name === "displayProductImage") {
          console.log(
            "Detected displayProductImage call with args:",
            functionCall.args
          );
          const imageUrl = functionCall.args?.imageUrl;
          if (imageUrl) {
            // Step 3 (alternative): Display the image directly in the UI
            setChatHistory((prev) => [
              ...prev,
              { role: "ai", imageUrl }, // Add the image URL to the chat history state
            ]);
            // No need to send a functionResponse back to the model for UI actions
          } else {
            setChatHistory((prev) => [
              ...prev,
              {
                role: "ai",
                text: "Sorry, I was asked to display an image but didn't receive a valid URL.",
              },
            ]);
          }
        } else {
          // Handle unexpected function calls (like googleSearch, though model handles internally)
          // Or other custom functions not yet implemented
          console.warn(
            `Model requested unhandled function: ${functionCall.name}`
          );
          setChatHistory((prev) => [
            ...prev,
            {
              role: "ai",
              text: `The model requested to use the tool "${functionCall.name}", but this action is not currently supported by the interface.`,
            },
          ]);
        }
      } else {
        // If no function calls were returned, display the text response
        setChatHistory((prev) => [
          ...prev,
          { role: "ai", text: result?.text || "No response." },
        ]);
      }
    } catch (err) {
      console.error("Error during sendMessage or function execution:", err); // Log the actual error
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: "An error occurred. Please try again." },
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
            {/* Display user messages */}
            {message.role === "user" && (
              <>
                <strong>אתה:</strong> {message.text}
              </>
            )}
            {/* Display AI text messages */}
            {message.role === "ai" && message.text && (
              <>
                <strong>בוט:</strong> {message.text}
              </>
            )}
            {/* Display AI image messages */}
            {message.role === "ai" && message.imageUrl && (
              <div>
                <strong>בוט:</strong>
                <img
                  src={message.imageUrl}
                  alt="Product"
                  style={{ maxWidth: "200px", marginTop: "10px" }}
                />
              </div>
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
          disabled={!chat} // Disable input if chat not initialized
        />
        <button onClick={handleSendMessage} disabled={!chat}>
          שלח
        </button>{" "}
        {/* Disable button if chat not initialized */}
      </div>
      {!chat && ( // Display message if API key is missing
        <div className="api-key-error">
          Please set your VITE_GEMINI_API_KEY in the .env file.
        </div>
      )}
    </div>
  );
};

export default ChatbotPage;
