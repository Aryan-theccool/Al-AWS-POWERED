"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const response_1 = require("../lib/response");
const auth_1 = require("../lib/auth");
const dynamo_1 = require("../lib/dynamo");
const handler = async (event) => {
    try {
        const userId = (0, auth_1.extractUserId)(event);
        // Try to fetch existing profile from DynamoDB
        const record = await dynamo_1.DynamoService.getItem(`USER#${userId}`, 'PROFILE');
        if (record) {
            return (0, response_1.success)({ profile: record.data || record });
        }
        // Profile doesn't exist yet — return basic info from Cognito claims
        const email = (0, auth_1.extractUserEmail)(event);
        const claims = event.requestContext?.authorizer?.jwt?.claims || {};
        const defaultProfile = {
            userId,
            email: email || '',
            userType: 'client',
            profile: {
                firstName: claims['given_name'] || '',
                lastName: claims['family_name'] || '',
                bio: '',
                skills: [],
                hourlyRate: null,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        return (0, response_1.success)({ profile: defaultProfile });
    }
    catch (err) {
        console.error('Error in getProfile:', err);
        return (0, response_1.error)('Failed to get profile', 500);
    }
};
exports.handler = handler;
