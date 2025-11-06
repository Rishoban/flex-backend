import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ResponseUtils } from '@/utils/helpers';
import { ReviewSyncService } from '@/services/reviewSync.service';
import { logger } from '@/utils/logger';

export class ReviewController {
  private reviewSyncService: ReviewSyncService;

  constructor() {
    this.reviewSyncService = ReviewSyncService.getInstance();
  }

  /**
   * Get all reviews from cache with pagination
   */
  public getReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const sortBy = req.query.sortBy as string || 'submittedAt';
      const sortOrder = (req.query.sortOrder as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';
      const status = req.query.status as string;
      const channel = req.query.channel as string;

      const allReviews = this.reviewSyncService.getReviews();
      
      // Apply filters
      let filteredReviews = allReviews;
      if (status) {
        filteredReviews = filteredReviews.filter(review => review.status === status);
      }
      if (channel) {
        filteredReviews = filteredReviews.filter(review => review.channel === channel);
      }

      // Apply sorting
      filteredReviews.sort((a, b) => {
        let aValue: any = a[sortBy as keyof typeof a];
        let bValue: any = b[sortBy as keyof typeof b];
        
        // Handle date sorting
        if (sortBy === 'submittedAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        
        // Handle numeric sorting
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // Handle string sorting
        const aStr = String(aValue || '').toLowerCase();
        const bStr = String(bValue || '').toLowerCase();
        
        if (sortOrder === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });

      // Apply pagination
      const total = filteredReviews.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedReviews = filteredReviews.slice(offset, offset + limit);
      
      logger.info('Retrieved reviews from cache with pagination', {
        page,
        limit,
        total,
        returned: paginatedReviews.length,
        sortBy,
        sortOrder,
        filters: { status, channel },
        endpoint: '/reviews'
      });

      const pagination = {
        page,
        limit,
        total,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };

      res.json(ResponseUtils.success('Reviews retrieved successfully', {
        reviews: paginatedReviews,
        pagination
      }));
    } catch (error: any) {
      logger.error('Failed to retrieve reviews', {
        error: error.message,
        endpoint: '/reviews'
      });
      res.status(500).json(ResponseUtils.error('Failed to retrieve reviews', 500));
    }
  };

  /**
   * Get a specific review by ID
   */
  public getReviewById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json(ResponseUtils.error('Invalid review ID', 400));
        return;
      }

      const review = this.reviewSyncService.getReviewById(id);
      
      if (!review) {
        res.status(404).json(ResponseUtils.error('Review not found', 404));
        return;
      }

      logger.info('Retrieved review by ID', {
        reviewId: id,
        endpoint: '/reviews/:id'
      });

