import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'
import { success, error, notFound } from '../lib/response'
import { extractUserId } from '../lib/auth'
import { DynamoService } from '../lib/dynamo'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const developerId = extractUserId(event)
    const projectId = event.pathParameters?.projectId

    if (!projectId) return error('Project ID is required', 400)
    if (!event.body) return error('Missing request body', 400)

    const { approach, budget, timeline } = JSON.parse(event.body)

    if (!approach || !budget || !timeline) {
      return error('Approach, budget, and timeline are required', 400)
    }

    // Verify the project exists and is active
    const projectRecord = await DynamoService.getItem(`PROJECT#${projectId}`, 'METADATA')
    if (!projectRecord) return notFound('Project not found')
    
    const project = projectRecord.data || projectRecord
    if (project.status !== 'active') {
      return error('Proposals can only be submitted to active projects', 400)
    }

    // Check if the developer has already submitted a proposal
    const existingProposals = await DynamoService.queryByGSI(`USER#${developerId}`)
    const hasSubmitted = existingProposals.some(
      p => p.data?.projectId === projectId && p.data?.developerId === developerId
    )
    
    if (hasSubmitted) {
       return error('You have already submitted a proposal for this project', 400)
    }

    const proposalId = uuidv4()
    const now = new Date().toISOString()

    const proposal: any = {
      proposalId,
      projectId,
      developerId,
      timeline: Number(timeline),
      budget: Number(budget),
      approach,
      milestoneBreakdown: [],
      status: 'submitted',
      submittedAt: now,
    }

    // Construct DynamoDB Record for Proposal
    // Partition Key: PROJECT#<projectId>
    // Sort Key: PROPOSAL#<proposalId>
    const record: any = {
      pk: `PROJECT#${projectId}`,
      sk: `PROPOSAL#${proposalId}`,
      entityType: 'Proposal',
      gsi1pk: `USER#${developerId}`, // for developer querying their proposals
      gsi1sk: now,
      data: proposal
    }

    await DynamoService.putItem(record)

    return success({ proposal }, 201)
  } catch (err) {
    console.error('Error in createProposal:', err)
    return error('Failed to submit proposal', 500)
  }
}
