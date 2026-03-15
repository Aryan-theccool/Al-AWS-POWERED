"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const response_1 = require("../lib/response");
const auth_1 = require("../lib/auth");
const dynamo_1 = require("../lib/dynamo");
const handler = async (event) => {
    try {
        const userId = (0, auth_1.extractUserId)(event);
        const projectId = event.pathParameters?.projectId;
        if (!projectId) {
            return (0, response_1.error)('Project ID is required', 400);
        }
        // Fetch the project from DynamoDB using primary key
        const record = await dynamo_1.DynamoService.getItem(`PROJECT#${projectId}`, 'METADATA');
        if (!record) {
            return (0, response_1.notFound)('Project not found');
        }
        const project = record.data || record;
        // Ensure the requesting user owns this project or the project is active
        if (project.clientId !== userId && project.status !== 'active') {
            return (0, response_1.error)('Forbidden', 403);
        }
        return (0, response_1.success)({ project });
    }
    catch (err) {
        console.error('Error in getProject:', err);
        return (0, response_1.error)('Failed to get project', 500);
    }
};
exports.handler = handler;
