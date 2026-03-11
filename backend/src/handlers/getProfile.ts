import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error } from '../lib/response'
import { extractUserId, extractUserEmail } from '../lib/auth'
import { DynamoService } from '../lib/dynamo'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserId(event)

    // Try to fetch existing profile from DynamoDB
    const record = await DynamoService.getItem(`USER#${userId}`, 'PROFILE')

    if (record) {
      return success({ profile: record.data || record })
    }

    // Profile doesn't exist yet — return basic info from Cognito claims
    const email = extractUserEmail(event)
    const claims = event.requestContext?.authorizer?.jwt?.claims || {}

    const defaultProfile = {
      userId,
      email: email || '',
      userType: 'client',
      profile: {
        firstName: claims['given_name'] || '',
        lastName: claims['family_name'] || '',
        bio: '',
        skills: [],
        hourlyRate: null,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return success({ profile: defaultProfile })
  } catch (err) {
    console.error('Error in getProfile:', err)
    return error('Failed to get profile', 500)
  }
}