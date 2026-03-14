import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, notFound } from '../lib/response'
import { extractUserId } from '../lib/auth'
import { DynamoService } from '../lib/dynamo'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserId(event)
    const projectId = event.pathParameters?.projectId

    if (!projectId) {
      return error('Project ID is required', 400)
    }

    // Fetch the project from DynamoDB using primary key
    const record = await DynamoService.getItem(`PROJECT#${projectId}`, 'METADATA')

    if (!record) {
      return notFound('Project not found')
    }

    const project = record.data || record

    // Ensure the requesting user owns this project or the project is active
    if (project.clientId !== userId && project.status !== 'active') {
      return error('Forbidden', 403)
    }

    return success({ project })
  } catch (err) {
    console.error('Error in getProject:', err)
    return error('Failed to get project', 500)
  }
}