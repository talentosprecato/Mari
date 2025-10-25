
import { GoogleGenAI, Type } from "@google/genai";
import { CVData, CVDataFromAI, SectionId } from "../types";

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
  'ai-content-editor': `
- **Layout:** A modern, hybrid layout that could suggest a two-column feel where one part lists technical skills (Python, APIs, Prompt Engineering, etc.) and the other details content projects.
- **Summary:** A "Profile" section that clearly states expertise in both AI tools and content strategy.
- **Style:** Use clean typography. Incorporate blockquotes or code blocks (\`\`\`) to showcase example prompts or technical writing snippets. The tone should be innovative and expert.`,
  'social-media-creative': `
- **Layout:** A dynamic, visually-oriented layout. Use markdown tables to show key metrics (e.g., Follower Growth, Engagement Rate).
- **Summary:** A punchy "Bio" that reflects a strong personal brand voice.
- **Style:** Incorporate professional emojis or icons subtly to reflect social media fluency. Use bold and italics to create a strong visual hierarchy. The tone should be engaging, trendy, and results-driven.`,
  technical: `
- **Layout:** A clean, information-dense, single-column layout.
- **Key Sections:** Prioritize a "Technical Skills" section at the top, followed by "Experience," and then a "Projects" section.
- **Skills Section:** Structure the skills section with subheadings (e.g., "Languages," "Frameworks & Libraries," "Developer Tools," "Databases").
- **Style:** Use a very clear and scannable format. Use code blocks (\`\`\`) for technical terms or snippets if appropriate. The tone should be precise and technical.`,
  minimalist: `
- **Layout:** A highly simplified single-column layout with generous white space.
- **Typography:** Rely on font weight (bold) and subtle size differences for hierarchy, rather than lines or icons.
- **Style:** Avoid horizontal rules ('---') or any visual separators. The focus is purely on the content. The tone should be elegant, understated, and professional.`,
};

const languageConfig: Record<string, { name: string; narrativeHeading: string }> = {
    en: { name: 'English', narrativeHeading: 'What has made you the professional you are today' },
    it: { name: 'Italiano', narrativeHeading: 'Cosa ti ha reso il professionista che sei oggi' },
    fr: { name: 'Français', narrativeHeading: 'Ce qui a fait de vous le professionnel que vous êtes aujourd\'hui' },
    es: { name: 'Español', narrativeHeading: 'Qué te ha convertido en el profesional que eres hoy' },
    pt: { name: 'Português', narrativeHeading: 'O que fez de você o profissional que é hoje' },
    ru: { name: 'Русский', narrativeHeading: 'Что сделало вас тем профессионалом, которым вы являетесь сегодня' },
    ar: { name: 'العربية', narrativeHeading: 'ما الذي جعلك المحترف الذي أنت عليه اليوم' },
    'it-sal': { name: 'dialetto Salentino (Lecce)', narrativeHeading: 'Ce t\'ha fattu lu professionista ca si moi' },
    'it-sic': { name: 'dialetto Siciliano', narrativeHeading: 'Cosa t\'ha fattu addivintari u prufissiunista ca si oggi' },
};


