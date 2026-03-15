"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const response_1 = require("../lib/response");
const auth_1 = require("../lib/auth");
const dynamo_1 = require("../lib/dynamo");
const handler = async (event) => {
    try {
        const userId = (0, auth_1.extractUserId)(event);
        const email = (0, auth_1.extractUserEmail)(event);
        if (!event.body) {
            return (0, response_1.error)('Missing request body', 400);
        }
        const body = JSON.parse(event.body);
        const { firstName, lastName, bio, skills, hourlyRate, userType } = body;
        const now = new Date().toISOString();
        const profile = {
            userId,
            email: email || '',
            userType: userType || 'client',
            profile: {
                firstName: firstName || '',
                lastName: lastName || '',
                bio: bio || '',
                skills: skills || [],
                hourlyRate: hourlyRate || null,
            },
            updatedAt: now,
        };
        const record = {
            pk: `USER#${userId}`,
            sk: 'PROFILE',
            entityType: 'UserProfile',
            gsi1pk: userType || 'client', // query by user type
            gsi1sk: userId,
            data: profile,
        };
        await dynamo_1.DynamoService.putItem(record);
        return (0, response_1.success)({ profile });
    }
    catch (err) {
        console.error('Error in updateProfile:', err);
        return (0, response_1.error)('Failed to update profile', 500);
    }
};
exports.handler = handler;
