"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractUserId = extractUserId;
exports.extractUserEmail = extractUserEmail;
exports.extractUserClaims = extractUserClaims;
exports.hasRole = hasRole;
exports.canAccessResource = canAccessResource;
/**
 * Extract user ID from JWT claims in API Gateway event
 */
function extractUserId(event) {
    try {
        // In API Gateway with Cognito authorizer, the JWT claims are available in requestContext
        const claims = event.requestContext.authorizer?.jwt?.claims;
        if (!claims || !claims.sub) {
            throw new Error('No user ID found in JWT claims');
        }
        return claims.sub;
    }
    catch (error) {
        throw new Error('Invalid or missing authentication token');
    }
}
/**
 * Extract user email from JWT claims
 */
function extractUserEmail(event) {
    try {
        const claims = event.requestContext.authorizer?.jwt?.claims;
        if (!claims || !claims.email) {
            throw new Error('No email found in JWT claims');
        }
        return claims.email;
    }
    catch (error) {
        throw new Error('Invalid or missing email in token');
    }
}
/**
 * Extract all user claims from JWT
 */
function extractUserClaims(event) {
    try {
        const claims = event.requestContext.authorizer?.jwt?.claims;
        if (!claims) {
            throw new Error('No claims found in JWT');
        }
        return claims;
    }
    catch (error) {
        throw new Error('Invalid or missing authentication token');
    }
}
/**
 * Check if user has required role/permission
 */
function hasRole(event, requiredRole) {
    try {
        const claims = extractUserClaims(event);
        const userRoles = claims['custom:roles'] || claims.roles || [];
        if (Array.isArray(userRoles)) {
            return userRoles.includes(requiredRole);
        }
        return userRoles === requiredRole;
    }
    catch (error) {
        return false;
    }
}
/**
 * Validate that the user can access a specific resource
 */
function canAccessResource(event, resourceOwnerId) {
    try {
        const userId = extractUserId(event);
        return userId === resourceOwnerId;
    }
    catch (error) {
        return false;
    }
}
