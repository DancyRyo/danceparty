
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateDancerPersona(description: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `This user just drew a shape for a dance party. It looks like a ${description}. Give it a fun dancer name and a short "catchphrase" describing its dance move.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            catchphrase: { type: Type.STRING },
            vibe: { type: Type.STRING }
          },
          required: ["name", "catchphrase", "vibe"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini failed, using fallback:", error);
    return {
      name: "Neon Dancer",
      catchphrase: "Ready to Groove!",
      vibe: "Energetic"
    };
  }
}
