import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API key is not defined in environment variables.");
    }

    // Create embeddings instance
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004", // Fixed model dimension
      apiKey: apiKey,
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title: "Document title", // Optional title
    });

    console.log("Text to be embedded:", text);

    // Get embedding result and safely check its existence
    const result = await embeddings.embedQuery(text);
    if (!result || !Array.isArray(result)) {
      throw new Error("Embedding result or values are undefined.");
    }

   // console.log("Embedding result:", result);
    return result; // Return the embedding values

  } catch (error) {
    console.error("Error getting embedding:", error);
    throw error;
  }
}