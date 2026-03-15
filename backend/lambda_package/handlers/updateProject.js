"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const response_1 = require("../lib/response");
const auth_1 = require("../lib/auth");
const dynamo_1 = require("../lib/dynamo");
const VALID_STATUSES = ['draft', 'active', 'in_progress', 'completed', 'cancelled'];
const handler = async (event) => {
    try {
        const userId = (0, auth_1.extractUserId)(event);
        const projectId = event.pathParameters?.projectId;
        if (!projectId)
            return (0, response_1.error)('Project ID is required', 400);
        if (!event.body)
            return (0, response_1.error)('Missing request body', 400);
        const { status } = JSON.parse(event.body);
        if (!status || !VALID_STATUSES.includes(status)) {
            return (0, response_1.error)(`Status must be one of: ${VALID_STATUSES.join(', ')}`, 400);
        }
        // Fetch the existing project to verify ownership
        const record = await dynamo_1.DynamoService.getItem(`PROJECT#${projectId}`, 'METADATA');
        if (!record)
            return (0, response_1.notFound)('Project not found');
        const project = record.data || record;
        if (project.clientId !== userId)
            return (0, response_1.error)('Forbidden', 403);
        // Update status in the stored data
        const updatedData = { ...project, status, updatedAt: new Date().toISOString() };
        const updatedRecord = {
            ...record,
            gsi1sk: status, // keep gsi1sk in sync with status
            gsi2pk: `STATUS#${status}`, // update marketplace index
            data: updatedData,
        };
        await dynamo_1.DynamoService.putItem(updatedRecord);
        return (0, response_1.success)({ project: updatedData });
    }
    catch (err) {
        console.error('Error in updateProject:', err);
        return (0, response_1.error)('Failed to update project', 500);
    }
};
exports.handler = handler;
