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
    
    // First fetch the project to verify ownership
    const projectRecord = await DynamoService.getItem(`PROJECT#${projectId}`, 'METADATA')
    
    if (!projectRecord) {
      return notFound('Project not found')
    }

    const project = projectRecord.data || projectRecord

    // Ensure the requesting user owns this project
    if (project.clientId !== userId) {
      return error('Forbidden: Only the project owner can view proposals', 403)
    }

    // Query for all proposals of this project
    // Partition Key: PROJECT#<projectId>
    // Sort Key: begins_with(PROPOSAL#)
    const records = await DynamoService.query(`PROJECT#${projectId}`, 'PROPOSAL#')
    
    const proposals = records
      .map(record => record.data)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

    return success({ proposals })
  } catch (err) {
    console.error('Error in getProposals:', err)
    return error('Failed to fetch proposals', 500)
  }
}