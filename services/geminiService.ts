import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";
import { CVData, CVDataFromAI, SectionId, JobSuggestion } from "../types";

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
  'two-column-professional': `
- **Layout:** Use a two-column Markdown table for the main body of the CV.
- **Structure:**
    - The **left column** (wider) should contain: Experience, Education, Projects, Professional Narrative.
    - The **right column** (narrower) should contain: Personal contact details (email, phone, address, links), Skills, Certifications.
- **Header:** The Full Name should be a level 1 heading (#) at the very top, before the table structure, unless a photo is included (see photo instructions).
- **Table Usage:** You MUST use a markdown table to create this layout. It's the only way the styling will work.
- **Example:**
    # Jane Doe
    > A brief professional summary or the professional narrative here.
    | | |
    |---|---|
    | <!-- section:experience --> ## Experience ... | <!-- section:personal --> ### Contact ... <br> <!-- section:skills --> ## Skills ... <br> <!-- section:certifications --> ## Certifications ... |
- **Style:** Professional and clean. Use headings within the table cells to delineate sections. The overall tone should be modern and efficient.`,
  'two-column-creative': `
- **Layout:** Use a two-column Markdown table.
- **Structure:**
    - The **left column** (narrower, ~35%) should contain: Personal contact details (email, phone, address, links), Skills, Certifications.
    - The **right column** (wider, ~65%) should contain: The Full Name as a level 1 heading, a creative "Bio" or summary, Experience, Education, Projects.
- **Header:** The Full Name should be a level 1 heading (#) at the top of the right column.
- **Style:** Modern and creative. Use bold for emphasis and possibly subtle visual separators like '---' within the right column to break up long sections. The tone should be energetic and showcase personality.
- **Example:**
    | | |
    |---|---|
    | <!-- section:personal --> ### Contact ... <br> <!-- section:skills --> ## Skills ... <br> <!-- section:certifications --> ## Certifications ... | # Jane Doe <br> > Creative Bio... <br><br> <!-- section:experience --> ## Experience ... |`,
  creative: `
- **Layout:** Get creative with Markdown. You could suggest a two-column feel by using tables or other structures if it looks clean.
- **Summary:** Instead of a formal summary, create a short, engaging "About Me" section (2-3 sentences).
- **Style:** Use visual separators like '---' or even subtle, professional emojis to break up content. Highlight projects or a portfolio prominently. The tone should be energetic and memorable.`,
  classic: `
- **Layout:** Follow a traditional, conservative, single-column format.
- **Objective:** Start with a formal "Career Objective" statement instead of a summary.
- **Style:** Use a clear, chronological order for experience and education. Maintain a highly formal and professional tone. Do not use any icons or visual flair. Prioritize clarity and tradition.`,
  'eu-cv': `
- **Title:** The document must start with the title "Curriculum Vitae" at the top.
- **Layout:** Use a very clean, structured, single-column layout. Prioritize clarity and completeness.
- **Sections:** The CV should follow this strict order of sections:
    1. **Personal Information:** Include Full Name, Address, Telephone, Email, and links (Website/LinkedIn).
    2. **Work Experience:** List in reverse chronological order. For each entry, include dates, occupation/position held, main activities and responsibilities, and employer name and location.
    3. **Education and Training:** List in reverse chronological order. For each entry, include dates, title of qualification awarded, principal subjects/occupational skills covered, and the name and location of the organisation providing education or training.
    4. **Personal Skills:** This section should be divided into sub-sections:
        - **Mother tongue(s)**
        - **Other language(s):** Use a simple description for proficiency (e.g., "Proficient", "Intermediate", "Basic").
        - **Communication skills**
        - **Organisational / managerial skills**
        - **Digital skills**
- **Style:** The tone must be formal and professional. Use bold for titles and employers/institutions. Do not use any icons, tables for layout, or creative visual elements. The focus is on a standardized, easy-to-read format.`,
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

