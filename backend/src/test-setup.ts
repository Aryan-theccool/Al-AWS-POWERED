// Jest setup file for backend tests
import { jest } from '@jest/globals'

// Mock AWS SDK
jest.mock('@aws-sdk/client-dynamodb')
jest.mock('@aws-sdk/lib-dynamodb')
jest.mock('@aws-sdk/client-s3')
jest.mock('@aws-sdk/client-ses')

// Mock OpenAI
jest.mock('openai')

// Set test environment variables
process.env.DYNAMODB_TABLE_NAME = 'test-claritybridge-table'
process.env.S3_BUCKET_NAME = 'test-claritybridge-uploads'
process.env.AWS_REGION = 'us-east-1'
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.FRONTEND_URL = 'http://localhost:5173'