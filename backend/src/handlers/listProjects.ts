import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error } from '../lib/response'
import { extractUserId } from '../lib/auth'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserId(event)
    
    // TODO: List projects from DynamoDB
    return success({
      message: 'List projects endpoint - implementation pending',
      userId,
      projects: []
    })
  } catch (err) {
    console.error('Error in listProjects:', err)
    return error('Failed to list projects', 500)
  }
}