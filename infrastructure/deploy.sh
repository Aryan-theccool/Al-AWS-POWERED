#!/bin/bash

# ClarityBridge Infrastructure Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
REGION="us-east-1"
GUIDED=false
CONFIRM_CHANGESET=true

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Environment to deploy (dev, staging, prod) [default: dev]"
    echo "  -r, --region REGION      AWS region [default: us-east-1]"
    echo "  -g, --guided            Run guided deployment"
    echo "  -y, --yes               Skip changeset confirmation"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                      # Deploy to dev environment"
    echo "  $0 -e staging           # Deploy to staging environment"
    echo "  $0 -g                   # Run guided deployment"
    echo "  $0 -e prod -y           # Deploy to prod without confirmation"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -g|--guided)
            GUIDED=true
            shift
            ;;
        -y|--yes)
            CONFIRM_CHANGESET=false
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT. Must be dev, staging, or prod."
    exit 1
fi

print_status "Starting ClarityBridge deployment..."
print_status "Environment: $ENVIRONMENT"
print_status "Region: $REGION"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    print_error "SAM CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Check for required environment variables
if [[ "$ENVIRONMENT" != "dev" ]]; then
    if [[ -z "$OPENAI_API_KEY" ]]; then
        print_error "OPENAI_API_KEY environment variable is required for $ENVIRONMENT deployment."
        exit 1
    fi
    
    if [[ -z "$STRIPE_SECRET_KEY" ]]; then
        print_error "STRIPE_SECRET_KEY environment variable is required for $ENVIRONMENT deployment."
        exit 1
    fi
fi

# Build the backend
print_status "Building backend Lambda functions..."
cd ../backend
npm run build
if [[ $? -ne 0 ]]; then
    print_error "Backend build failed"
    exit 1
fi
cd ../infrastructure

# Create layer directory and install dependencies
print_status "Preparing Lambda layer..."
mkdir -p ../backend/layer/nodejs
cd ../backend/layer/nodejs
npm init -y
npm install --production \
    @aws-sdk/client-dynamodb \
    @aws-sdk/lib-dynamodb \
    @aws-sdk/client-s3 \
    @aws-sdk/s3-request-presigner \
    @aws-sdk/client-ses \
    openai \
    uuid \
    jsonwebtoken \
    joi \
    stripe
cd ../../../infrastructure

# Build SAM application
print_status "Building SAM application..."
sam build --cached --parallel

if [[ $? -ne 0 ]]; then
    print_error "SAM build failed"
    exit 1
fi

# Deploy based on mode
if [[ "$GUIDED" == true ]]; then
    print_status "Running guided deployment..."
    sam deploy --guided --config-env $ENVIRONMENT
else
    print_status "Deploying to $ENVIRONMENT environment..."
    
    # Prepare parameter overrides
    PARAM_OVERRIDES="Environment=$ENVIRONMENT"
    
    if [[ "$ENVIRONMENT" != "dev" ]]; then
        PARAM_OVERRIDES="$PARAM_OVERRIDES OpenAIApiKey=$OPENAI_API_KEY StripeSecretKey=$STRIPE_SECRET_KEY"
    else
        # Use dummy values for dev environment
        PARAM_OVERRIDES="$PARAM_OVERRIDES OpenAIApiKey=dummy-key-for-dev StripeSecretKey=dummy-key-for-dev"
    fi
    
    # Set frontend domain based on environment
    case $ENVIRONMENT in
        dev)
            PARAM_OVERRIDES="$PARAM_OVERRIDES FrontendDomain=localhost:5173"
            ;;
        staging)
            PARAM_OVERRIDES="$PARAM_OVERRIDES FrontendDomain=staging.claritybridge.com"
            ;;
        prod)
            PARAM_OVERRIDES="$PARAM_OVERRIDES FrontendDomain=app.claritybridge.com"
            ;;
    esac
    
    # Deploy with or without confirmation
    if [[ "$CONFIRM_CHANGESET" == true ]]; then
        sam deploy --config-env $ENVIRONMENT --parameter-overrides $PARAM_OVERRIDES
    else
        sam deploy --config-env $ENVIRONMENT --parameter-overrides $PARAM_OVERRIDES --no-confirm-changeset
    fi
fi

if [[ $? -eq 0 ]]; then
    print_success "Deployment completed successfully!"
    
    # Get stack outputs
    print_status "Retrieving stack outputs..."
    STACK_NAME="claritybridge-$ENVIRONMENT"
    
    API_URL=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
        --output text \
        --region $REGION)
    
    CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' \
        --output text \
        --region $REGION)
    
    USER_POOL_ID=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
        --output text \
        --region $REGION)
    
    CLIENT_ID=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
        --output text \
        --region $REGION)
    
    print_success "Deployment Information:"
    echo "  API Gateway URL: $API_URL"
    echo "  CloudFront URL: $CLOUDFRONT_URL"
    echo "  User Pool ID: $USER_POOL_ID"
    echo "  Client ID: $CLIENT_ID"
    echo ""
    print_status "Update your frontend environment variables with these values."
    
    # Generate environment file for frontend
    ENV_FILE="../frontend/.env.$ENVIRONMENT"
    print_status "Generating environment file: $ENV_FILE"
    
    cat > $ENV_FILE << EOF
# Generated by deployment script on $(date)
VITE_API_URL=$API_URL
VITE_COGNITO_USER_POOL_ID=$USER_POOL_ID
VITE_COGNITO_CLIENT_ID=$CLIENT_ID
VITE_AWS_REGION=$REGION
EOF
    
    if [[ "$ENVIRONMENT" != "dev" ]]; then
        echo "VITE_CLOUDFRONT_URL=$CLOUDFRONT_URL" >> $ENV_FILE
    fi
    
    print_success "Environment file created: $ENV_FILE"
    
else
    print_error "Deployment failed"
    exit 1
fi