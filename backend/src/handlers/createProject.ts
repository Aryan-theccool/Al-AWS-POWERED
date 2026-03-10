import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'
import { success, error } from '../lib/response'
import { extractUserId } from '../lib/auth'
import { DynamoService } from '../lib/dynamo'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserId(event)

    if (!event.body) {
      return error('Missing request body', 400)
    }

    const body = JSON.parse(event.body)
    const { title, description, budget, timeline } = body

    if (!title || !description) {
      return error('Title and description are required', 400)
    }

    const projectId = uuidv4()
    const now = new Date().toISOString()

    const project: any = {
      projectId,
      clientId: userId,
      title,
      description,
      status: 'draft',
      budget: {
        min: budget?.min || 0,
        max: budget?.max || 0,
        currency: budget?.currency || 'USD'
      },
      timeline: {
        estimatedWeeks: timeline?.estimatedWeeks || 1,
        flexibility: timeline?.flexibility || 'flexible'
      },
      milestones: [],
      proposals: [],
      createdAt: now,
      updatedAt: now,
    }

    // Construct DynamoDB Record
    // Partition Key: PROJECT#<projectId>
    // Sort Key: METADATA
    const record: any = {
      pk: `PROJECT#${projectId}`,
      sk: 'METADATA',
      entityType: 'Project',
      gsi1pk: `USER#${userId}`, // owner's userId for GSI1 query
      gsi1sk: 'draft',          // status as the sort key
      gsi2pk: `${budget?.min || 0}-${budget?.max || 0}`,
      gsi2sk: timeline?.flexibility || 'flexible',
      data: project
    }

    await DynamoService.putItem(record)

    return success(project, 201)
  } catch (err) {
    console.error('Error in createProject:', err)
    return error('Failed to create project', 500)
  }
}