const languageConfig: Record<string, { name: string; narrativeHeading: string; gdprConsent: string; }> = {
    en: { name: 'English', narrativeHeading: 'What has made you the professional you are today', gdprConsent: 'I authorize the processing of my personal data contained in this CV in accordance with EU Regulation 2016/679 (GDPR), exclusively for personnel selection purposes.' },
    it: { name: 'Italiano', narrativeHeading: 'Cosa ti ha reso il professionista che sei oggi', gdprConsent: 'Acconsento al trattamento dei miei dati personali contenuti nel presente curriculum vitae ai sensi del Regolamento UE 2016/679 (GDPR), esclusivamente per finalità di selezione del personale.' },
    fr: { name: 'Français', narrativeHeading: 'Ce qui a fait de vous le professionnel que vous êtes aujourd\'hui', gdprConsent: 'J\'autorise le traitement de mes données personnelles contenues dans ce curriculum vitae conformément au Règlement UE 2016/679 (RGPD), exclusivement à des fins de sélection du personnel.' },
    es: { name: 'Español', narrativeHeading: 'Qué te ha convertido en el profesional que eres hoy', gdprConsent: 'Autorizo el tratamiento de mis datos personales contenidos en este currículum vitae de conformidad con el Reglamento de la UE 2016/679 (RGPD), exclusivamente para fines de selección de personal.' },
    pt: { name: 'Português', narrativeHeading: 'O que fez de você o profissional que é hoje', gdprConsent: 'Autorizo o tratamento dos meus dados pessoais contidos neste currículo vitae nos termos do Regulamento da UE 2016/679 (RGPD), exclusivamente para fins de seleção de pessoal.' },
    ru: { name: 'Русский', narrativeHeading: 'Что сделало вас тем профессионалом, которым вы являетесь сегодня', gdprConsent: 'Я даю согласие на обработку моих персональных данных, содержащихся в этом резюме, в соответствии с Регламентом ЕС 2016/679 (GDPR) исключительно в целях отбора персонала.' },
    ar: { name: 'العربية', narrativeHeading: 'ما الذي جعلك المحترف الذي أنت عليه اليوم', gdprConsent: 'أوافق على معالجة بياناتي الشخصية الواردة في هذه السيرة الذاتية وفقًا للائحة الاتحاد الأوروبي 2016/679 (GDPR)، وذلك لغرض اختيار الموظفين فقط.' },
    tr: { name: 'Türkçe', narrativeHeading: 'Sizi bugünkü profesyonel yapan nedir', gdprConsent: 'Bu CV\'de yer alan kişisel verilerimin, yalnızca personel seçimi amacıyla AB Yönetmeliği 2016/679\'a (GDPR) uygun olarak işlenmesine izin veriyorum.' },
    az: { name: 'Azərbaycanca', narrativeHeading: 'Sizi bugünkü peşəkar edən nədir', gdprConsent: 'Bu CV-də olan şəxsi məlumatlarımın, yalnız kadr seçimi məqsədləri üçün AB Qaydası 2016/679 (GDPR) uyğun olaraq işlənməsinə icazə verirəm.' },
    'it-sal': { name: 'dialetto Salentino (Lecce)', narrativeHeading: 'Ce t\'ha fattu lu professionista ca si moi', gdprConsent: 'Tau lu cunsensu al trattamentu te li dati mei personali scritti \'ntra stu curriculum vitae comu dice lu Regolamentu UE 2016/679 (GDPR), sulu pe la selezione te lu personale.' },
    'it-sic': { name: 'dialetto Siciliano', narrativeHeading: 'Cosa t\'ha fattu addivintari u prufissiunista ca si oggi', gdprConsent: 'Dugnu u cunsensu pû trattamentu di li me dati pirsunali ca su scritti \'nta stu curriculum vitae secunnu u Regolamentu UE 2016/679 (GDPR), sulu pi scopi di silizzioni di pirsunali.' },
    'it-par': { name: 'dialetto Parmigiano', narrativeHeading: 'Csa t\'ha fat dvintär al professionesta che t\'si adesa', gdprConsent: 'A dagh al me consèns al trattament di me dat personäl contenù in \'stò curriculum vitae second al Regolament UE 2016/679 (GDPR), solament par la selesjón dal personäl.' },
    'it-abr': { name: 'dialetto Abruzzese', narrativeHeading: 'Che t\'ha fatte addevendà lu professioniste che si mo\'', gdprConsent: 'Doche lu consense a lu trattamende de li date personal meje che šta \'nghe stu curriculum vitae seconde a lu Regolamende UE 2016/679 (GDPR), sulamende pe la selezione de lu personale.' },
};


