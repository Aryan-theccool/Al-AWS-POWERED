"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const uuid_1 = require("uuid");
const response_1 = require("../lib/response");
const auth_1 = require("../lib/auth");
const dynamo_1 = require("../lib/dynamo");
const handler = async (event) => {
    try {
        const userId = (0, auth_1.extractUserId)(event);
        if (!event.body) {
            return (0, response_1.error)('Missing request body', 400);
        }
        const body = JSON.parse(event.body);
        const { title, description, budget, timeline } = body;
        if (!title || !description) {
            return (0, response_1.error)('Title and description are required', 400);
        }
        const projectId = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const project = {
            projectId,
            clientId: userId,
            title,
            description,
            status: 'draft',
            budget: {
                min: budget?.min || 0,
                max: budget?.max || 0,
                currency: budget?.currency || 'USD'
            },
            timeline: {
                estimatedWeeks: timeline?.estimatedWeeks || 1,
                flexibility: timeline?.flexibility || 'flexible'
            },
            milestones: [],
            proposals: [],
            createdAt: now,
            updatedAt: now,
        };
        // Construct DynamoDB Record
        // Partition Key: PROJECT#<projectId>
        // Sort Key: METADATA
        const record = {
            pk: `PROJECT#${projectId}`,
            sk: 'METADATA',
            entityType: 'Project',
            gsi1pk: `USER#${userId}`, // owner's userId for GSI1 query
            gsi1sk: 'draft', // status as the sort key
            gsi2pk: `STATUS#draft`, // status for marketplace queries
            gsi2sk: now, // createdAt for sorting
            data: project
        };
        await dynamo_1.DynamoService.putItem(record);
        return (0, response_1.success)(project, 201);
    }
    catch (err) {
        console.error('Error in createProject:', err);
        return (0, response_1.error)('Failed to create project', 500);
    }
};
exports.handler = handler;
