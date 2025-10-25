
import { GoogleGenAI } from "@google/genai";
import { CVData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const templatePrompts: Record<string, string> = {
  modern: `
- **Layout:** Use a clean, professional, single-column layout.
- **Summary:** Write a "Professional Summary" section.
- **Style:** Emphasize skills and recent experience. Use horizontal rules sparingly to separate major sections. The overall tone should be contemporary and direct.`,
  creative: `
- **Layout:** Get creative with Markdown. You could suggest a two-column feel by using tables or other structures if it looks clean.
- **Summary:** Instead of a formal summary, create a short, engaging "About Me" section (2-3 sentences).
- **Style:** Use visual separators like '---' or even subtle, professional emojis to break up content. Highlight projects or a portfolio prominently. The tone should be energetic and memorable.`,
  classic: `
- **Layout:** Follow a traditional, conservative, single-column format.
- **Objective:** Start with a formal "Career Objective" statement instead of a summary.
- **Style:** Use a clear, chronological order for experience and education. Maintain a highly formal and professional tone. Do not use any icons or visual flair. Prioritize clarity and tradition.`,
};


const buildPrompt = (data: CVData, templateId: string): string => {
  const templateInstructions = templatePrompts[templateId] || templatePrompts['modern'];

  return `
You are an expert career coach and professional resume writer. Your task is to transform the following JSON data into a compelling, professional, and well-formatted Curriculum Vitae (CV) in Markdown format.

**Instructions:**
1.  **Adhere to the selected template style:**
    ${templateInstructions}
2.  **Experience Section:** For each job, rewrite the responsibilities into 3-5 action-oriented bullet points. Start each point with a strong verb (e.g., "Engineered", "Managed", "Accelerated"). Quantify achievements with metrics wherever possible (e.g., "Increased user engagement by 15%").
3.  **General Formatting:** Use standard Markdown for the entire output.
    *   Use a main heading (#) for the person's name.
    *   Use level two headings (##) for sections like "Experience", "Education", and "Skills".
    *   Use bold for job titles and company names.
    *   Use italics for dates and locations.
4.  **Tone:** Maintain a professional, confident, and polished tone throughout, matching the chosen template style.
5.  **Output:** Only output the Markdown for the CV. Do not include any other commentary, introductory text, or the JSON data itself.

**User Data:**
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`
  `;
};


export const generateCV = async (data: CVData, templateId: string): Promise<string> => {
    try {
        const prompt = buildPrompt(data, templateId);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        
        const text = response.text;
        if (text) {
            return text;
        } else {
            throw new Error("Received an empty response from the API.");
        }
    } catch (error) {
        console.error("Error generating CV with Gemini API:", error);
        throw new Error("Failed to generate CV. Please check the console for more details.");
    }
};
