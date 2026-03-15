"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const uuid_1 = require("uuid");
const response_1 = require("../lib/response");
const auth_1 = require("../lib/auth");
const dynamo_1 = require("../lib/dynamo");
const handler = async (event) => {
    try {
        const developerId = (0, auth_1.extractUserId)(event);
        const projectId = event.pathParameters?.projectId;
        if (!projectId)
            return (0, response_1.error)('Project ID is required', 400);
        if (!event.body)
            return (0, response_1.error)('Missing request body', 400);
        const { approach, budget, timeline } = JSON.parse(event.body);
        if (!approach || !budget || !timeline) {
            return (0, response_1.error)('Approach, budget, and timeline are required', 400);
        }
        // Verify the project exists and is active
        const projectRecord = await dynamo_1.DynamoService.getItem(`PROJECT#${projectId}`, 'METADATA');
        if (!projectRecord)
            return (0, response_1.notFound)('Project not found');
        const project = projectRecord.data || projectRecord;
        if (project.status !== 'active') {
            return (0, response_1.error)('Proposals can only be submitted to active projects', 400);
        }
        // Check if the developer has already submitted a proposal
        const existingProposals = await dynamo_1.DynamoService.queryByGSI(`USER#${developerId}`);
        const hasSubmitted = existingProposals.some(p => p.data?.projectId === projectId && p.data?.developerId === developerId);
        if (hasSubmitted) {
            return (0, response_1.error)('You have already submitted a proposal for this project', 400);
        }
        const proposalId = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const proposal = {
            proposalId,
            projectId,
            developerId,
            timeline: Number(timeline),
            budget: Number(budget),
            approach,
            milestoneBreakdown: [],
            status: 'submitted',
            submittedAt: now,
        };
        // Construct DynamoDB Record for Proposal
        // Partition Key: PROJECT#<projectId>
        // Sort Key: PROPOSAL#<proposalId>
        const record = {
            pk: `PROJECT#${projectId}`,
            sk: `PROPOSAL#${proposalId}`,
            entityType: 'Proposal',
            gsi1pk: `USER#${developerId}`, // for developer querying their proposals
            gsi1sk: now,
            data: proposal
        };
        await dynamo_1.DynamoService.putItem(record);
        return (0, response_1.success)({ proposal }, 201);
    }
    catch (err) {
        console.error('Error in createProposal:', err);
        return (0, response_1.error)('Failed to submit proposal', 500);
    }
};
exports.handler = handler;
