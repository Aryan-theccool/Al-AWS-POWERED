"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const response_1 = require("../lib/response");
const auth_1 = require("../lib/auth");
const ai_1 = require("../lib/ai");
const handler = async (event) => {
    try {
        const userId = (0, auth_1.extractUserId)(event);
        if (!event.body) {
            return (0, response_1.error)('Missing request body', 400);
        }
        const { description } = JSON.parse(event.body);
        if (!description) {
            return (0, response_1.error)('Description is required for analysis', 400);
        }
        const analysis = await ai_1.AIService.analyzeProject(description);
        return (0, response_1.success)({ analysis });
    }
    catch (err) {
        console.error('Error in analyzeProject:', err);
        return (0, response_1.error)('AI analysis failed. Please try again or fill manually.', 500);
    }
};
exports.handler = handler;
