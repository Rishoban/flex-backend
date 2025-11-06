import axios, { AxiosResponse } from 'axios';
import { logger } from '@/utils/logger';
import { Review, DashboardStats, HostawayAuthResponse, HostawayReviewsResponse } from '@/types';

export class ReviewSyncService {
  private static instance: ReviewSyncService;
  private reviews: Review[] = [];
  private accessToken: string | null = null;
  private tokenExpiryTime: number = 0;
  private syncInterval: NodeJS.Timeout | null = null;

  // Hostaway API credentials - move to environment variables in production
  private readonly CLIENT_ID = '61148';
  private readonly CLIENT_SECRET = 'f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152';
  private readonly AUTH_URL = 'https://api.hostaway.com/v1/accessTokens';
  private readonly REVIEWS_URL = 'https://api.hostaway.com/v1/reviews';

  private mockReviews: Review[] = [
    {
      id: 7453,
      type: 'host-to-guest',
      status: 'published',
      rating: null,
      publicReview: "Shane and family are wonderful! Would definitely host again :)",
      reviewCategory: [
        { category: 'cleanliness', rating: 10 },
        { category: 'communication', rating: 10 },
        { category: 'respect_house_rules', rating: 10 }
      ],
      submittedAt: '2024-08-21 22:45:14',
      guestName: 'Shane Finkelstein',
      listingName: '2B N1 A - 29 Shoreditch Heights',
      propertyId: 'prop_001',
      channel: 'airbnb',
      isSelectedForWebsite: true
    },
    {
      id: 7454,
      type: 'guest-to-host',
      status: 'pending',
      rating: 4,
      publicReview: "Great location and clean apartment. Host was very responsive. Minor issue with Wi-Fi but overall excellent stay.",
      reviewCategory: [
        { category: 'cleanliness', rating: 9 },
        { category: 'communication', rating: 10 },
        { category: 'location', rating: 10 },
        { category: 'wifi', rating: 6 }
      ],
      submittedAt: '2024-10-15 14:30:22',
      guestName: 'Emma Thompson',
      listingName: '1B S2 B - 15 Camden Lock',
      propertyId: 'prop_002',
      channel: 'booking',
      isSelectedForWebsite: false,
      flaggedIssues: ['wifi']
    },
    {
      id: 7455,
      type: 'guest-to-host',
      status: 'approved',
      rating: 5,
      publicReview: "Absolutely perfect! The apartment exceeded expectations. Everything was spotless and the host went above and beyond.",
      reviewCategory: [
        { category: 'cleanliness', rating: 10 },
        { category: 'communication', rating: 10 },
        { category: 'location', rating: 9 },
        { category: 'value', rating: 9 }
      ],
      submittedAt: '2024-10-20 09:15:33',
      guestName: 'Michael Chen',
      listingName: '3B E1 C - 42 Canary Wharf Tower',
      propertyId: 'prop_003',
      channel: 'direct',
      isSelectedForWebsite: true
    },
    {
      id: 7456,
      type: 'guest-to-host',
      status: 'published',
      rating: 2,
      publicReview: "Location was good but had several issues. Heating wasn't working properly and cleanliness was below standard.",
      reviewCategory: [
        { category: 'cleanliness', rating: 4 },
        { category: 'communication', rating: 8 },
        { category: 'location', rating: 9 },
        { category: 'heating', rating: 2 }
      ],
      submittedAt: '2024-09-28 16:45:11',
      guestName: 'Sarah Wilson',
      listingName: '2B N1 A - 29 Shoreditch Heights',
      propertyId: 'prop_001',
      channel: 'airbnb',
      isSelectedForWebsite: false,
      flaggedIssues: ['cleanliness', 'heating']
    },
    {
      id: 7457,
      type: 'guest-to-host',
      status: 'approved',
      rating: 4,
      publicReview: "Nice place in great location. Check-in was smooth and host was helpful. Would stay again!",
      reviewCategory: [
        { category: 'cleanliness', rating: 8 },
        { category: 'communication', rating: 9 },
        { category: 'location', rating: 10 },
        { category: 'checkin', rating: 9 }
      ],
      submittedAt: '2024-11-01 11:20:45',
      guestName: 'David Rodriguez',
      listingName: '1B S2 B - 15 Camden Lock',
      propertyId: 'prop_002',
      channel: 'google',
      isSelectedForWebsite: true
    }
  ];

  private constructor() {
    this.initializeReviews();
  }

  public static getInstance(): ReviewSyncService {
    if (!ReviewSyncService.instance) {
      ReviewSyncService.instance = new ReviewSyncService();
    }
    return ReviewSyncService.instance;
  }

  private initializeReviews(): void {
    this.reviews = [...this.mockReviews];
    logger.info('Initialized reviews cache with mock data', {
      count: this.reviews.length,
      service: 'ReviewSyncService'
    });
  }

  public startBackgroundSync(): void {
    // Run initial sync
    this.syncReviews().catch(error => {
      logger.error('Initial review sync failed', { error: error.message });
    });

    // Set up interval for every 4 hours (4 * 60 * 60 * 1000 ms)
    this.syncInterval = setInterval(() => {
      this.syncReviews().catch(error => {
        logger.error('Scheduled review sync failed', { error: error.message });
      });
    }, 4 * 60 * 60 * 1000);

    logger.info('Background review sync started - running every 4 hours', {
      service: 'ReviewSyncService'
    });
  }

