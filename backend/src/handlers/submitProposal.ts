import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error } from '../lib/response'
import { extractUserId } from '../lib/auth'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserId(event)
    
    // TODO: Submit proposal to DynamoDB
    return success({
      message: 'Submit proposal endpoint - implementation pending',
      userId
    })
  } catch (err) {
    console.error('Error in submitProposal:', err)
    return error('Failed to submit proposal', 500)
  }
}