"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoService = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'ClarityBridge-Main';
class DynamoService {
    /**
     * Put an item into DynamoDB
     */
    static async putItem(item) {
        const command = new lib_dynamodb_1.PutCommand({
            TableName: TABLE_NAME,
            Item: item
        });
        await docClient.send(command);
    }
    /**
     * Get an item by primary key
     */
    static async getItem(pk, sk) {
        const command = new lib_dynamodb_1.GetCommand({
            TableName: TABLE_NAME,
            Key: { pk, sk }
        });
        const result = await docClient.send(command);
        return result.Item || null;
    }
    /**
     * Query items by partition key with optional sort key prefix
     */
    static async query(pk, skPrefix) {
        let keyConditionExpression = 'pk = :pk';
        const expressionAttributeValues = { ':pk': pk };
        if (skPrefix) {
            keyConditionExpression += ' AND begins_with(sk, :skPrefix)';
            expressionAttributeValues[':skPrefix'] = skPrefix;
        }
        const command = new lib_dynamodb_1.QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues
        });
        const result = await docClient.send(command);
        return result.Items || [];
    }
    /**
     * Query items using GSI1
     */
    static async queryByGSI(gsi1pk, gsi1sk) {
        return this.queryByIndex('GSI1', 'gsi1pk', gsi1pk, 'gsi1sk', gsi1sk);
    }
    /**
     * Generic query for any index
     */
    static async queryByIndex(indexName, pkName, pkValue, skName, skValue) {
        let keyConditionExpression = `#pk = :pk`;
        const expressionAttributeNames = { '#pk': pkName };
        const expressionAttributeValues = { ':pk': pkValue };
        if (skName && skValue) {
            keyConditionExpression += ` AND #sk = :sk`;
            expressionAttributeNames['#sk'] = skName;
            expressionAttributeValues[':sk'] = skValue;
        }
        const command = new lib_dynamodb_1.QueryCommand({
            TableName: TABLE_NAME,
            IndexName: indexName,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues
        });
        const result = await docClient.send(command);
        return result.Items || [];
    }
    /**
     * Update an item
     */
    static async updateItem(pk, sk, updates) {
        const updateExpressions = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};
        Object.entries(updates).forEach(([key, value], index) => {
            const nameKey = `#attr${index}`;
            const valueKey = `:val${index}`;
            updateExpressions.push(`${nameKey} = ${valueKey}`);
            expressionAttributeNames[nameKey] = key;
            expressionAttributeValues[valueKey] = value;
        });
        const command = new lib_dynamodb_1.UpdateCommand({
            TableName: TABLE_NAME,
            Key: { pk, sk },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues
        });
        await docClient.send(command);
    }
    /**
     * Delete an item
     */
    static async deleteItem(pk, sk) {
        const command = new lib_dynamodb_1.DeleteCommand({
            TableName: TABLE_NAME,
            Key: { pk, sk }
        });
        await docClient.send(command);
    }
    /**
     * Query with pagination support
     */
    static async queryWithPagination(pk, skPrefix, limit = 50, exclusiveStartKey) {
        let keyConditionExpression = 'pk = :pk';
        const expressionAttributeValues = { ':pk': pk };
        if (skPrefix) {
            keyConditionExpression += ' AND begins_with(sk, :skPrefix)';
            expressionAttributeValues[':skPrefix'] = skPrefix;
        }
        const command = new lib_dynamodb_1.QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            Limit: limit,
            ExclusiveStartKey: exclusiveStartKey
        });
        const result = await docClient.send(command);
        return {
            items: result.Items || [],
            lastEvaluatedKey: result.LastEvaluatedKey
        };
    }
}
exports.DynamoService = DynamoService;
