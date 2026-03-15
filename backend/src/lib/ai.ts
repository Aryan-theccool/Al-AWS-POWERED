import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';

export class AIService {
  private static gemini: any = null;
  private static openai: any = null;

  private static init() {
    const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (key && !this.gemini) {
      this.gemini = new GoogleGenerativeAI(key);
    }
    if (process.env.OPENAI_API_KEY && !this.openai) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  /**
   * Analyze project requirements using AI
   */
  static async analyzeProject(description: string): Promise<any> {
    this.init();
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

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    if (this.gemini && apiKey && !apiKey.includes('YOUR_')) {
      try {
        console.info('Attempting Gemini Analysis...');
        // Try flash first
        const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return this.parseJSON(text);
      } catch (error: any) {
        console.error('Gemini Analysis Error:', error.message);
        
        // Try to find any available model
        try {
          console.info('Listing available models for fallback...');
          // Note: listModels() might not be directly on genAI instance in all versions
          // but we can try common ones
          const fallbacks = ['gemini-pro', 'gemini-1.0-pro', 'gemini-1.5-flash-latest'];
          for (const fallback of fallbacks) {
            try {
              console.info(`Trying fallback model: ${fallback}`);
              const model = this.gemini.getGenerativeModel({ model: fallback });
              const result = await model.generateContent(prompt);
              const text = result.response.text();
              return this.parseJSON(text);
            } catch (e) {}
          }
        } catch (e) {}
        
        throw error;
      }
    } else if (this.openai && process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('YOUR_')) {
      try {
        console.info('Using OpenAI for project analysis');
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        });
        const text = response.choices[0].message.content || '';
        return this.parseJSON(text);
      } catch (error: any) {
        console.error('OpenAI Project Analysis Error:', error.message);
        throw error;
      }
    }

    throw new Error('No valid AI service configured. Please check your API keys.');
  }

  /**
   * Analyze matching between a project and a proposal
   */
  static async analyzeProposalMatch(project: any, proposal: any): Promise<any> {
    this.init();
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

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    if (this.gemini && apiKey && !apiKey.includes('YOUR_')) {
      try {
        console.info('Attempting Gemini Proposal Match...');
        const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return this.parseJSON(text);
      } catch (error: any) {
        console.error('Gemini Proposal Match Error:', error.message);
        
        const fallbacks = ['gemini-pro', 'gemini-1.0-pro'];
        for (const fallback of fallbacks) {
          try {
            console.info(`Trying fallback model: ${fallback}`);
            const model = this.gemini.getGenerativeModel({ model: fallback });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return this.parseJSON(text);
          } catch (e) {}
        }
        
        throw error;
      }
    } else if (this.openai && process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('YOUR_')) {
      try {
        console.info('Using OpenAI for proposal matching');
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        });
        const text = response.choices[0].message.content || '';
        return this.parseJSON(text);
      } catch (error: any) {
        console.error('OpenAI Proposal Match Error:', error.message);
        throw error;
      }
    }

    throw new Error('No valid AI service configured. Please check your API keys.');
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
