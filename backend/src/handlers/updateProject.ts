import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, notFound } from '../lib/response'
import { extractUserId } from '../lib/auth'
import { DynamoService } from '../lib/dynamo'

const VALID_STATUSES = ['draft', 'active', 'in_progress', 'completed', 'cancelled']

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserId(event)
    const projectId = event.pathParameters?.projectId

    if (!projectId) return error('Project ID is required', 400)
    if (!event.body) return error('Missing request body', 400)

    const { status } = JSON.parse(event.body)

    if (!status || !VALID_STATUSES.includes(status)) {
      return error(`Status must be one of: ${VALID_STATUSES.join(', ')}`, 400)
    }

    // Fetch the existing project to verify ownership
    const record = await DynamoService.getItem(`PROJECT#${projectId}`, 'METADATA')
    if (!record) return notFound('Project not found')

    const project = record.data || record
    if (project.clientId !== userId) return error('Forbidden', 403)

    // Update status in the stored data
    const updatedData = { ...project, status, updatedAt: new Date().toISOString() }
    const updatedRecord: any = {
      ...record,
      gsi1sk: status, // keep gsi1sk in sync with status
      gsi2pk: `STATUS#${status}`, // update marketplace index
      data: updatedData,
    }

    await DynamoService.putItem(updatedRecord)

    return success({ project: updatedData })
  } catch (err) {
    console.error('Error in updateProject:', err)
    return error('Failed to update project', 500)
  }
}
