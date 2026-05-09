import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type AcademicStyle = 'IEEE' | 'ACM' | 'Springer' | 'Elsevier' | 'Thesis' | 'Formal' | 'Simplified';
export type AcademicMode = 
  | 'Strong Humanization' 
  | 'Technical Preservation Priority' 
  | 'Simplified Academic English' 
  | 'Reviewer Mode' 
  | 'LaTeX Cleanup Mode' 
  | 'Grammar + Clarity Mode';

export interface RewriteOptions {
  style: AcademicStyle;
  mode: AcademicMode;
  format: 'LaTeX' | 'Plain English';
}

export interface ProcessedResult {
  text: string;
  plagiarismPercentage: number;
  aiGeneratedPercentage: number;
  suggestions: string[];
}

const SYSTEM_PROMPT = `You are an advanced academic writing humanizer and research assistant.
Your absolute priority is to transform AI-generated or robotic technical text into writing that is indistinguishable from a high-level human researcher (PhD level).

CORE HUMANIZATION RULES (To bypass AI Detectors):
1. Vary Sentence Architecture: Mix short, punchy observations with complex, multi-clause explanations. Avoid starting consecutive sentences with the same word or structure.
2. Burstiness & Perplexity: AI detectors look for uniform patterns. Break this by introducing natural human-like flow—sometimes elaborate, sometimes direct.
3. Avoid AI "Filler": Strictly avoid words like "delve," "comprehensive," "vibrant," "testament," or "pivotal" unless strictly necessary for technical documentation.
4. Active Scholarly Voice: Prefer active voice where it adds clarity, but maintain the formal third-person objective tone required for papers.
5. Unique Phrasing: Do not use predictable transitions (e.g., "In conclusion," "Furthermore," "Moreover"). Use contextual transitions like "This architectural shift implies..." or "Contrary to earlier assumptions...".

PLAGIARISM & INTEGRITY:
- 100% Originality: Genuinely re-conceptualize and rephrase every sentence while keeping the technical data/logic intact.
- NO Fabrication: Never invent results, citations, or data.
- LaTeX Preservation: Maintain all \cite{}, equations, and environments.

CRITICAL: You MUST respond in a valid JSON format:
{
  "text": "The humanized, detector-proof academic content",
  "plagiarismPercentage": [estimate 0-5% based on your rewrite uniqueness],
  "aiGeneratedPercentage": [estimate the human-like quality, aim for 5-15% likelihood of being AI],
  "suggestions": ["Specific humanization choices made", "Structural improvements"]
}

Selected Style: {STYLE}
Selected Mode: {MODE}
Output Format: {FORMAT}`;

export async function processAcademicText(text: string, options: RewriteOptions): Promise<ProcessedResult> {
  const prompt = `Please process the following text according to the selected style, mode, and format:
---
${text}
---`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT
          .replace('{STYLE}', options.style)
          .replace('{MODE}', options.mode)
          .replace('{FORMAT}', options.format),
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      text: result.text || "No response generated.",
      plagiarismPercentage: result.plagiarismPercentage ?? 0,
      aiGeneratedPercentage: result.aiGeneratedPercentage ?? 0,
      suggestions: result.suggestions ?? [],
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
