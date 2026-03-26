import { GoogleGenAI } from "@google/genai";

async function main() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  console.log("=== Fetching model list ===");

  try {
    const list = await ai.models.list();
    console.log(JSON.stringify(list, null, 2));
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

main();
