import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, notFound } from '../lib/response'
import { extractUserId } from '../lib/auth'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserId(event)
    const projectId = event.pathParameters?.projectId
    
    if (!projectId) {
      return error('Project ID is required', 400)
    }
    
    // TODO: Get project from DynamoDB
    return success({
      message: 'Get project endpoint - implementation pending',
      userId,
      projectId
    })
  } catch (err) {
    console.error('Error in getProject:', err)
    return error('Failed to get project', 500)
  }
}