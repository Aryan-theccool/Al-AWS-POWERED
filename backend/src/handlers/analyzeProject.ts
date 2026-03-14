import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { success, error } from '../lib/response';
import { extractUserId } from '../lib/auth';
import { AIService } from '../lib/ai';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserId(event);
    
    if (!event.body) {
      return error('Missing request body', 400);
    }

    const { description } = JSON.parse(event.body);

    if (!description) {
      return error('Description is required for analysis', 400);
    }

    const analysis = await AIService.analyzeProject(description);

    return success({ analysis });
  } catch (err) {
    console.error('Error in analyzeProject:', err);
    return error('AI analysis failed. Please try again or fill manually.', 500);
  }
};
