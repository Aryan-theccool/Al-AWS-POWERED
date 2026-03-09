import { APIGatewayProxyEvent } from 'aws-lambda'

/**
 * Extract user ID from JWT claims in API Gateway event
 */
export function extractUserId(event: APIGatewayProxyEvent): string {
  try {
    // In API Gateway with Cognito authorizer, the JWT claims are available in requestContext
    const claims = event.requestContext.authorizer?.jwt?.claims
    
    if (!claims || !claims.sub) {
      throw new Error('No user ID found in JWT claims')
    }
    
    return claims.sub as string
  } catch (error) {
    throw new Error('Invalid or missing authentication token')
  }
}

/**
 * Extract user email from JWT claims
 */
export function extractUserEmail(event: APIGatewayProxyEvent): string {
  try {
    const claims = event.requestContext.authorizer?.jwt?.claims
    
    if (!claims || !claims.email) {
      throw new Error('No email found in JWT claims')
    }
    
    return claims.email as string
  } catch (error) {
    throw new Error('Invalid or missing email in token')
  }
}

/**
 * Extract all user claims from JWT
 */
export function extractUserClaims(event: APIGatewayProxyEvent): Record<string, any> {
  try {
    const claims = event.requestContext.authorizer?.jwt?.claims
    
    if (!claims) {
      throw new Error('No claims found in JWT')
    }
    
    return claims
  } catch (error) {
    throw new Error('Invalid or missing authentication token')
  }
}

/**
 * Check if user has required role/permission
 */
export function hasRole(event: APIGatewayProxyEvent, requiredRole: string): boolean {
  try {
    const claims = extractUserClaims(event)
    const userRoles = claims['custom:roles'] || claims.roles || []
    
    if (Array.isArray(userRoles)) {
      return userRoles.includes(requiredRole)
    }
    
    return userRoles === requiredRole
  } catch (error) {
    return false
  }
}

/**
 * Validate that the user can access a specific resource
 */
export function canAccessResource(
  event: APIGatewayProxyEvent, 
  resourceOwnerId: string
): boolean {
  try {
    const userId = extractUserId(event)
    return userId === resourceOwnerId
  } catch (error) {
    return false
  }
}