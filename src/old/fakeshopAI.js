import { google } from "@ai-sdk/google";
import { xai } from "@ai-sdk/xai";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText, tool } from "ai";
import axios from "axios";
import readline from "readline";
import chalk from "chalk";
import { z } from "zod";

const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17";
const XAI_MODEL_NAME = "grok-3";
const ANTHROPIC_MODEL_NAME = "claude-3-5-sonnet-latest";

const systemInstruction = `You are a helpful shop assistant chatbot in Amar Shop.
 Use the provided tools to find products based on the user's category requests.
  If the user asks a question not related to finding products by category, try to answer conversationally or guide them towards product categories. 
  Only use the getProductsByCategory tool for product requests.`;

const validFakeStoreCategories = [
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing",
];

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
    console.log(chalk.green("Data fetched successfully!"));
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

  console.log(chalk.green("Welcome to the Shop Assistant Chatbot!"));
  console.log(
    chalk.yellow(
      "I can help you find products in categories like Electronics, Jewelery, Men's Clothing, and Women's Clothing."
    )
  );
  console.log(chalk.yellow('Type "exit" to end the chat.'));

  const messages = []; // Initialize conversation history
  while (true) {
    const userPrompt = await new Promise((resolve) =>
      rl.question(chalk.blue("\nYou: "), resolve)
    );

    if (userPrompt.toLowerCase() === "exit") {
      console.log(chalk.red("Exiting chat. Goodbye!"));
      break;
    }
    messages.push({
      role: "user",
      content: userPrompt,
    }); // Add the user's input to the conversation history

    // Send the user's message to the model
    const result = await generateText({
      // model: xai(XAI_MODEL_NAME),
      model: anthropic(ANTHROPIC_MODEL_NAME),
      // model: google(GEMINI_MODEL_NAME),
      system: systemInstruction,
      messages: messages,
      tools: {
        getProductsByCategory: tool({
          name: "getProductsByCategory",
          description: `Fetches products from the Fake Store API based on a category.`,
          parameters: z.object({
            category: z.enum(validFakeStoreCategories),
          }),
          execute: async ({ category }) => {
            // Call the function to fetch data from the Fake Store API
            const data = await fetchCategoryData(category);
            return data; // Return the fetched data or error message
          },
        }),
      },
      maxSteps: 2,
    });

    // Check if the model's response includes function calls
    // Access functionCalls via result.response
    if (result && result.toolCalls && result.toolCalls.length > 0) {
      const toolCall = result.toolCalls[0]; // Assuming only one call for simplicity
      console.log(chalk.cyan(`AI Function Call: ${toolCall.toolName}`));
      console.log(chalk.cyan("Arguments:"), toolCall.args);

      messages.push({
        role: "assistant",
        content:
          `AI Function Call: ${toolCall.toolName}` +
          "\nArguments: " +
          JSON.stringify(toolCall.args, null, 2),
      }); // Add the function call to the conversation history

      //   if (toolCall.name === "getProductsByCategory") {
      //     let category;
      //     try {
      //       // Access category directly from functionCall.args object
      //       // Check if args exists and contains the category property as a string
      //       if (!toolCall.args || typeof toolCall.args.category !== "string") {
      //         throw new Error(
      //           "Invalid or missing category in function call arguments."
      //         );
      //       }
      //       category = toolCall.args.category;

      //       console.log(`Attempting to fetch category: "${category}"`);

      //       console.log(
      //         chalk.cyan("AI:"),
      //         chalk.green(
      //           result.text ||
      //             "Sorry, I couldn't generate a response based on the product data."
      //         )
      //       );
      //     } catch (err) {
      //       console.error(
      //         chalk.red("Error processing function call or fetching data:"),
      //         err.message
      //       );
      //       // Provide a fallback response to the user in case of an error during processing
      //       console.log(
      //         chalk.cyan("AI:"),
      //         chalk.green(
      //           "Sorry, I encountered an error trying to find products. Please make sure you specify a valid category."
      //         )
      //       );
      //     }
      //   } else {
      //     // Handle unexpected function calls if necessary
      //     console.warn(
      //       chalk.yellow(`AI called an unexpected function: ${toolCall.name}`)
      //     );
      //     console.log(
      //       chalk.cyan("AI:"),
      //       chalk.green(
      //         "Sorry, I attempted an action I couldn't complete. I can only help you find products by category."
      //       )
      //     );
      //   }
      // } else {
      //   // If no function call was made, the response should be a text response
      //   // Access text via result.response
      //   console.log(
      //     chalk.cyan("AI:"),
      //     chalk.green(
      //       result?.text ||
      //         "Sorry, I didn't understand that. Can you ask about a product category?"
      //     )
      //   );
    }
    console.log(chalk.cyan("AI:"), chalk.green(result?.text || "No response."));
    messages.push({
      role: "assistant",
      content: result?.text || "No response.",
    }); // Add the AI's response to the conversation history
    console.log({ messages });
  }

  rl.close();
}

main();
