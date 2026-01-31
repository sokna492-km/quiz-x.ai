
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

  const prompt = `Generate a 10-question comprehensive and diverse quiz for ${subject} at ${difficulty} difficulty level in ${languageNames[language]} language. 
  
  You MUST include a balanced mix of the following 4 question types:
  1. Conceptual Multiple-Choice: Standard conceptual questions.
  2. Fill-in-the-blank: Use "____" in the question text. Options are words to complete it.
  3. True/False: The question is a statement. Option index 0 must be "True" and index 1 must be "False" (translated appropriately).
  4. Matching/Sequence: List item sets in the question (e.g. 1. A, 2. B) and provide mapping combinations in the options (e.g. A: 1-X, 2-Y).

  Requirements:
  - Language: All content (title, questions, options, explanations) MUST be in ${languageNames[language]}.
  - Structure: Exactly 4 options for every question.
  - Accuracy: Scientifically and educationally accurate for the ${difficulty} level.
  - Explanation: Provide a detailed, helpful pedagogical explanation for each answer.`;

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
                type: { 
                  type: Type.STRING, 
                  description: "One of: multiple-choice, true-false, fill-in-the-blank, matching" 
                },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["text", "options", "correctIndex", "explanation", "type"]
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
      id: `q-${idx}`,
      type: q.type || 'multiple-choice'
    })),
    durationSeconds: difficulty === 'easy' ? 600 : difficulty === 'medium' ? 1200 : 1800,
    createdAt: Date.now()
  };
}
