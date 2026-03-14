import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error } from '../lib/response'
import { DynamoService } from '../lib/dynamo'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Note: We don't strictly require authentication to *view* the marketplace
    // but the API Gateway authorizer will enforce it based on our template.
    // Query GSI2 for active projects
    const records = await DynamoService.queryByIndex('GSI2', 'gsi2pk', 'STATUS#active')
    
    // Sort by newest first (descending by gsi2sk which is createdAt)
    records.sort((a, b) => {
      const dateA = a.gsi2sk || ''
      const dateB = b.gsi2sk || ''
      return dateB.localeCompare(dateA)
    })

    const projects = records.map(record => record.data)

    return success({ projects })
  } catch (err) {
    console.error('Error in listActiveProjects:', err)
    return error('Failed to fetch active projects', 500)
  }
}
