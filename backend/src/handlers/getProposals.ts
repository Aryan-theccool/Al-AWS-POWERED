import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error } from '../lib/response'
import { extractUserId } from '../lib/auth'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserId(event)
    const projectId = event.pathParameters?.projectId
    
    if (!projectId) {
      return error('Project ID is required', 400)
    }
    
    // TODO: Get proposals from DynamoDB
    return success({
      message: 'Get proposals endpoint - implementation pending',
      userId,
      projectId,
      proposals: []
    })
  } catch (err) {
    console.error('Error in getProposals:', err)
    return error('Failed to get proposals', 500)
  }
}