      res.json(ResponseUtils.success('Review retrieved successfully', review));
    } catch (error: any) {
      logger.error('Failed to retrieve review by ID', {
        error: error.message,
        reviewId: req.params.id,
        endpoint: '/reviews/:id'
      });
      res.status(500).json(ResponseUtils.error('Failed to retrieve review', 500));
    }
  };

  /**
   * Get review statistics
   */
  public getReviewStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = this.reviewSyncService.getReviewStats();
      
      logger.info('Retrieved review statistics', {
        total: stats.total,
        endpoint: '/reviews/stats'
      });

      res.json(ResponseUtils.success('Review statistics retrieved successfully', stats));
    } catch (error: any) {
      logger.error('Failed to retrieve review statistics', {
        error: error.message,
        endpoint: '/reviews/stats'
      });
      res.status(500).json(ResponseUtils.error('Failed to retrieve statistics', 500));
    }
  };

  /**
   * Manually trigger review sync
   */
  public syncReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Manual review sync triggered', {
        endpoint: '/reviews/sync'
      });

      const result = await this.reviewSyncService.manualSync();
      
      if (result.success) {
        res.json(ResponseUtils.success('Review sync completed successfully', result.stats));
      } else {
        res.status(500).json(ResponseUtils.error(`Review sync failed: ${result.error}`, 500));
      }
    } catch (error: any) {
      logger.error('Manual review sync failed', {
        error: error.message,
        endpoint: '/reviews/sync'
      });
      res.status(500).json(ResponseUtils.error('Failed to sync reviews', 500));
    }
  };

  /**
   * Approve a review
   */
  public approveReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json(ResponseUtils.error('Invalid review ID', 400));
        return;
      }

      const result = this.reviewSyncService.updateReviewStatus(id, 'approved');
      
      if (!result.success) {
        res.status(404).json(ResponseUtils.error(result.error || 'Review not found', 404));
        return;
      }

      logger.info('Review approved successfully', {
        reviewId: id,
        userId: req.user?.id,
        endpoint: '/reviews/:id/approve'
      });

      res.json(ResponseUtils.success('Review approved successfully', result.review));
    } catch (error: any) {
      logger.error('Failed to approve review', {
        error: error.message,
        reviewId: req.params.id,
        endpoint: '/reviews/:id/approve'
      });
      res.status(500).json(ResponseUtils.error('Failed to approve review', 500));
    }
  };

  /**
   * Publish a review
   */
  public publishReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json(ResponseUtils.error('Invalid review ID', 400));
        return;
      }

      const result = this.reviewSyncService.updateReviewStatus(id, 'published');
      
      if (!result.success) {
        res.status(404).json(ResponseUtils.error(result.error || 'Review not found', 404));
        return;
      }

      logger.info('Review published successfully', {
        reviewId: id,
        userId: req.user?.id,
        endpoint: '/reviews/:id/publish'
      });

      res.json(ResponseUtils.success('Review published successfully', result.review));
    } catch (error: any) {
      logger.error('Failed to publish review', {
        error: error.message,
        reviewId: req.params.id,
        endpoint: '/reviews/:id/publish'
      });
      res.status(500).json(ResponseUtils.error('Failed to publish review', 500));
    }
  };

  /**
   * Reject a review
   */
  public rejectReview = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(ResponseUtils.error('Validation failed', 400, errors.array()));
        return;
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json(ResponseUtils.error('Invalid review ID', 400));
        return;
      }

      const { reason } = req.body;
      const result = this.reviewSyncService.updateReviewStatus(id, 'rejected', reason);
      
      if (!result.success) {
        res.status(404).json(ResponseUtils.error(result.error || 'Review not found', 404));
        return;
      }

      logger.info('Review rejected successfully', {
        reviewId: id,
        reason,
        userId: req.user?.id,
        endpoint: '/reviews/:id/reject'
      });

      res.json(ResponseUtils.success('Review rejected successfully', result.review));
    } catch (error: any) {
      logger.error('Failed to reject review', {
        error: error.message,
        reviewId: req.params.id,
        endpoint: '/reviews/:id/reject'
      });
      res.status(500).json(ResponseUtils.error('Failed to reject review', 500));
    }
  };

  /**
   * Get dashboard statistics
   */
  public getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = this.reviewSyncService.getDashboardStats();
      
      logger.info('Dashboard stats retrieved successfully', {
        totalReviews: stats.totalReviews,
        userId: req.user?.id,
        endpoint: '/dashboard/stats'
      });

      res.json(ResponseUtils.success('Dashboard statistics retrieved successfully', stats));
    } catch (error: any) {
      logger.error('Failed to get dashboard stats', {
        error: error.message,
        endpoint: '/dashboard/stats'
      });
      res.status(500).json(ResponseUtils.error('Failed to retrieve dashboard statistics', 500));
    }
  };

  /**
   * Get form dropdown data
   */
  public getFormDropdowns = async (req: Request, res: Response): Promise<void> => {
    try {
      const formData = {
        statuses: [
          {
            value: "pending",
            label: "Pending Review",
            description: "Review is awaiting manager approval",
            color: "#ff9800",
            icon: "schedule",
            sortOrder: 1,
            isActive: true,
            permissions: ["view", "update"]
          },
          {
            value: "approved",
            label: "Approved",
            description: "Review has been approved by manager",
            color: "#2196f3",
            icon: "check_circle",
            sortOrder: 2,
            isActive: true,
            permissions: ["view", "update", "publish"]
          },
          {
            value: "published",
            label: "Published",
            description: "Review is live on the website",
            color: "#4caf50",
            icon: "visibility",
            sortOrder: 3,
            isActive: true,
            permissions: ["view", "unpublish"]
          },
          {
            value: "rejected",
            label: "Rejected",
            description: "Review has been rejected",
            color: "#f44336",
            icon: "cancel",
            sortOrder: 4,
            isActive: true,
            permissions: ["view", "reapprove"]
          },
          {
            value: "flagged",
            label: "Flagged",
            description: "Review requires attention",
            color: "#ff5722",
            icon: "flag",
            sortOrder: 5,
            isActive: true,
            permissions: ["view", "update", "resolve"]
          }
        ],
        metadata: {
          totalCount: 5,
          activeCount: 5,
          lastUpdated: new Date().toISOString()
        }
      };

      logger.info('Form dropdown data retrieved successfully', {
        userId: req.user?.id,
        endpoint: '/form/dropdowns',
        statusCount: formData.statuses.length
      });

      res.json({
        status: "success",
        data: formData
      });
    } catch (error: any) {
      logger.error('Failed to get form dropdown data', {
        error: error.message,
        endpoint: '/form/dropdowns'
      });
      res.status(500).json({
        status: "error",
        message: "Failed to retrieve form dropdown data"
      });
    }
  };

  /**
   * Get channels dropdown data
   */
  public getChannels = async (req: Request, res: Response): Promise<void> => {
    try {
      const reviews = this.reviewSyncService.getReviews();
      
      // Extract unique channels from reviews
      const channelMap = new Map<string, { count: number; lastReview: string }>();
      
      reviews.forEach(review => {
        if (review.channel) {
          const existing = channelMap.get(review.channel);
          if (existing) {
            existing.count++;
            if (new Date(review.submittedAt) > new Date(existing.lastReview)) {
              existing.lastReview = review.submittedAt;
            }
          } else {
            channelMap.set(review.channel, {
              count: 1,
              lastReview: review.submittedAt
            });
          }
        }
      });

      const channels = Array.from(channelMap.entries())
        .map(([channel, data]) => ({
          value: channel.toLowerCase().replace(/\s+/g, '_'),
          label: channel,
          count: data.count,
          lastReview: data.lastReview,
          isActive: true
        }))
        .sort((a, b) => b.count - a.count);

      logger.info('Channels dropdown data retrieved successfully', {
        userId: req.user?.id,
        endpoint: '/channels',
        channelCount: channels.length,
        totalReviews: reviews.length
      });

      res.json({
        status: "success",
        data: {
          channels,
          totalChannels: channels.length,
          totalReviews: reviews.length,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error: any) {
      logger.error('Failed to get channels dropdown data', {
        error: error.message,
        endpoint: '/channels'
      });
      res.status(500).json({
        status: "error",
        message: "Failed to retrieve channels dropdown data"
      });
    }
  };

  /**
   * Get properties dropdown data
   */
  public getProperties = async (req: Request, res: Response): Promise<void> => {
    try {
      const reviews = this.reviewSyncService.getReviews();
      
      // Extract unique properties from reviews
      const propertyMap = new Map<string, { 
        count: number; 
        channels: Set<string>; 
        lastReview: string;
        averageRating: number;
        totalRating: number;
      }>();
      
      reviews.forEach(review => {
        if (review.listingName) {
          const existing = propertyMap.get(review.listingName);
          if (existing) {
            existing.count++;
            existing.channels.add(review.channel || 'unknown');
            existing.totalRating += review.rating || 0;
            existing.averageRating = existing.totalRating / existing.count;
            if (new Date(review.submittedAt) > new Date(existing.lastReview)) {
              existing.lastReview = review.submittedAt;
            }
          } else {
            propertyMap.set(review.listingName, {
              count: 1,
              channels: new Set([review.channel || 'unknown']),
              lastReview: review.submittedAt,
              averageRating: review.rating || 0,
              totalRating: review.rating || 0
            });
          }
        }
      });

      const properties = Array.from(propertyMap.entries())
        .map(([property, data]) => ({
          value: property.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          label: property,
          listingName: property,
          count: data.count,
          channels: Array.from(data.channels),
          averageRating: Math.round(data.averageRating * 10) / 10,
          lastReview: data.lastReview,
          isActive: true
        }))
        .sort((a, b) => b.count - a.count);

      logger.info('Properties dropdown data retrieved successfully', {
        userId: req.user?.id,
        endpoint: '/properties',
        propertyCount: properties.length,
        totalReviews: reviews.length
      });

      res.json({
        status: "success",
        data: {
          properties,
          totalProperties: properties.length,
          totalReviews: reviews.length,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error: any) {
      logger.error('Failed to get properties dropdown data', {
        error: error.message,
        endpoint: '/properties'
      });
      res.status(500).json({
        status: "error",
        message: "Failed to retrieve properties dropdown data"
      });
    }
  };
}

export default new ReviewController();