import { APIGatewayProxyResult } from 'aws-lambda'

/**
 * Create a successful API response
 */
export function success(data: any, statusCode: number = 200): APIGatewayProxyResult {
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
  }
}

/**
 * Create an error API response
 */
export function error(message: string, statusCode: number = 400): APIGatewayProxyResult {
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
  }
}

/**
 * Create an unauthorized response
 */
export function unauthorized(message: string = 'Unauthorized'): APIGatewayProxyResult {
  return error(message, 401)
}

/**
 * Create a not found response
 */
export function notFound(resource: string): APIGatewayProxyResult {
  return error(`${resource} not found`, 404)
}

/**
 * Create a validation error response
 */
export function validationError(errors: string[]): APIGatewayProxyResult {
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
  }
}

/**
 * Create a server error response
 */
export function serverError(message: string = 'Internal server error'): APIGatewayProxyResult {
  return error(message, 500)
}

/**
 * Create a rate limit exceeded response
 */
export function rateLimitExceeded(message: string = 'Rate limit exceeded'): APIGatewayProxyResult {
  return error(message, 429)
}