import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error } from '../lib/response'
import { extractUserId } from '../lib/auth'
import { DynamoService } from '../lib/dynamo'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserId(event)

    // Query all projects owned by this user via GSI1
    // Projects are stored with gsi1pk = 'USER#userId'
    const items = await DynamoService.queryByGSI(`USER#${userId}`)

    // Extract the project data from each DynamoDB record
    const projects = items
      .filter(item => item.entityType === 'Project')
      .map(item => item.data || item)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return success({ projects })
  } catch (err) {
    console.error('Error in listProjects:', err)
    return error('Failed to list projects', 500)
  }
}