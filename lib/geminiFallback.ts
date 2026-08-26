import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Urutan prioritas model (dari yang paling pintar ke model cepat/hemat)
const MODEL_CASCADE = [
  "gemini-2.5-flash", // Kuota jauh lebih besar (~1,500 RPD)
  "gemini-2.5-flash-lite", // Sangat cepat dan kuota luas
  "gemini-3.5-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash", // Kuota preview (20 RPD)
];

export async function generateWithFallback({
  prompt,
  config,
}: {
  prompt: string;
  config?: any;
}) {
  let lastError: any = null;

  for (const model of MODEL_CASCADE) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      if (response.text) {
        return { text: response.text, usedModel: model };
      }
    } catch (error: any) {
      console.warn(
        `[Gemini Quota] Model ${model} limit/error: ${error.message || error}. Trying next model...`,
      );
      lastError = error;
      // Lanjut ke model berikutnya dalam loop
    }
  }

  throw new Error(
    `All Gemini models exhausted or failed. Last error: ${lastError?.message || lastError}`,
  );
}
