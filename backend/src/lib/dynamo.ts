import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  QueryCommand, 
  UpdateCommand, 
  DeleteCommand 
} from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' })
const docClient = DynamoDBDocumentClient.from(client)

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'ClarityBridge-Main'

export class DynamoService {
  /**
   * Put an item into DynamoDB
   */
  static async putItem(item: Record<string, any>): Promise<void> {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    })
    
    await docClient.send(command)
  }

  /**
   * Get an item by primary key
   */
  static async getItem(pk: string, sk: string): Promise<any | null> {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { pk, sk }
    })
    
    const result = await docClient.send(command)
    return result.Item || null
  }

  /**
   * Query items by partition key with optional sort key prefix
   */
  static async query(pk: string, skPrefix?: string): Promise<any[]> {
    let keyConditionExpression = 'pk = :pk'
    const expressionAttributeValues: Record<string, any> = { ':pk': pk }
    
    if (skPrefix) {
      keyConditionExpression += ' AND begins_with(sk, :skPrefix)'
      expressionAttributeValues[':skPrefix'] = skPrefix
    }
    
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues
    })
    
    const result = await docClient.send(command)
    return result.Items || []
  }

  /**
   * Query items using GSI1
   */
  static async queryByGSI(gsi1pk: string, gsi1sk?: string): Promise<any[]> {
    return this.queryByIndex('GSI1', 'gsi1pk', gsi1pk, 'gsi1sk', gsi1sk)
  }

  /**
   * Generic query for any index
   */
  static async queryByIndex(
    indexName: string,
    pkName: string,
    pkValue: string,
    skName?: string,
    skValue?: string
  ): Promise<any[]> {
    let keyConditionExpression = `#pk = :pk`
    const expressionAttributeNames: Record<string, string> = { '#pk': pkName }
    const expressionAttributeValues: Record<string, any> = { ':pk': pkValue }

    if (skName && skValue) {
      keyConditionExpression += ` AND #sk = :sk`
      expressionAttributeNames['#sk'] = skName
      expressionAttributeValues[':sk'] = skValue
    }

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: indexName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    })

    const result = await docClient.send(command)
    return result.Items || []
  }

  /**
   * Update an item
   */
  static async updateItem(
    pk: string, 
    sk: string, 
    updates: Record<string, any>
  ): Promise<void> {
    const updateExpressions: string[] = []
    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, any> = {}
    
    Object.entries(updates).forEach(([key, value], index) => {
      const nameKey = `#attr${index}`
      const valueKey = `:val${index}`
      
      updateExpressions.push(`${nameKey} = ${valueKey}`)
      expressionAttributeNames[nameKey] = key
      expressionAttributeValues[valueKey] = value
    })
    
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { pk, sk },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    })
    
    await docClient.send(command)
  }

  /**
   * Delete an item
   */
  static async deleteItem(pk: string, sk: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { pk, sk }
    })
    
    await docClient.send(command)
  }

  /**
   * Query with pagination support
   */
  static async queryWithPagination(
    pk: string,
    skPrefix?: string,
    limit: number = 50,
    exclusiveStartKey?: Record<string, any>
  ): Promise<{ items: any[], lastEvaluatedKey?: Record<string, any> }> {
    let keyConditionExpression = 'pk = :pk'
    const expressionAttributeValues: Record<string, any> = { ':pk': pk }
    
    if (skPrefix) {
      keyConditionExpression += ' AND begins_with(sk, :skPrefix)'
      expressionAttributeValues[':skPrefix'] = skPrefix
    }
    
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      Limit: limit,
      ExclusiveStartKey: exclusiveStartKey
    })
    
    const result = await docClient.send(command)
    
    return {
      items: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey
    }
  }
}