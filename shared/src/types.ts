// Core entity types for ClarityBridge AI Marketplace

export interface User {
  userId: string
  email: string
  userType: 'client' | 'developer'
  profile: UserProfile
  subscription?: Subscription
  createdAt: string
  updatedAt: string
  
  // GSI keys for querying
  gsi1pk: string // userType
  gsi1sk: string // createdAt
}

export interface UserProfile {
  firstName: string
  lastName: string
  avatar?: string
  bio?: string
  skills?: string[] // For developers
  portfolio?: PortfolioItem[] // For developers
  preferences: UserPreferences
  companyName?: string // For clients
  industry?: string // For clients
  professionalTitle?: string // For developers
  hourlyRate?: number // For developers
  portfolioUrl?: string // For developers
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  technologies: string[]
  url?: string
  imageUrl?: string
}

export interface UserPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  language: string
  timezone: string
}

export interface Project {
  projectId: string
  clientId: string
  title: string
  description: string
  structuredRequirements?: StructuredRequirements
  status: ProjectStatus
  budget: BudgetRange
  timeline: Timeline
  milestones: Milestone[]
  proposals: Proposal[]
  selectedDeveloperId?: string
  documents?: ProjectDocument[]
  createdAt: string
  updatedAt: string
  
  // GSI keys for marketplace queries
  gsi1pk: string // status
  gsi1sk: string // createdAt
  gsi2pk: string // budget range
  gsi2sk: string // timeline
}

export type ProjectStatus = 'draft' | 'analyzing' | 'analyzed' | 'published' | 'active' | 'completed' | 'cancelled'

export interface StructuredRequirements {
  summary: string
  userStories: UserStory[]
  technicalRequirements: TechnicalRequirement[]
  suggestedTechStack: TechStack
  milestones: RequirementMilestone[]
  clarifyingQuestions: string[]
  complexityScore: number
}

export interface UserStory {
  id: string
  title: string
  asA: string
  iWant: string
  soThat: string
  acceptanceCriteria: string[]
  priority: 'high' | 'medium' | 'low'
  estimatedHours?: number
}

export interface TechnicalRequirement {
  category: 'Frontend' | 'Backend' | 'Database' | 'Authentication' | 'Integrations' | 'Deployment'
  requirement: string
  priority: 'must-have' | 'should-have' | 'nice-to-have'
}

export interface TechStack {
  frontend: string[]
  backend: string[]
  database: string[]
  hosting: string[]
  other: string[]
}

export interface RequirementMilestone {
  id: string
  title: string
  description: string
  estimatedWeeks: number
  dependencies: string[]
}

export interface BudgetRange {
  min: number
  max: number
  currency: string
}

export interface Timeline {
  estimatedWeeks: number
  startDate?: string
  endDate?: string
  flexibility: 'fixed' | 'flexible' | 'negotiable'
}

export interface ProjectDocument {
  documentId: string
  fileName: string
  fileType: string
  fileSize: number
  s3Key: string
  uploadedAt: string
  extractedContent?: string
  analysisResults?: DocumentAnalysis
}

export interface DocumentAnalysis {
  requirements: string[]
  constraints: string[]
  technicalSpecs: string[]
  businessRules: string[]
}

export interface Message {
  messageId: string
  projectId: string
  senderId: string
  senderRole: 'client' | 'developer' | 'system'
  content: string
  messageType: 'text' | 'file' | 'system' | 'scope_change_alert'
  scopeChangeFlags?: ScopeChangeFlag[]
  timestamp: string
  
  // GSI for user message history
  gsi1pk: string // senderId
  gsi1sk: string // timestamp
}

export interface ScopeChangeFlag {
  type: 'addition' | 'modification' | 'removal'
  confidence: number
  description: string
  suggestedAction: string
  affectedRequirements: string[]
}

export interface Proposal {
  proposalId: string
  projectId: string
  developerId: string
  timeline: number // Days
  budget: number
  approach: string
  milestoneBreakdown: ProposalMilestone[]
  status: ProposalStatus
  submittedAt: string
  
  // GSI for project proposals
  gsi1pk: string // projectId
  gsi1sk: string // submittedAt
}

export type ProposalStatus = 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn'

export interface ProposalMilestone {
  title: string
  description: string
  deliverables: string[]
  estimatedDays: number
  amount: number
}

export interface Milestone {
  milestoneId: string
  projectId: string
  title: string
  description: string
  deliverables: string[]
  dueDate: string
  amount: number
  status: MilestoneStatus
  escrowStatus: EscrowStatus
  createdAt: string
  completedAt?: string
  approvedAt?: string
  
  // GSI for payment processing
  gsi1pk: string // escrowStatus
  gsi1sk: string // dueDate
}

export type MilestoneStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'completed'
export type EscrowStatus = 'pending' | 'funded' | 'released' | 'disputed' | 'refunded'

export interface Subscription {
  subscriptionId: string
  userId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  stripeSubscriptionId?: string
  createdAt: string
  updatedAt: string
}

export type SubscriptionPlan = 'free' | 'pro_client' | 'developer_featured'
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'unpaid'

export interface Payment {
  paymentId: string
  milestoneId: string
  projectId: string
  clientId: string
  developerId: string
  amount: number
  platformCommission: number
  developerAmount: number
  status: PaymentStatus
  stripePaymentIntentId?: string
  processedAt?: string
  createdAt: string
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed'

export interface Notification {
  notificationId: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  createdAt: string
  
  // GSI for user notifications
  gsi1pk: string // userId
  gsi1sk: string // createdAt
}

export type NotificationType = 
  | 'proposal_received'
  | 'proposal_accepted'
  | 'proposal_rejected'
  | 'milestone_completed'
  | 'milestone_approved'
  | 'payment_released'
  | 'scope_change_detected'
  | 'project_published'
  | 'requirements_ready'
  | 'deadline_reminder'
  | 'system_alert'

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
    nextCursor?: string
  }
}

// Authentication types
export interface AuthResult {
  success: boolean
  user?: User
  token?: string
  refreshToken?: string
  error?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface UserRegistration {
  email: string
  password: string
  firstName: string
  lastName: string
  userType: 'client' | 'developer'
}

// DynamoDB record structure
export interface DynamoDBRecord {
  pk: string // Partition key
  sk: string // Sort key
  entityType: string // Entity discriminator
  gsi1pk?: string // GSI1 partition key
  gsi1sk?: string // GSI1 sort key
  gsi2pk?: string // GSI2 partition key
  gsi2sk?: string // GSI2 sort key
  data: any // Entity-specific data
  ttl?: number // TTL for temporary records
}

// Filter and query types
export interface ProjectFilters {
  status?: ProjectStatus[]
  technologies?: string[]
  budgetMin?: number
  budgetMax?: number
  timelineMax?: number
  complexityMin?: number
  complexityMax?: number
  search?: string
}

export interface MarketplaceQuery {
  filters: ProjectFilters
  sort: 'newest' | 'oldest' | 'budget_low' | 'budget_high' | 'timeline_short' | 'timeline_long'
  page: number
  limit: number
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'message' | 'scope_change_alert' | 'milestone_update' | 'project_update'
  projectId: string
  data: any
  timestamp: string
}

// Error types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ServiceError {
  code: string
  message: string
  details?: any
  statusCode?: number
}