const buildPrompt = (data: CVData, templateId: string, sectionOrder: SectionId[], language: string, photoAlignment: string): string => {
  const templateInstructions = templatePrompts[templateId] || templatePrompts['modern'];
  
  const capitalizedSectionNames = sectionOrder.map(s => {
    if (s === 'personal') return 'Personal Details';
    if (s === 'professionalNarrative') return 'Professional Narrative';
    if (s === 'jobSearch' || s === 'portfolio' || s === 'signature') return ''; // Don't include these in the AI prompt section order
    return s.charAt(0).toUpperCase() + s.slice(1);
  }).filter(Boolean);

  const langConfig = languageConfig[language] || languageConfig['en'];
  const languageName = langConfig.name;
  const narrativeHeading = langConfig.narrativeHeading;
  const gdprConsentText = langConfig.gdprConsent;

  let languageInstruction = `Generate the entire CV in **${languageName}**. All section headings (e.g., "Experience") and all content must be in this language.`;
  if (language === 'it-sal') {
      languageInstruction = `Generate the entire CV in the **Salentino dialect from the Lecce region of Italy**. While using the dialect, ensure the structure and headings are professional and understandable, perhaps using standard Italian for main headings if the dialect form is not common (e.g., "Esperienza"). All content must be in this dialect.`;
  } else if (language === 'it-sic') {
      languageInstruction = `Generate the entire CV in the **Sicilian dialect of Italy**. While using the dialect, ensure the structure and headings are professional and understandable, perhaps using standard Italian for main headings if the dialect form is not common (e.g., "Esperienza"). All content must be in this dialect.`;
  } else if (language === 'it-par') {
      languageInstruction = `Generate the entire CV in the **Parmigiano dialect of Italy**. While using the dialect, ensure the structure and headings are professional and understandable, perhaps using standard Italian for main headings if the dialect form is not common (e.g., "Esperienza"). All content must be in this dialect.`;
  } else if (language === 'it-abr') {
      languageInstruction = `Generate the entire CV in the **Abruzzese dialect of Italy**. While using the dialect, ensure the structure and headings are professional and understandable, perhaps using standard Italian for main headings if the dialect form is not common (e.g., "Esperienza"). All content must be in this dialect.`;
  }
  
  let photoInstruction = '';
  const PHOTO_PLACEHOLDER = '--CV-PHOTO-PLACEHOLDER--';
  if (data.personal.photo && photoAlignment !== 'none') {
      const contactInfo = [data.personal.email, data.personal.phone, data.personal.residence, data.personal.linkedin, data.personal.website].filter(Boolean).join(' <br> ');
      const headerText = `# ${data.personal.fullName} <br> ${contactInfo}`;
      const photoMarkdown = `![Profile Photo](${PHOTO_PLACEHOLDER})`;
      
      const table = photoAlignment === 'right' 
        ? `| ${headerText} | ${photoMarkdown} |` 
        : `| ${photoMarkdown} | ${headerText} |`;

      photoInstruction = `
**Photo Inclusion & Header:**
- A user photo is provided. You MUST include it and the main header (Full Name, contact info) in a two-column markdown table at the very top of the document. This overrules any other header instruction.
- **Use this exact Markdown structure for the header table**:
| | |
|---|---|
${table}
`;
  }

  let signatureInstruction = '';
  const SIGNATURE_PLACEHOLDER = '--CV-SIGNATURE-PLACEHOLDER--';
  if (data.signature) {
      signatureInstruction = `**Signature:** At the very end of the CV, after all other content, create a new section with the heading \`## Signature\`. Below this heading, you MUST place the user's signature using this exact markdown: \`![Signature](${SIGNATURE_PLACEHOLDER})\``;
  }

  // Create a copy of the data without image data to avoid exceeding token limits in the JSON part of the prompt.
  const dataForPrompt = {
    ...data,
    personal: {
      ...data.personal,
      photo: data.personal.photo ? 'USER_PHOTO_PROVIDED' : '',
    },
    signature: data.signature ? 'USER_SIGNATURE_PROVIDED' : '',
  };


  return `
You are an expert career coach and professional resume writer. Your task is to transform the following JSON data into a compelling, professional, and well-formatted Curriculum Vitae (CV) in Markdown format.

**Instructions:**

1.  **Language**: ${languageInstruction}

${photoInstruction}

2.  **Section Markers (CRITICAL):** Before each major section heading (like \`## Experience\`), you MUST insert a special HTML comment to identify the section, like \`<!-- section:experience -->\`. Use the following keys: \`personal\`, \`experience\`, \`education\`, \`skills\`, \`projects\`, \`certifications\`, \`professionalNarrative\`. This is crucial for styling and must be included.
    *   Example for Experience section: \`<!-- section:experience -->\n## Experience\`
    *   Example for Skills section: \`<!-- section:skills -->\n## Skills\`

3.  **Generate sections in this specific order:** ${capitalizedSectionNames.join(', ')}. This is a critical instruction.

4.  **Adhere to the selected template style:**
    ${templateInstructions}

5.  **Experience Section:** For each job, rewrite the responsibilities into 3-5 action-oriented bullet points. Start each point with a strong verb (e.g., "Engineered", "Managed", "Accelerated"). Quantify achievements with metrics wherever possible (e.g., "Increased user engagement by 15%").

6.  **Personal Details:** In the contact information area, include all provided links (LinkedIn, Website, GitHub, Twitter, and the list in 'socialLinks'). Format them cleanly. For the 'socialLinks' array, create a single line of pipe-separated links, like: [Facebook](url) | [Instagram](url).

7.  **Professional Narrative Section:** If the 'professionalNarrative' field exists and is not empty, create a section with the heading "## ${narrativeHeading}" and place the user's text below it. Remember to include its section marker: \`<!-- section:professionalNarrative -->\`.

8.  **General Formatting:** Use standard Markdown for the entire output.
    *   Use a main heading (#) for the person's name (unless a photo is included, then follow the photo instructions).
    *   Use level two headings (##) for sections.
    *   Use bold for job titles and company names.
    *   Use italics for dates and locations.

9. **Tone:** Maintain a professional, confident, and polished tone throughout, matching the chosen template style and language.

10. ${signatureInstruction || '**Signature:** No signature provided.'}

11. **Privacy Consent:** At the very bottom of the document, after everything else (including the signature), you MUST add the following privacy consent statement. Format it in small, italic text: *${gdprConsentText}*

12. **Output:** Only output the Markdown for the CV. Do not include any other commentary, introductory text, or the JSON data itself.

**User Data:**
\`\`\`json
${JSON.stringify(dataForPrompt, null, 2)}
\`\`\`
  `;
};


