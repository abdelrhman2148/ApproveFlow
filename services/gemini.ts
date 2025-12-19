import { GoogleGenAI } from "@google/genai";
import { Project } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_TEXT = "gemini-3-flash-preview";

export const generateClientEmail = async (
  clientName: string,
  projectName: string,
  type: 'initial' | 'followup' | 'approved_thanks'
): Promise<string> => {
  let prompt = "";
  
  if (type === 'initial') {
    prompt = `
      Write a short, professional, and friendly email to a client named "${clientName}".
      I am sending them a link to review the project "${projectName}".
      The goal is to get them to click the link and approve it or leave feedback.
      Keep it under 100 words. Do not include subject line placeholders. Just the body.
      Tone: Efficient but warm.
    `;
  } else if (type === 'followup') {
    prompt = `
      Write a polite but firm follow-up email to "${clientName}" regarding project "${projectName}".
      They haven't approved it yet. Remind them that approval is needed to move forward (or finalize payment).
      Keep it under 80 words.
      Tone: Professional urgency.
    `;
  } else {
    prompt = `
      Write a very short thank you note to "${clientName}" for approving "${projectName}".
      Mention that the final files will be sent shortly (or invoice).
      Keep it under 50 words.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
    });
    return response.text || "Could not generate email.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating email. Please check API key.";
  }
};

export const generateProjectDescription = async (
  base64Image: string,
  mimeType: string
): Promise<{ title: string; summary: string }> => {
  try {
    const prompt = "Analyze this image. Suggest a short, professional project title (max 5 words) and a 1-sentence summary of what it is (e.g., 'Modern minimalist logo design for tech startup'). Return JSON.";
    
    // Using gemini-2.5-flash-image as per guidelines for general image tasks if 3-flash doesn't support it directly in this specific mocked environment context, 
    // but the guide says 3-flash-preview is for basic text. For images, we should use gemini-2.5-flash-image
    // However, the prompt implies using the SDK for multi-modal.
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return { title: "New Project", summary: "Asset uploaded for review." };
  }
};
