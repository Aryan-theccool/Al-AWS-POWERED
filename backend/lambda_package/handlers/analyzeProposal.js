"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const response_1 = require("../lib/response");
const auth_1 = require("../lib/auth");
const dynamo_1 = require("../lib/dynamo");
const ai_1 = require("../lib/ai");
const handler = async (event) => {
    try {
        const userId = (0, auth_1.extractUserId)(event);
        const projectId = event.pathParameters?.projectId;
        const proposalId = event.pathParameters?.proposalId;
        if (!projectId || !proposalId) {
            return (0, response_1.error)('Project ID and Proposal ID are required', 400);
        }
        // 1. Fetch Project to verify ownership
        const projectRecord = await dynamo_1.DynamoService.getItem(`PROJECT#${projectId}`, 'METADATA');
        if (!projectRecord)
            return (0, response_1.notFound)('Project not found');
        const project = projectRecord.data || projectRecord;
        // Verify ownership
        if (project.clientId !== userId) {
            return (0, response_1.error)('Forbidden: Only the project owner can analyze proposals', 403);
        }
        // 2. Fetch Proposal
        const proposalRecord = await dynamo_1.DynamoService.getItem(`PROJECT#${projectId}`, `PROPOSAL#${proposalId}`);
        if (!proposalRecord)
            return (0, response_1.notFound)('Proposal not found');
        const proposal = proposalRecord.data || proposalRecord;
        // 3. Perform AI Analysis
        const feedback = await ai_1.AIService.analyzeProposalMatch(project, proposal);
        return (0, response_1.success)({ feedback });
    }
    catch (err) {
        console.error('Error in analyzeProposal:', err);
        return (0, response_1.error)('AI Analysis of proposal failed. Please try again later.', 500);
    }
};
exports.handler = handler;