export async function* generateCV(
    data: CVData, 
    templateId: string, 
    sectionOrder: SectionId[], 
    language: string, 
    photoAlignment: string
): AsyncGenerator<string> {
    try {
        const PHOTO_PLACEHOLDER = '--CV-PHOTO-PLACEHOLDER--';
        const SIGNATURE_PLACEHOLDER = '--CV-SIGNATURE-PLACEHOLDER--';
        const originalPhoto = data.personal.photo;
        const originalSignature = data.signature;
        
        const prompt = buildPrompt(data, templateId, sectionOrder, language, photoAlignment);
        
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        
        for await (const chunk of responseStream) {
            let text = chunk.text;
            if (text) {
                // After getting the response, replace the placeholders with the original data.
                if (originalPhoto) {
                    text = text.replace(new RegExp(PHOTO_PLACEHOLDER, 'g'), originalPhoto);
                }
                if (originalSignature) {
                    text = text.replace(new RegExp(SIGNATURE_PLACEHOLDER, 'g'), originalSignature);
                }
                yield text;
            }
        }
    } catch (error) {
        console.error("Error generating CV with Gemini API:", error);
        throw new Error("Failed to generate CV. Please check the console for more details.");
    }
};

export const generateVideoScript = async (data: CVData, language: string): Promise<string> => {
    const langConfig = languageConfig[language] || languageConfig['en'];
    const languageName = langConfig.name;

    // Exclude image data from the data sent to the model to reduce token count.
    const { photo, ...personalDetailsWithoutPhoto } = data.personal;
    const dataForPrompt = {
        personal: personalDetailsWithoutPhoto,
        experience: data.experience,
        projects: data.projects,
        professionalNarrative: data.professionalNarrative,
        signature: '', // Exclude signature from this prompt
    };

    const prompt = `
You are an expert career coach. Your task is to write a short, compelling, and professional video script for a user based on their CV data.

**Instructions:**
1.  **Objective:** Create a script that is approximately 40 seconds long when spoken at a natural pace (around 100-120 words).
2.  **Language:** Write the entire script in **${languageName}**.
3.  **Structure:** The script should have three parts:
    *   **Introduction:** A brief, engaging opening (e.g., "Hello, I'm [Full Name]...").
    *   **Core Message:** Highlight their main area of expertise and mention one key achievement from their experience or projects that demonstrates their value. Use quantifiable results if available.
    *   **Closing:** A short, forward-looking statement that concludes by prompting the user to state their goal. It should end with a clear placeholder like "[State your desired role or the type of company you're targeting here]". The text inside the brackets should be translated to the target language.
4.  **Tone:** The tone should be confident, authentic, and professional.
5.  **Output:** Provide only the raw script text. Do not include any headings, introductory phrases like "Here's the script:", or markdown formatting. The output should be ready to be copy-pasted into a teleprompter.

**User CV Data:**
\`\`\`json
${JSON.stringify(dataForPrompt, null, 2)}
\`\`\`
`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        
        const text = response.text;
        if (text) {
            return text;
        } else {
            throw new Error("Received an empty script response from the API.");
        }
    } catch (error) {
        console.error("Error generating video script with Gemini API:", error);
        throw new Error("Failed to generate video script.");
    }
};

