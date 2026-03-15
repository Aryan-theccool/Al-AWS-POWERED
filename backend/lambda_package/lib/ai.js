"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const openai_1 = require("openai");
class AIService {
    /**
     * Analyze project requirements using AI
     */
    static async analyzeProject(description) {
        const prompt = `
      You are an expert technical project manager. 
      Analyze the following rough project idea and return a structured JSON object with:
      - title: A concise, catchy project title.
      - structuredRequirements: A list of 5-8 detailed functional requirements.
      - recommendedTechStack: A list of relevant technologies.
      - suggestedBudget: { min: number, max: number, currency: "USD" }
      - suggestedTimelineWeeks: number
      
      Rough Idea: "${description}"
      
      IMPORTANT: Return ONLY valid JSON.
    `;
        if (this.gemini && process.env.GOOGLE_API_KEY && !process.env.GOOGLE_API_KEY.includes('YOUR_')) {
            console.info('Using Google Gemini for project analysis');
            const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return this.parseJSON(text);
        }
        else if (this.openai && process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('YOUR_')) {
            console.info('Using OpenAI for project analysis');
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
            });
            const text = response.choices[0].message.content || '';
            return this.parseJSON(text);
        }
        console.error('AI Service mismatch or missing keys:', {
            hasGemini: !!this.gemini,
            hasOpenAI: !!this.openai,
            googleKeySet: !!process.env.GOOGLE_API_KEY,
            openAIKeySet: !!process.env.OPENAI_API_KEY
        });
        throw new Error('No valid AI service configured. Please check your API keys.');
    }
    /**
     * Analyze matching between a project and a proposal
     */
    static async analyzeProposalMatch(project, proposal) {
        const prompt = `
      You are an expert technical recruiter and project advisor.
      Analyze the match between the following Project and Developer Proposal.
      
      Project:
      - Title: ${project.title}
      - Description: ${project.description}
      - Budget: ${project.budget?.min} - ${project.budget?.max}
      - Timeline: ${project.timeline?.estimatedWeeks} weeks
      
      Proposal:
      - Approach: "${proposal.approach}"
      - Bid: $${proposal.budget}
      - ETA: ${proposal.timeline} days
      
      Return a structured JSON object with:
      - matchScore: (number 0-100)
      - executiveSummary: (concise 2-sentence summary)
      - strengths: (list of 3 key strengths)
      - concerns: (list of potential risks or gaps)
      - verdict: (string: "Strong Match", "Potential Match", or "Needs Review")
      
      IMPORTANT: Return ONLY valid JSON.
    `;
        if (this.gemini && process.env.GOOGLE_API_KEY && !process.env.GOOGLE_API_KEY.includes('YOUR_')) {
            console.info('Using Google Gemini for proposal matching');
            const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return this.parseJSON(text);
        }
        else if (this.openai && process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('YOUR_')) {
            console.info('Using OpenAI for proposal matching');
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
            });
            const text = response.choices[0].message.content || '';
            return this.parseJSON(text);
        }
        console.error('AI Service mismatch or missing keys for proposal match:', {
            hasGemini: !!this.gemini,
            hasOpenAI: !!this.openai,
            googleKeySet: !!process.env.GOOGLE_API_KEY,
            openAIKeySet: !!process.env.OPENAI_API_KEY
        });
        throw new Error('No valid AI service configured. Please check your API keys.');
    }
    static parseJSON(text) {
        try {
            const cleanJson = text.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanJson);
        }
        catch (e) {
            console.error('Failed to parse AI response as JSON:', text);
            throw new Error('AI returned invalid format');
        }
    }
}
exports.AIService = AIService;
AIService.gemini = process.env.GOOGLE_API_KEY
    ? new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    : null;
AIService.openai = process.env.OPENAI_API_KEY
    ? new openai_1.OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;
