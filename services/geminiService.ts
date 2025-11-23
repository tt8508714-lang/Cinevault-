import { GoogleGenAI, Type } from "@google/genai";
import { Movie, QuizQuestion } from "../types";

const apiKey = process.env.API_KEY || ''; // Assumes global env injection
const ai = new GoogleGenAI({ apiKey });

const modelId = "gemini-2.5-flash";

export const generateDailyPicks = async (): Promise<Movie[]> => {
  if (!apiKey) {
    console.warn("No API Key found for Gemini");
    // Fallback for demo if no key
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: "Generate 3 highly rated movie recommendations that are popular right now. Ensure they are diverse. Include a valid YouTube Embed URL if possible, otherwise leave blank.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              year: { type: Type.STRING },
              rating: { type: Type.STRING },
              genre: { type: Type.STRING },
              synopsis: { type: Type.STRING },
              director: { type: Type.STRING },
              trivia: { type: Type.STRING },
              trailerUrl: { type: Type.STRING, description: "YouTube embed URL (e.g. https://www.youtube.com/embed/...) for the trailer" }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    
    // Map to add placeholder images since Gemini text-only doesn't give valid URLs
    return data.map((m: any) => ({
      ...m,
      id: `gen-${Math.random().toString(36).substr(2, 9)}`,
      posterUrl: `https://picsum.photos/seed/${m.title.replace(/\s/g, '')}/300/450`,
      cast: ["Cast info not loaded"],
      // Fallback to a safe demo trailer if Gemini fails to provide a valid one, to ensure the player works
      trailerUrl: m.trailerUrl && m.trailerUrl.includes('youtube.com/embed') 
                  ? m.trailerUrl 
                  : "https://www.youtube.com/embed/EngW7tLk6R8" // Big Buck Bunny as default fallback
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateTrivia = async (topic: string = "General Movies"): Promise<QuizQuestion | null> => {
  if (!apiKey) return null;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Create a fun trivia question about ${topic}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.INTEGER, description: "Index of the correct answer (0-3)" },
            explanation: { type: Type.STRING }
          }
        }
      }
    });
    
    return JSON.parse(response.text || 'null');
  } catch (error) {
    console.error("Trivia Gen Error:", error);
    return null;
  }
};