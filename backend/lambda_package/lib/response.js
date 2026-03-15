"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.error = error;
exports.unauthorized = unauthorized;
exports.notFound = notFound;
exports.validationError = validationError;
exports.serverError = serverError;
exports.rateLimitExceeded = rateLimitExceeded;
/**
 * Create a successful API response
 */
function success(data, statusCode = 200) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
            success: true,
            data
        })
    };
}
/**
 * Create an error API response
 */
function error(message, statusCode = 400) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
            success: false,
            error: message
        })
    };
}
/**
 * Create an unauthorized response
 */
function unauthorized(message = 'Unauthorized') {
    return error(message, 401);
}
/**
 * Create a not found response
 */
function notFound(resource) {
    return error(`${resource} not found`, 404);
}
/**
 * Create a validation error response
 */
function validationError(errors) {
    return {
        statusCode: 400,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
            success: false,
            error: 'Validation failed',
            details: errors
        })
    };
}
/**
 * Create a server error response
 */
function serverError(message = 'Internal server error') {
    return error(message, 500);
}
/**
 * Create a rate limit exceeded response
 */
function rateLimitExceeded(message = 'Rate limit exceeded') {
    return error(message, 429);
}
