export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  validationErrors?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: any; // Using any for compatibility with Mongoose toJSON
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ReviewCategory {
  category: string;
  rating: number;
}

export interface Review {
  id: number;
  type: string;
  status: string;
  rating: number | null;
  publicReview: string;
  reviewCategory: ReviewCategory[];
  submittedAt: string;
  guestName: string;
  listingName: string;
  propertyId?: string;
  channel?: string;
  isSelectedForWebsite?: boolean;
  flaggedIssues?: string[];
  updatedAt?: string;
  rejectionReason?: string;
}

export interface DashboardStats {
  totalReviews: number;
  averageRating: number;
  pendingReviews: number;
  publishedReviews: number;
  flaggedIssues: number;
  propertiesCount: number;
}

export interface HostawayAuthResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
}

export interface HostawayReviewsResponse {
  status: string;
  result: Review[];
  count: number;
  offset: number | null;
}