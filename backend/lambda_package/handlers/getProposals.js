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
        // First fetch the project to verify ownership
        const projectRecord = await dynamo_1.DynamoService.getItem(`PROJECT#${projectId}`, 'METADATA');
        if (!projectRecord) {
            return (0, response_1.notFound)('Project not found');
        }
        const project = projectRecord.data || projectRecord;
        // Ensure the requesting user owns this project
        if (project.clientId !== userId) {
            return (0, response_1.error)('Forbidden: Only the project owner can view proposals', 403);
        }
        // Query for all proposals of this project
        // Partition Key: PROJECT#<projectId>
        // Sort Key: begins_with(PROPOSAL#)
        const records = await dynamo_1.DynamoService.query(`PROJECT#${projectId}`, 'PROPOSAL#');
        const proposals = records
            .map(record => record.data)
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        return (0, response_1.success)({ proposals });
    }
    catch (err) {
        console.error('Error in getProposals:', err);
        return (0, response_1.error)('Failed to fetch proposals', 500);
    }
};
exports.handler = handler;