  public stopBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      logger.info('Background review sync stopped', {
        service: 'ReviewSyncService'
      });
    }
  }

  private async authenticate(): Promise<string> {
    try {
      // Check if token is still valid (with 1 hour buffer)
      const now = Date.now();
      if (this.accessToken && this.tokenExpiryTime > now + 3600000) {
        return this.accessToken as string;
      }

      logger.info('Authenticating with Hostaway API', {
        service: 'ReviewSyncService'
      });

      const response: AxiosResponse<HostawayAuthResponse> = await axios.post(
        this.AUTH_URL,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
          scope: 'general'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiryTime = now + (response.data.expires_in * 1000);

      logger.info('Successfully authenticated with Hostaway API', {
        expiresIn: response.data.expires_in,
        service: 'ReviewSyncService'
      });

      return this.accessToken;
    } catch (error: any) {
      logger.error('Failed to authenticate with Hostaway API', {
        error: error.message,
        status: error.response?.status,
        service: 'ReviewSyncService'
      });
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  private async fetchReviews(): Promise<Review[]> {
    try {
      const token = await this.authenticate();

      logger.info('Fetching reviews from Hostaway API', {
        service: 'ReviewSyncService'
      });

      const response: AxiosResponse<HostawayReviewsResponse> = await axios.get(
        this.REVIEWS_URL,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      logger.info('Successfully fetched reviews from Hostaway API', {
        count: response.data.result.length,
        status: response.data.status,
        service: 'ReviewSyncService'
      });

      return response.data.result;
    } catch (error: any) {
      logger.error('Failed to fetch reviews from Hostaway API', {
        error: error.message,
        status: error.response?.status,
        service: 'ReviewSyncService'
      });
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }
  }

  public async syncReviews(): Promise<void> {
    try {
      logger.info('Starting review sync process', {
        currentCount: this.reviews.length,
        service: 'ReviewSyncService'
      });

      const newReviews = await this.fetchReviews();
      
      if (newReviews.length > 0) {
        // Merge new reviews with existing ones, avoiding duplicates
        const existingIds = new Set(this.reviews.map(review => review.id));
        const uniqueNewReviews = newReviews.filter(review => !existingIds.has(review.id));

        if (uniqueNewReviews.length > 0) {
          this.reviews.push(...uniqueNewReviews);
          logger.info('Successfully synced new reviews', {
            newReviews: uniqueNewReviews.length,
            totalReviews: this.reviews.length,
            service: 'ReviewSyncService'
          });
        } else {
          logger.info('No new reviews to sync', {
            service: 'ReviewSyncService'
          });
        }
      } else {
        logger.info('No reviews returned from API', {
          service: 'ReviewSyncService'
        });
      }
    } catch (error: any) {
      logger.error('Review sync process failed', {
        error: error.message,
        service: 'ReviewSyncService'
      });
      // Don't throw here to prevent crashing the background process
    }
  }

  public getReviews(): Review[] {
    return [...this.reviews];
  }

  public getReviewById(id: number): Review | undefined {
    return this.reviews.find(review => review.id === id);
  }

  public getReviewStats(): { total: number; byStatus: Record<string, number>; lastSync: string } {
    const byStatus = this.reviews.reduce((acc, review) => {
      acc[review.status] = (acc[review.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Ensure required status counts are always present, even if 0
    const requiredStatuses = ['approved', 'pending', 'published'];
    requiredStatuses.forEach(status => {
      if (!(status in byStatus)) {
        byStatus[status] = 0;
      }
    });

    return {
      total: this.reviews.length,
      byStatus,
      lastSync: new Date().toISOString()
    };
  }

  // Method to manually trigger sync (useful for testing)
  public async manualSync(): Promise<{ success: boolean; error?: string; stats?: any }> {
    try {
      await this.syncReviews();
      return {
        success: true,
        stats: this.getReviewStats()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Method to update review status
  public updateReviewStatus(id: number, status: string, reason?: string): { success: boolean; review?: Review; error?: string } {
    try {
      const reviewIndex = this.reviews.findIndex(review => review.id === id);
      
      if (reviewIndex === -1) {
        return {
          success: false,
          error: 'Review not found'
        };
      }

      const oldStatus = this.reviews[reviewIndex].status;
      this.reviews[reviewIndex] = {
        ...this.reviews[reviewIndex],
        status,
        updatedAt: new Date().toISOString(),
        ...(reason && { rejectionReason: reason })
      };

      logger.info('Review status updated', {
        reviewId: id,
        oldStatus,
        newStatus: status,
        reason,
        service: 'ReviewSyncService'
      });

      return {
        success: true,
        review: this.reviews[reviewIndex]
      };
    } catch (error: any) {
      logger.error('Failed to update review status', {
        reviewId: id,
        status,
        error: error.message,
        service: 'ReviewSyncService'
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Method to get dashboard statistics
  public getDashboardStats(): DashboardStats {
    const reviews = this.reviews;
    const totalReviews = reviews.length;
    
    // Calculate average rating (only for reviews with ratings)
    const reviewsWithRating = reviews.filter(review => review.rating !== null && review.rating !== undefined);
    const averageRating = reviewsWithRating.length > 0 
      ? Number((reviewsWithRating.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewsWithRating.length).toFixed(1))
      : 0;
    
    // Count reviews by status
    const statusCounts = reviews.reduce((acc, review) => {
      acc[review.status] = (acc[review.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const pendingReviews = (statusCounts['pending'] || 0) + (statusCounts['approved'] || 0);
    const publishedReviews = statusCounts['published'] || 0;
    
    // Count flagged issues
    const flaggedIssues = reviews.filter(review => 
      review.flaggedIssues && review.flaggedIssues.length > 0
    ).length;
    
    // Count unique properties
    const uniqueProperties = new Set(reviews.map(review => review.propertyId)).size;
    
    return {
      totalReviews,
      averageRating,
      pendingReviews,
      publishedReviews,
      flaggedIssues,
      propertiesCount: uniqueProperties
    };
  }
}