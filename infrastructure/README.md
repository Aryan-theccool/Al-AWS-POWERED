# ClarityBridge Infrastructure

This directory contains the AWS SAM (Serverless Application Model) template and deployment scripts for the ClarityBridge AI Marketplace infrastructure.

## Prerequisites

1. **AWS CLI** - [Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. **SAM CLI** - [Installation Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
3. **Node.js 18+** - Required for Lambda functions
4. **AWS Account** with appropriate permissions

## Quick Start

### 1. Configure AWS Credentials

```bash
aws configure
```

### 2. Set Environment Variables (for staging/prod)

```bash
export OPENAI_API_KEY="your-openai-api-key"
export STRIPE_SECRET_KEY="your-stripe-secret-key"
```

### 3. Deploy Infrastructure

#### Development Environment
```bash
# On Unix/Linux/macOS
./deploy.sh

# On Windows
bash deploy.sh
```

#### Staging Environment
```bash
./deploy.sh -e staging
```

#### Production Environment
```bash
./deploy.sh -e prod -y  # Skip confirmation
```

#### Guided Deployment (First Time)
```bash
./deploy.sh -g
```

## Architecture Overview

The infrastructure includes:

### Core Services
- **API Gateway (HTTP API)** - RESTful API endpoints with Cognito authorization
- **AWS Lambda** - Serverless functions for business logic
- **DynamoDB** - NoSQL database with GSI for query patterns
- **S3** - File storage for uploads and static website hosting
- **CloudFront** - CDN for global content delivery
- **Cognito** - User authentication and authorization

### Lambda Functions
- `GetProfile/UpdateProfile` - User profile management
- `CreateProject/ListProjects/GetProject` - Project CRUD operations
- `AnalyzeRequirements` - AI-powered requirement analysis
- `SendMessage/GetMessages` - Real-time messaging
- `SubmitProposal/GetProposals` - Proposal management
- `GetPresignedUploadUrl` - Secure file uploads
- `ProcessUpload` - Document processing and analysis

### Security Features
- **Cognito JWT Authorization** - Secure API access
- **S3 Bucket Policies** - Restricted file access
- **CloudFront OAC** - Origin access control
- **CORS Configuration** - Cross-origin request handling

## Environment Configuration

### Development (dev)
- Local development with localhost CORS
- Dummy API keys for testing
- Pay-per-request DynamoDB billing
- Basic CloudFront configuration

### Staging (staging)
- Production-like environment for testing
- Real API keys required
- Custom domain support
- Enhanced monitoring

### Production (prod)
- Full production configuration
- Real API keys required
- Custom domain with SSL
- Comprehensive monitoring and alerting

## Deployment Options

### Standard Deployment
```bash
./deploy.sh -e <environment>
```

### Skip Confirmation
```bash
./deploy.sh -e <environment> -y
```

### Custom Region
```bash
./deploy.sh -e <environment> -r us-west-2
```

### Guided Setup (Interactive)
```bash
./deploy.sh -g
```

## Stack Outputs

After successful deployment, the following outputs are available:

- **ApiGatewayUrl** - API endpoint for frontend integration
- **CloudFrontUrl** - CDN URL for static assets
- **UserPoolId** - Cognito User Pool ID for authentication
- **UserPoolClientId** - Cognito Client ID for frontend
- **DynamoDBTableName** - Database table name
- **UploadsBucketName** - S3 bucket for file uploads
- **FrontendBucketName** - S3 bucket for static hosting

## Cost Optimization

The infrastructure is designed to stay within AWS Free Tier limits:

- **DynamoDB** - Pay-per-request billing (25GB free)
- **Lambda** - 1M requests/month free
- **S3** - 5GB storage free
- **CloudFront** - 1TB transfer free
- **API Gateway** - 1M requests/month free
- **Cognito** - 50,000 MAU free

## Monitoring and Logging

- **CloudWatch Logs** - Lambda function logs
- **CloudWatch Metrics** - Performance monitoring
- **DynamoDB Streams** - Data change tracking
- **S3 Event Notifications** - File upload processing

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   cd ../backend && npm run build
   ```

2. **Permission Errors**
   - Ensure AWS credentials have sufficient permissions
   - Check IAM policies for CloudFormation, Lambda, DynamoDB, S3

3. **Stack Update Failures**
   - Check CloudFormation events in AWS Console
   - Verify parameter values and constraints

4. **Lambda Function Errors**
   - Check CloudWatch Logs for specific function
   - Verify environment variables and dependencies

### Cleanup

To delete the entire stack:
```bash
sam delete --stack-name claritybridge-<environment>
```

## Security Considerations

- Store sensitive values (API keys) as environment variables
- Use least-privilege IAM policies
- Enable CloudTrail for audit logging
- Regular security updates for dependencies
- Monitor for unusual API usage patterns

## Development Workflow

1. Make changes to Lambda functions in `../backend/src/`
2. Test locally with SAM Local (optional)
3. Deploy to dev environment for testing
4. Deploy to staging for integration testing
5. Deploy to production after approval

## Support

For deployment issues:
1. Check CloudFormation events in AWS Console
2. Review CloudWatch Logs for Lambda functions
3. Verify all prerequisites are installed
4. Ensure AWS credentials are properly configured