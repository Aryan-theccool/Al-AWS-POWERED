"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const response_1 = require("../lib/response");
const dynamo_1 = require("../lib/dynamo");
const handler = async (event) => {
    try {
        // Note: We don't strictly require authentication to *view* the marketplace
        // but the API Gateway authorizer will enforce it based on our template.
        // Query GSI2 for active projects
        const records = await dynamo_1.DynamoService.queryByIndex('GSI2', 'gsi2pk', 'STATUS#active');
        // Sort by newest first (descending by gsi2sk which is createdAt)
        records.sort((a, b) => {
            const dateA = a.gsi2sk || '';
            const dateB = b.gsi2sk || '';
            return dateB.localeCompare(dateA);
        });
        const projects = records.map(record => record.data);
        return (0, response_1.success)({ projects });
    }
    catch (err) {
        console.error('Error in listActiveProjects:', err);
        return (0, response_1.error)('Failed to fetch active projects', 500);
    }
};
exports.handler = handler;
