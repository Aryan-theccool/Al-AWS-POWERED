import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { success, error, notFound } from '../lib/response';
import { extractUserId } from '../lib/auth';
import { DynamoService } from '../lib/dynamo';
import { AIService } from '../lib/ai';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserId(event);
    const projectId = event.pathParameters?.projectId;
    const proposalId = event.pathParameters?.proposalId;

    if (!projectId || !proposalId) {
      return error('Project ID and Proposal ID are required', 400);
    }

    // 1. Fetch Project to verify ownership
    const projectRecord = await DynamoService.getItem(`PROJECT#${projectId}`, 'METADATA');
    if (!projectRecord) return notFound('Project not found');
    
    const project = projectRecord.data || projectRecord;

    // Verify ownership
    if (project.clientId !== userId) {
      return error('Forbidden: Only the project owner can analyze proposals', 403);
    }

    // 2. Fetch Proposal
    const proposalRecord = await DynamoService.getItem(`PROJECT#${projectId}`, `PROPOSAL#${proposalId}`);
    if (!proposalRecord) return notFound('Proposal not found');
    
    const proposal = proposalRecord.data || proposalRecord;

    // 3. Perform AI Analysis
    const feedback = await AIService.analyzeProposalMatch(project, proposal);

    return success({ feedback });
  } catch (err) {
    console.error('Error in analyzeProposal:', err);
    return error('AI Analysis of proposal failed. Please try again later.', 500);
  }
};
