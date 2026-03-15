import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';

export class AIService {
  // Use v1 API version which is the current stable version for Gemini 1.0/1.5
  private static gemini: any = (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY)
    ? new GoogleGenerativeAI((process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY) as string) 
    : null;

  private static openai: any = process.env.OPENAI_API_KEY 
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
    : null;

  /**
   * Analyze project requirements using AI
   */
  static async analyzeProject(description: string): Promise<any> {
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

    if (this.gemini) {
      try {
        console.info('Using gemini-1.5-flash with v1 API for project analysis');
        const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' }, { apiVersion: 'v1' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return this.parseJSON(text);
      } catch (error: any) {
        console.error('Gemini Analysis Error (flash-v1):', error.message);
        // Fallback to gemini-pro on v1
        try {
          console.info('Attempting fallback with gemini-pro (v1)');
          const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' }, { apiVersion: 'v1' });
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          return this.parseJSON(text);
        } catch (innerError: any) {
          console.error('Gemini Fallback Error (pro-v1):', innerError.message);
          throw error;
        }
      }
    } else if (this.openai) {
      try {
        console.info('Using OpenAI for project analysis');
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        });
        const text = response.choices[0].message.content || '';
        return this.parseJSON(text);
      } catch (error: any) {
        console.error('OpenAI Analysis Error:', error.message);
        throw error;
      }
    }

    throw new Error('No valid AI service configured.');
  }

  /**
   * Analyze matching between a project and a proposal
   */
  static async analyzeProposalMatch(project: any, proposal: any): Promise<any> {
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

    if (this.gemini) {
      try {
        console.info('Using gemini-1.5-flash with v1 API for proposal matching');
        const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' }, { apiVersion: 'v1' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return this.parseJSON(text);
      } catch (error: any) {
        console.error('Gemini Match Error (flash-v1):', error.message);
        try {
          console.info('Attempting fallback with gemini-pro (v1)');
          const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' }, { apiVersion: 'v1' });
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          return this.parseJSON(text);
        } catch (innerError: any) {
          console.error('Gemini Fallback Error (pro-v1):', innerError.message);
          throw error;
        }
      }
    } else if (this.openai) {
      try {
        console.info('Using OpenAI for proposal matching');
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        });
        const text = response.choices[0].message.content || '';
        return this.parseJSON(text);
      } catch (error: any) {
        console.error('OpenAI Match Error:', error.message);
        throw error;
      }
    }

    throw new Error('No valid AI service configured.');
  }

  private static parseJSON(text: string): any {
    try {
      const cleanJson = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', text);
      throw new Error('AI returned invalid format');
    }
  }
}
