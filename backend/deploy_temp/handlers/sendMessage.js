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
        // TODO: Send message and detect scope changes
        return (0, response_1.success)({
            message: 'Send message endpoint - implementation pending',
            userId,
            projectId
        });
    }
    catch (err) {
        console.error('Error in sendMessage:', err);
        return (0, response_1.error)('Failed to send message', 500);
    }
};
exports.handler = handler;
