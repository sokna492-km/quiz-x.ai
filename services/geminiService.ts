
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Subject, Difficulty, Quiz } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateQuiz(
  subject: Subject,
  difficulty: Difficulty,
  language: Language
): Promise<Quiz> {
  const languageNames = {
    en: "English",
    km: "Khmer",
    th: "Thai",
    vi: "Vietnamese"
  };

  const prompt = `Generate a 10-question comprehensive quiz for ${subject} at ${difficulty} difficulty level in ${languageNames[language]} language. 
  Include a mix of standard multiple-choice questions and "fill-in-the-blank" style questions (where the question text contains a blank "____" and the options are possible words to complete it).
  Ensure all questions are educationally accurate and challenging for the selected level.
  Each question must have exactly 4 options and a detailed educational explanation in ${languageNames[language]}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["text", "options", "correctIndex", "explanation"]
            }
          }
        },
        required: ["title", "questions"]
      }
    }
  });

  const rawData = JSON.parse(response.text || "{}");
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    title: rawData.title || `${subject} - ${difficulty}`,
    subject,
    difficulty,
    language,
    questions: (rawData.questions || []).map((q: any, idx: number) => ({
      ...q,
      id: `q-${idx}`
    })),
    // Adjusted durations for 10 questions: Easy (10m), Medium (20m), Hard (30m)
    durationSeconds: difficulty === 'easy' ? 600 : difficulty === 'medium' ? 1200 : 1800,
    createdAt: Date.now()
  };
}
