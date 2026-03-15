"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const response_1 = require("../lib/response");
const auth_1 = require("../lib/auth");
const handler = async (event) => {
    try {
        const userId = (0, auth_1.extractUserId)(event);
        const projectId = event.pathParameters?.projectId;
        if (!projectId) {
            return (0, response_1.error)('Project ID is required', 400);
        }
        // TODO: Get messages from DynamoDB
        return (0, response_1.success)({
            message: 'Get messages endpoint - implementation pending',
            userId,
            projectId,
            messages: []
        });
    }
    catch (err) {
        console.error('Error in getMessages:', err);
        return (0, response_1.error)('Failed to get messages', 500);
    }
};
exports.handler = handler;
