import { GoogleGenAI, Type } from "@google/genai";
import axios from "axios";
// import dotenv from "dotenv";
import readline from "readline";
import chalk from "chalk";

// dotenv.config();

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error(
    chalk.red(
      "Error: GEMINI_API_KEY not found in environment variables. Please set it in your .env file."
    )
  );
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
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

// Function to fetch data from the Fake Store API for a specific category
async function fetchCategoryData(category) {
  console.log(`Fetching products for category: "${category}"`);

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
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    console.log(chalk.green("Data fetched successfully!"), response.data);
    return {
      products: response.data.map((p) => ({
        title: p.title,
        price: p.price,
        id: p.id,
      })),
    };
  } catch (err) {
    return {
      error: `Failed to fetch products for category "${category}".`,
    };
  }
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const chat = ai.chats.create({
    model: MODEL_NAME,
    config: {
      tools: [
        {
          functionDeclarations: [getProductsByCategory],
        },
      ],
      systemInstruction:
        "You are a helpful shop assistant chatbot in `Amar Shop`. Use the provided tools to find products based on the user's category requests. If the user asks a question not related to finding products by category, try to answer conversationally or guide them towards product categories. Only use the getProductsByCategory tool for product requests.", // Added clarity
    },
    history: [],
  });

  console.log(chalk.green("Welcome to the Shop Assistant Chatbot!"));
  console.log(
    chalk.yellow(
      "I can help you find products in categories like Electronics, Jewelery, Men's Clothing, and Women's Clothing."
    )
  );
  console.log(chalk.yellow('Type "exit" to end the chat.'));

  while (true) {
    const userPrompt = await new Promise((resolve) =>
      rl.question(chalk.blue("\nYou: "), resolve)
    );

    if (userPrompt.toLowerCase() === "exit") {
      console.log(chalk.red("Exiting chat. Goodbye!"));
      break;
    }

    try {
      // Send the user's message to the model
      const result = await chat.sendMessage({
        message: {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      });

      // Check if the model's response includes function calls
      // Access functionCalls via result.response
      if (result && result.functionCalls && result.functionCalls.length > 0) {
        const functionCall = result.functionCalls[0]; // Assuming only one call for simplicity
        console.log(chalk.cyan(`AI Function Call: ${functionCall.name}`));
        // Access arguments via functionCall.args
        console.log(chalk.cyan("Arguments:"), functionCall.args);

        if (functionCall.name === "getProductsByCategory") {
          let category;
          try {
            // Access category directly from functionCall.args object
            // Check if args exists and contains the category property as a string
            if (
              !functionCall.args ||
              typeof functionCall.args.category !== "string"
            ) {
              throw new Error(
                "Invalid or missing category in function call arguments."
              );
            }
            category = functionCall.args.category;

            console.log(`Attempting to fetch category: "${category}"`);

            // Fetch the category data using the extracted category
            const functionResponseData = await fetchCategoryData(category); // Renamed variable for clarity

            // Send the function response back to the model
            const finalResponseResult = await chat.sendMessage({
              message: {
                role: "model",
                parts: [
                  {
                    functionResponse: {
                      name: "getProductsByCategory",
                      response: functionResponseData, // Pass the actual data/error from the fetch function
                    },
                  },
                ],
              },
            });

            // Output the model's final response (should be text based on the function response)
            // Access text via finalResponseResult.response
            console.log(
              chalk.cyan("AI:"),
              chalk.green(
                finalResponseResult?.text ||
                  "Sorry, I couldn't generate a response based on the product data."
              )
            );
          } catch (err) {
            console.error(
              chalk.red("Error processing function call or fetching data:"),
              err.message
            );
            // Provide a fallback response to the user in case of an error during processing
            console.log(
              chalk.cyan("AI:"),
              chalk.green(
                "Sorry, I encountered an error trying to find products. Please make sure you specify a valid category."
              )
            );
          }
        } else {
          // Handle unexpected function calls if necessary
          console.warn(
            chalk.yellow(
              `AI called an unexpected function: ${functionCall.name}`
            )
          );
          console.log(
            chalk.cyan("AI:"),
            chalk.green(
              "Sorry, I attempted an action I couldn't complete. I can only help you find products by category."
            )
          );
        }
      } else {
        // If no function call was made, the response should be a text response
        // Access text via result.response
        console.log(
          chalk.cyan("AI:"),
          chalk.green(
            result?.text ||
              "Sorry, I didn't understand that. Can you ask about a product category?"
          )
        );
      }
    } catch (err) {
      console.error(
        chalk.red("An unexpected error occurred during chat:"),
        err.message
      );
      console.log(
        chalk.cyan("AI:"),
        chalk.red("An internal error occurred. Please try again.")
      );
    }
  }

  rl.close();
}

main();
