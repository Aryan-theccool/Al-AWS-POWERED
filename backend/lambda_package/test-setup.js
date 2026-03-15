"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Jest setup file for backend tests
const globals_1 = require("@jest/globals");
// Mock AWS SDK
globals_1.jest.mock('@aws-sdk/client-dynamodb');
globals_1.jest.mock('@aws-sdk/lib-dynamodb');
globals_1.jest.mock('@aws-sdk/client-s3');
globals_1.jest.mock('@aws-sdk/client-ses');
// Mock OpenAI
globals_1.jest.mock('openai');
// Set test environment variables
process.env.DYNAMODB_TABLE_NAME = 'test-claritybridge-table';
process.env.S3_BUCKET_NAME = 'test-claritybridge-uploads';
process.env.AWS_REGION = 'us-east-1';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.FRONTEND_URL = 'http://localhost:5173';
