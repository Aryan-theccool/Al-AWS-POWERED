import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error } from '../lib/response'
import { extractUserId, extractUserEmail } from '../lib/auth'
import { DynamoService } from '../lib/dynamo'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserId(event)
    const email = extractUserEmail(event)

    if (!event.body) {
      return error('Missing request body', 400)
    }

    const body = JSON.parse(event.body)
    const { firstName, lastName, bio, skills, hourlyRate, userType } = body

    const now = new Date().toISOString()

    const profile: any = {
      userId,
      email: email || '',
      userType: userType || 'client',
      profile: {
        firstName: firstName || '',
        lastName: lastName || '',
        bio: bio || '',
        skills: skills || [],
        hourlyRate: hourlyRate || null,
      },
      updatedAt: now,
    }

    const record: any = {
      pk: `USER#${userId}`,
      sk: 'PROFILE',
      entityType: 'UserProfile',
      gsi1pk: userType || 'client',  // query by user type
      gsi1sk: userId,
      data: profile,
    }

    await DynamoService.putItem(record)

    return success({ profile })
  } catch (err) {
    console.error('Error in updateProfile:', err)
    return error('Failed to update profile', 500)
  }
}