import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'
import { success, error } from '../lib/response'
import { extractUserId } from '../lib/auth'
import { DynamoService } from '../lib/dynamo'
import type { Project, DynamoDBRecord } from '@shared/types'

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

    const project: Project = {
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
      gsi1pk: 'draft', // status
      gsi1sk: now,     // createdAt
      gsi2pk: `${budget?.min || 0}-${budget?.max || 0}`, // budget range
      gsi2sk: timeline?.flexibility || 'flexible'        // timeline
    }

    // Construct DynamoDB Record
    // Partition Key: PROJECT#<projectId>
    // Sort Key: METADATA
    const record: DynamoDBRecord = {
      pk: `PROJECT#${projectId}`,
      sk: 'METADATA',
      entityType: 'Project',
      gsi1pk: project.gsi1pk,
      gsi1sk: project.gsi1sk,
      gsi2pk: project.gsi2pk,
      gsi2sk: project.gsi2sk,
      data: project
    }

    await DynamoService.putItem(record)

    return success(project, 201)
  } catch (err) {
    console.error('Error in createProject:', err)
    return error('Failed to create project', 500)
  }
}