const buildPrompt = (data: CVData, templateId: string, sectionOrder: SectionId[], language: string): string => {
  const templateInstructions = templatePrompts[templateId] || templatePrompts['modern'];
  
  const capitalizedSectionNames = sectionOrder.map(s => {
    if (s === 'personal') return 'Personal Details';
    if (s === 'professionalNarrative') return 'Professional Narrative';
    if (s === 'video') return 'Video Presentation';
    return s.charAt(0).toUpperCase() + s.slice(1);
  });

  const langConfig = languageConfig[language] || languageConfig['en'];
  const languageName = langConfig.name;
  const narrativeHeading = langConfig.narrativeHeading;

  let languageInstruction = `Generate the entire CV in **${languageName}**. All section headings (e.g., "Experience") and all content must be in this language.`;
  if (language === 'it-sal') {
      languageInstruction = `Generate the entire CV in the **Salentino dialect from the Lecce region of Italy**. While using the dialect, ensure the structure and headings are professional and understandable, perhaps using standard Italian for main headings if the dialect form is not common (e.g., "Esperienza"). All content must be in this dialect.`;
  } else if (language === 'it-sic') {
      languageInstruction = `Generate the entire CV in the **Sicilian dialect of Italy**. While using the dialect, ensure the structure and headings are professional and understandable, perhaps using standard Italian for main headings if the dialect form is not common (e.g., "Esperienza"). All content must be in this dialect.`;
  }

  return `
You are an expert career coach and professional resume writer. Your task is to transform the following JSON data into a compelling, professional, and well-formatted Curriculum Vitae (CV) in Markdown format.

**Instructions:**
1.  **Language**: ${languageInstruction}
2.  **Generate sections in this specific order:** ${capitalizedSectionNames.join(', ')}. This is a critical instruction.
3.  **Adhere to the selected template style:**
    ${templateInstructions}
4.  **Experience Section:** For each job, rewrite the responsibilities into 3-5 action-oriented bullet points. Start each point with a strong verb (e.g., "Engineered", "Managed", "Accelerated"). Quantify achievements with metrics wherever possible (e.g., "Increased user engagement by 15%").
5.  **Professional Narrative Section:** If the 'professionalNarrative' field exists and is not empty, create a section with the heading "## ${narrativeHeading}" and place the user's text below it.
6.  **Video Presentation Section:** If the 'videoUrl' field exists and is not empty, simply add a section with the heading "## Video Presentation" and the text "A video introduction is available and has been attached to this application." Do not try to render the URL.
7.  **General Formatting:** Use standard Markdown for the entire output.
    *   Use a main heading (#) for the person's name.
    *   Use level two headings (##) for sections.
    *   Use bold for job titles and company names.
    *   Use italics for dates and locations.
8.  **Tone:** Maintain a professional, confident, and polished tone throughout, matching the chosen template style and language.
9.  **Output:** Only output the Markdown for the CV. Do not include any other commentary, introductory text, or the JSON data itself.

**User Data:**
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`
  `;
};


export const generateCV = async (data: CVData, templateId: string, sectionOrder: SectionId[], language: string): Promise<string> => {
    try {
        const prompt = buildPrompt(data, templateId, sectionOrder, language);
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

const cvDataSchema = {
    type: Type.OBJECT,
    properties: {
        personal: {
            type: Type.OBJECT,
            properties: {
                fullName: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                address: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                website: { type: Type.STRING },
            },
            required: ['fullName', 'email']
        },
        experience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    jobTitle: { type: Type.STRING },
                    company: { type: Type.STRING },
                    location: { type: Type.STRING },
                    startDate: { type: Type.STRING, description: 'Format as YYYY-MM' },
                    endDate: { type: Type.STRING, description: 'Format as YYYY-MM or "Present"' },
                    responsibilities: { type: Type.STRING, description: 'A string with newline-separated bullet points, starting with -' },
                },
                required: ['jobTitle', 'company', 'startDate', 'endDate', 'responsibilities']
            }
        },
        education: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    degree: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    location: { type: Type.STRING },
                    startDate: { type: Type.STRING, description: 'Format as YYYY-MM' },
                    endDate: { type: Type.STRING, description: 'Format as YYYY-MM' },
                    details: { type: Type.STRING },
                },
                required: ['degree', 'institution', 'startDate', 'endDate']
            }
        },
        skills: {
            type: Type.STRING,
            description: 'A comma-separated list of skills.'
        },
        projects: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    technologies: { type: Type.STRING, description: 'A comma-separated list of technologies.' },
                    link: { type: Type.STRING },
                    description: { type: Type.STRING, description: 'A string with newline-separated bullet points, starting with -' },
                },
                required: ['name', 'technologies', 'description']
            }
        },
        certifications: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    issuingOrganization: { type: Type.STRING },
                    date: { type: Type.STRING, description: 'Format as YYYY-MM' },
                },
                required: ['name', 'issuingOrganization', 'date']
            }
        },
        professionalNarrative: {
            type: Type.STRING,
            description: 'A paragraph or two describing the user\'s professional journey and philosophy.'
        },
        videoUrl: {
             type: Type.STRING,
             description: 'A URL to a video presentation, if found in the CV.'
        }
    },
    required: ['personal', 'experience', 'education', 'skills']
};


// Helper function to convert a File object to a GoogleGenAI.Part object.
const fileToGenerativePart = (file: File): Promise<{mimeType: string, data: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as base64 string"));
      }
      // The result looks like "data:image/jpeg;base64,..."
      // We need to remove the "data:mime/type;base64," prefix.
      const base64Data = reader.result.split(',')[1];
      resolve({
        mimeType: file.type,
        data: base64Data,
      });
    };
    reader.onerror = error => reject(error);
  });
};


export const parseAndEnhanceCVFromFile = async (file: File, language: string): Promise<CVDataFromAI> => {
    const langConfig = languageConfig[language] || languageConfig['en'];
    const languageName = langConfig.name;

    let languageInstructionForParse = `**Crucially, translate and write all output text (job titles, responsibilities, descriptions, etc.) into ${languageName}. The final JSON object should contain only text in ${languageName}.**`;
    if (language === 'it-sal') {
        languageInstructionForParse = `**Crucially, translate and write all output text (job titles, responsibilities, descriptions, etc.) into the Salentino dialect (Lecce). The final JSON object should contain only text in this dialect.**`;
    } else if (language === 'it-sic') {
        languageInstructionForParse = `**Crucially, translate and write all output text (job titles, responsibilities, descriptions, etc.) into the Sicilian dialect. The final JSON object should contain only text in this dialect.**`;
    }

    const prompt = `
You are an expert CV parser and career coach. Your task is to analyze the following uploaded CV file, extract all relevant information, enhance it, and structure it into a valid JSON object in the specified language.

**Instructions:**
1.  **Parse Thoroughly:** Read the document and identify information for the following sections: Personal Details, Work Experience, Education, Skills, Projects, Certifications, a professional summary or narrative, and any links to video presentations.
2.  **Enhance Content & Language:**
    *   For each work experience entry, rewrite the responsibilities into action-oriented bullet points (e.g., "Led a team..." instead of "Was responsible for leading...").
    *   If you find a summary, objective, or "About Me" section, place that content into the 'professionalNarrative' field.
    *   If you find a link to a video (e.g., Loom, YouTube), place the URL in the 'videoUrl' field.
    *   Ensure the tone is professional and confident.
    *   Standardize date formats to YYYY-MM where possible. Use "Present" for ongoing roles.
    *   ${languageInstructionForParse}
3.  **Structure Output:** Format the extracted and enhanced data strictly according to the provided JSON schema. Do not include any extra fields or text outside of the JSON object. Fill in fields with empty strings if no information is found. For array fields like experience, projects, etc., return an empty array if none are found.
4.  **Handle Missing Data:** If a section (like a website or LinkedIn profile) is not present in the text, omit the field or leave it as an empty string.
`;

    try {
        const filePart = await fileToGenerativePart(file);
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: filePart }
                ]
            }],
            config: {
                responseMimeType: "application/json",
                responseSchema: cvDataSchema
            }
        });

        const jsonText = response.text;
        if (!jsonText) {
            throw new Error("Received an empty response from the API.");
        }
        
        return JSON.parse(jsonText) as CVDataFromAI;

    } catch (error) {
        console.error("Error parsing CV with Gemini API:", error);
        throw new Error("Failed to parse CV. The AI could not process the provided file.");
    }
};
