import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error } from '../lib/response'
import { extractUserId } from '../lib/auth'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserId(event)
    
    // TODO: Create project in DynamoDB
    return success({
      message: 'Create project endpoint - implementation pending',
      userId
    })
  } catch (err) {
    console.error('Error in createProject:', err)
    return error('Failed to create project', 500)
  }
}