export const startLiveTranscriptionSession = (
    onMessage: (message: LiveServerMessage) => void,
    onError: (e: Event) => void,
    language: string
) => {
    const langConfig = languageConfig[language] || languageConfig['en'];
    const languageName = langConfig.name;

    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => { console.log('Live session opened for transcription.'); },
            onmessage: onMessage,
            onerror: onError,
            onclose: () => { console.log('Live session closed.'); },
        },
        config: {
            responseModalities: [Modality.AUDIO], 
            inputAudioTranscription: {},
            systemInstruction: `You are a live transcriber. Your only task is to accurately transcribe the user's speech in ${languageName}. Do not respond or generate any other content.`,
        },
    });
    return sessionPromise;
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
                dateOfBirth: { type: Type.STRING, description: 'Format as YYYY-MM-DD' },
                placeOfBirth: { type: Type.STRING },
                residence: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                website: { type: Type.STRING },
                github: { type: Type.STRING },
                twitter: { type: Type.STRING },
                photo: { type: Type.STRING, description: 'The photo field should always be an empty string, as images are not processed from files.' },
                socialLinks: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            platform: { type: Type.STRING },
                            url: { type: Type.STRING }
                        }
                    }
                }
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
        portfolio: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    link: { type: Type.STRING },
                    imageUrl: { type: Type.STRING },
                    description: { type: Type.STRING },
                },
                required: ['title', 'link', 'description']
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
    } else if (language === 'it-par') {
        languageInstructionForParse = `**Crucially, translate and write all output text (job titles, responsibilities, descriptions, etc.) into the Parmigiano dialect. The final JSON object should contain only text in this dialect.**`;
    } else if (language === 'it-abr') {
        languageInstructionForParse = `**Crucially, translate and write all output text (job titles, responsibilities, descriptions, etc.) into the Abruzzese dialect. The final JSON object should contain only text in this dialect.**`;
    }

    const prompt = `
You are an expert CV parser and career coach. Your task is to analyze the following uploaded CV file, extract all relevant information, enhance it, and structure it into a valid JSON object in the specified language.

**Instructions:**
1.  **Parse Thoroughly:** Read the document and identify information for the following sections: Personal Details, Work Experience, Education, Skills, Projects, Certifications, a professional summary or narrative, and any links to video presentations. If a photo is present, you MUST ignore it; do not attempt to process or include it in the JSON.
2.  **Enhance Content & Language:**
    *   For each work experience entry, rewrite the responsibilities into action-oriented bullet points (e.g., "Led a team..." instead of "Was responsible for leading...").
    *   If you find a summary, objective, or "About Me" section, place that content into the 'professionalNarrative' field.
    *   If you find a link to a video (e.g., Loom, YouTube), place the URL in the 'videoUrl' field.
    *   Standardize date formats to YYYY-MM where possible. Use "Present" for ongoing roles.
    *   ${languageInstructionForParse}
3.  **Structure Output:** Format the extracted and enhanced data strictly according to the provided JSON schema. Do not include any extra fields or text outside of the JSON object. Fill in fields with empty strings if no information is found. For array fields like experience, projects, etc., return an empty array if none are found. The 'photo' field in personal details should always be an empty string.
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

export const findJobOpportunities = async (cvData: CVData, cities: string, language: string): Promise<JobSuggestion[]> => {
    const langConfig = languageConfig[language] || languageConfig['en'];
    const languageName = langConfig.name;

    // Exclude the photo from the data sent to the model to reduce token count.
    const { photo, ...personalDetailsWithoutPhoto } = cvData.personal;
    const dataForPrompt = {
        personal: personalDetailsWithoutPhoto,
        experience: cvData.experience,
        skills: cvData.skills,
        projects: cvData.projects,
        signature: '',
    };

    const prompt = `
