import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';

export class AIService {
  private static gemini = process.env.GOOGLE_API_KEY 
    ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) 
    : null;

  private static openai = process.env.OPENAI_API_KEY 
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
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return this.parseJSON(text);
    } else if (this.openai) {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      });
      const text = response.choices[0].message.content || '';
      return this.parseJSON(text);
    }

    throw new Error('No AI service configured');
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
