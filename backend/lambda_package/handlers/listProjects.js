"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const response_1 = require("../lib/response");
const auth_1 = require("../lib/auth");
const dynamo_1 = require("../lib/dynamo");
const handler = async (event) => {
    try {
        const userId = (0, auth_1.extractUserId)(event);
        // Query all projects owned by this user via GSI1
        // Projects are stored with gsi1pk = 'USER#userId'
        const items = await dynamo_1.DynamoService.queryByGSI(`USER#${userId}`);
        // Extract the project data from each DynamoDB record
        const projects = items
            .filter(item => item.entityType === 'Project')
            .map(item => item.data || item)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return (0, response_1.success)({ projects });
    }
    catch (err) {
        console.error('Error in listProjects:', err);
        return (0, response_1.error)('Failed to list projects', 500);
    }
};
exports.handler = handler;