You are an expert career advisor and job search assistant.
Based on the following CV data, suggest 3 relevant job titles in ${languageName}.
For each job title, use Google Search to find 3-5 companies that are likely hiring for that role in the following cities: ${cities}.
For each company, provide the company name and a direct link to their careers or jobs page.

Return the result as a single, valid JSON array of objects that can be parsed directly. The JSON should follow this structure: \`[{jobTitle: string, companies: [{name: string, careersUrl: string}]}]\`.
Do not include any text before or after the JSON array. Do not use markdown backticks around the JSON.

**CV Data:**
\`\`\`json
${JSON.stringify(dataForPrompt, null, 2)}
\`\`\`
`;
    try {
        const response = await ai.models.generateContent({
           model: "gemini-2.5-pro",
           contents: prompt,
           config: {
             tools: [{googleSearch: {}}],
           },
        });

        const text = response.text;
        if (text) {
             // Clean the response to ensure it's valid JSON
            const jsonString = text.trim().replace(/^```json\s*|```\s*$/g, '');
            return JSON.parse(jsonString) as JobSuggestion[];
        } else {
            throw new Error("Received an empty response from the job search API.");
        }
    } catch (error) {
        console.error("Error finding job opportunities:", error);
        throw new Error("Failed to find job opportunities. The AI may have returned an unexpected format.");
    }
};

export const draftCoverLetter = async (cvData: CVData, jobTitle: string, companyName: string, language: string): Promise<string> => {
    const langConfig = languageConfig[language] || languageConfig['en'];
    const languageName = langConfig.name;
    
    // Exclude the photo from the data sent to the model to reduce token count.
    const { photo, ...personalDetailsWithoutPhoto } = cvData.personal;
    const dataForPrompt = {
        personal: personalDetailsWithoutPhoto,
        experience: cvData.experience,
        skills: cvData.skills,
        projects: cvData.projects,
        professionalNarrative: cvData.professionalNarrative,
        signature: '',
    };
    
    const prompt = `
You are a professional career coach specializing in writing compelling cover letters.
Your task is to write a concise and professional cover letter for the role of "${jobTitle}" at "${companyName}".
The letter must be written in **${languageName}**.

**Instructions:**
- Base the letter on the applicant's CV provided below.
- Highlight 1-2 key experiences or skills from the CV that are most relevant to the job title.
- Keep the tone professional, enthusiastic, and tailored to the company.
- The output should be only the text of the cover letter, ready to be copied into an email. Do not include a subject line, salutation (like "Dear Hiring Manager,"), or closing (like "Sincerely, [Name]"). Just provide the body paragraphs.

**Applicant's CV Data:**
\`\`\`json
${JSON.stringify(dataForPrompt, null, 2)}
\`\`\`
`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });

        const text = response.text;
        if (text) {
            return text;
        } else {
            throw new Error("Received an empty response from the cover letter API.");
        }
    } catch (error) {
        console.error("Error drafting cover letter:", error);
        throw new Error("Failed to draft the cover letter.");
    }
};