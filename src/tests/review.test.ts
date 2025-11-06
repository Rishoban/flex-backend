import request from 'supertest';
import app from '../index';

// Helper function to get auth token
const getAuthToken = async (): Promise<string> => {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'admin@gmail.com',
      password: '123456'
    });
  return response.body.data.token;
};

describe('Review Endpoints', () => {
  describe('GET /api/v1/reviews', () => {
    it('should return all reviews from cache with pagination', async () => {
      const token = await getAuthToken();
      const response = await request(app)
        .get('/api/v1/reviews')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Reviews retrieved successfully');
      expect(response.body.data).toHaveProperty('reviews');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.reviews)).toBe(true);
      expect(response.body.data.reviews.length).toBeGreaterThan(0);
      expect(response.body.data.pagination).toHaveProperty('page');
      expect(response.body.data.pagination).toHaveProperty('limit');
      expect(response.body.data.pagination).toHaveProperty('total');
      expect(response.body.data.pagination).toHaveProperty('pages');
    });
  });

  describe('GET /api/v1/reviews/:id', () => {
    it('should return a specific review by ID', async () => {
      const token = await getAuthToken();
      const response = await request(app)
        .get('/api/v1/reviews/7453')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Review retrieved successfully');
      expect(response.body.data).toHaveProperty('id', 7453);
      expect(response.body.data).toHaveProperty('guestName', 'Shane Finkelstein');
    });

    it('should return 404 for non-existent review', async () => {
      const token = await getAuthToken();
      const response = await request(app)
        .get('/api/v1/reviews/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Review not found');
    });

    it('should return 400 for invalid review ID', async () => {
      const token = await getAuthToken();
      const response = await request(app)
        .get('/api/v1/reviews/invalid')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid review ID');
    });
  });

  describe('GET /api/v1/reviews/stats', () => {
    it('should return review statistics', async () => {
      const token = await getAuthToken();
      const response = await request(app)
        .get('/api/v1/reviews/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Review statistics retrieved successfully');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('byStatus');
      expect(response.body.data).toHaveProperty('lastSync');
      expect(typeof response.body.data.total).toBe('number');
      expect(typeof response.body.data.byStatus).toBe('object');
    });

    it('should always include required status counts', async () => {
      const token = await getAuthToken();
      const response = await request(app)
        .get('/api/v1/reviews/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      const byStatus = response.body.data.byStatus;
      
      // Check that all required status counts are present
      const requiredStatuses = ['approved', 'pending', 'published'];
      requiredStatuses.forEach(status => {
        expect(byStatus).toHaveProperty(status);
        expect(typeof byStatus[status]).toBe('number');
        expect(byStatus[status]).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('POST /api/v1/reviews/sync', () => {
    it('should trigger manual review sync', async () => {
      const token = await getAuthToken();
      const response = await request(app)
        .post('/api/v1/reviews/sync')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Review sync completed successfully');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('byStatus');
    });

    it('should support pagination parameters', async () => {
      const token = await getAuthToken();
      const response = await request(app)
        .get('/api/v1/reviews?page=1&limit=2&sortBy=guestName&sortOrder=asc')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
      expect(response.body.data.reviews.length).toBeLessThanOrEqual(2);
    });

    it('should support status filtering', async () => {
      const token = await getAuthToken();
      const response = await request(app)
        .get('/api/v1/reviews?status=published')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      response.body.data.reviews.forEach((review: any) => {
        expect(review.status).toBe('published');
      });
    });
  });

  describe('Review Actions', () => {
    let authToken: string;

    beforeAll(async () => {
      authToken = await getAuthToken();
    });

    describe('PATCH /api/v1/reviews/:id/approve', () => {
      it('should approve a review successfully', async () => {
        const response = await request(app)
          .patch('/api/v1/reviews/7453/approve')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Review approved successfully');
        expect(response.body.data.status).toBe('approved');
        expect(response.body.data).toHaveProperty('updatedAt');
      });

      it('should return 404 for non-existent review', async () => {
        const response = await request(app)
          .patch('/api/v1/reviews/999999/approve')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Review not found');
      });

      it('should return 400 for invalid review ID', async () => {
        const response = await request(app)
          .patch('/api/v1/reviews/invalid/approve')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Invalid review ID');
      });

      it('should require authentication', async () => {
        await request(app)
          .patch('/api/v1/reviews/7453/approve')
          .expect(401);
      });
    });

    describe('PATCH /api/v1/reviews/:id/publish', () => {
      it('should publish a review successfully', async () => {
        const response = await request(app)
          .patch('/api/v1/reviews/7454/publish')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Review published successfully');
        expect(response.body.data.status).toBe('published');
        expect(response.body.data).toHaveProperty('updatedAt');
      });

      it('should return 404 for non-existent review', async () => {
        const response = await request(app)
          .patch('/api/v1/reviews/999999/publish')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Review not found');
      });

      it('should return 400 for invalid review ID', async () => {
        const response = await request(app)
          .patch('/api/v1/reviews/invalid/publish')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Invalid review ID');
      });

      it('should require authentication', async () => {
        await request(app)
          .patch('/api/v1/reviews/7454/publish')
          .expect(401);
      });
    });

    describe('PATCH /api/v1/reviews/:id/reject', () => {
      it('should reject a review with reason', async () => {
        const rejectionReason = 'Inappropriate content detected';
        const response = await request(app)
          .patch('/api/v1/reviews/7455/reject')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ reason: rejectionReason })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Review rejected successfully');
        expect(response.body.data.status).toBe('rejected');
        expect(response.body.data.rejectionReason).toBe(rejectionReason);
        expect(response.body.data).toHaveProperty('updatedAt');
      });

      it('should reject a review without reason', async () => {
        const response = await request(app)
          .patch('/api/v1/reviews/7456/reject')
          .set('Authorization', `Bearer ${authToken}`)
          .send({})
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Review rejected successfully');
        expect(response.body.data.status).toBe('rejected');
        expect(response.body.data).toHaveProperty('updatedAt');
      });

      it('should return 400 for invalid reason length', async () => {
        const longReason = 'x'.repeat(501); // Too long
        const response = await request(app)
          .patch('/api/v1/reviews/7457/reject')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ reason: longReason })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
      });

      it('should return 404 for non-existent review', async () => {
        const response = await request(app)
          .patch('/api/v1/reviews/999999/reject')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ reason: 'Test reason' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Review not found');
      });

      it('should return 400 for invalid review ID', async () => {
        const response = await request(app)
          .patch('/api/v1/reviews/invalid/reject')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ reason: 'Test reason' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Invalid review ID');
      });

      it('should require authentication', async () => {
        await request(app)
          .patch('/api/v1/reviews/7457/reject')
          .send({ reason: 'Test reason' })
          .expect(401);
      });
    });
  });

  describe('GET /api/v1/dashboard/stats', () => {
    let authToken: string;

    beforeAll(async () => {
      authToken = await getAuthToken();
    });

    it('should return dashboard statistics successfully', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Dashboard statistics retrieved successfully');
      expect(response.body.data).toHaveProperty('totalReviews');
      expect(response.body.data).toHaveProperty('averageRating');
      expect(response.body.data).toHaveProperty('pendingReviews');
      expect(response.body.data).toHaveProperty('publishedReviews');
      expect(response.body.data).toHaveProperty('flaggedIssues');
      expect(response.body.data).toHaveProperty('propertiesCount');

      // Verify data types
      expect(typeof response.body.data.totalReviews).toBe('number');
      expect(typeof response.body.data.averageRating).toBe('number');
      expect(typeof response.body.data.pendingReviews).toBe('number');
      expect(typeof response.body.data.publishedReviews).toBe('number');
      expect(typeof response.body.data.flaggedIssues).toBe('number');
      expect(typeof response.body.data.propertiesCount).toBe('number');

      // Verify reasonable values
      expect(response.body.data.totalReviews).toBeGreaterThanOrEqual(0);
      expect(response.body.data.averageRating).toBeGreaterThanOrEqual(0);
      expect(response.body.data.averageRating).toBeLessThanOrEqual(10);
      expect(response.body.data.pendingReviews).toBeGreaterThanOrEqual(0);
      expect(response.body.data.publishedReviews).toBeGreaterThanOrEqual(0);
      expect(response.body.data.flaggedIssues).toBeGreaterThanOrEqual(0);
      expect(response.body.data.propertiesCount).toBeGreaterThanOrEqual(0);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    it('should calculate correct statistics from mock data', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const stats = response.body.data;
      
      // Based on mock data, we should have 5 reviews
      expect(stats.totalReviews).toBe(5);
      
      // Should have at least 1 property (since mock reviews have propertyId)
      expect(stats.propertiesCount).toBeGreaterThan(0);
      
      // Should have some published reviews from mock data
      expect(stats.publishedReviews).toBeGreaterThan(0);
      
      // Average rating should be reasonable (1-10 scale)
      if (stats.averageRating > 0) {
        expect(stats.averageRating).toBeGreaterThanOrEqual(1);
        expect(stats.averageRating).toBeLessThanOrEqual(10);
      }
    });
  });

  describe('GET /api/v1/form/dropdowns', () => {
    let authToken: string;

    beforeAll(async () => {
      authToken = await getAuthToken();
    });

    it('should return form dropdown data successfully', async () => {
      const response = await request(app)
        .get('/api/v1/form/dropdowns')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('statuses');
      expect(response.body.data).toHaveProperty('metadata');

      // Verify statuses array structure
      expect(Array.isArray(response.body.data.statuses)).toBe(true);
      expect(response.body.data.statuses.length).toBe(5);

      // Verify each status has required properties
      response.body.data.statuses.forEach((status: any) => {
        expect(status).toHaveProperty('value');
        expect(status).toHaveProperty('label');
        expect(status).toHaveProperty('description');
        expect(status).toHaveProperty('color');
        expect(status).toHaveProperty('icon');
        expect(status).toHaveProperty('sortOrder');
        expect(status).toHaveProperty('isActive');
        expect(status).toHaveProperty('permissions');

        // Verify data types
        expect(typeof status.value).toBe('string');
        expect(typeof status.label).toBe('string');
        expect(typeof status.description).toBe('string');
        expect(typeof status.color).toBe('string');
        expect(typeof status.icon).toBe('string');
        expect(typeof status.sortOrder).toBe('number');
        expect(typeof status.isActive).toBe('boolean');
        expect(Array.isArray(status.permissions)).toBe(true);
      });

      // Verify metadata structure
      expect(response.body.data.metadata).toHaveProperty('totalCount');
      expect(response.body.data.metadata).toHaveProperty('activeCount');
      expect(response.body.data.metadata).toHaveProperty('lastUpdated');
      expect(typeof response.body.data.metadata.totalCount).toBe('number');
      expect(typeof response.body.data.metadata.activeCount).toBe('number');
      expect(typeof response.body.data.metadata.lastUpdated).toBe('string');
    });

    it('should return specific status values', async () => {
      const response = await request(app)
        .get('/api/v1/form/dropdowns')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const statusValues = response.body.data.statuses.map((s: any) => s.value);
      expect(statusValues).toContain('Pending');
      expect(statusValues).toContain('Approved');
      expect(statusValues).toContain('Published');
      expect(statusValues).toContain('Rejected');
      expect(statusValues).toContain('Flagged');
    });

    it('should return statuses in correct sort order', async () => {
      const response = await request(app)
        .get('/api/v1/form/dropdowns')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const sortOrders = response.body.data.statuses.map((s: any) => s.sortOrder);
      expect(sortOrders).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return valid color codes', async () => {
      const response = await request(app)
        .get('/api/v1/form/dropdowns')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.statuses.forEach((status: any) => {
        expect(status.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('should return valid permissions for each status', async () => {
      const response = await request(app)
        .get('/api/v1/form/dropdowns')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const validPermissions = ['view', 'update', 'publish', 'unpublish', 'reapprove', 'resolve'];
      
      response.body.data.statuses.forEach((status: any) => {
        expect(status.permissions.length).toBeGreaterThan(0);
        status.permissions.forEach((permission: string) => {
          expect(validPermissions).toContain(permission);
        });
      });
    });

    it('should return correct metadata counts', async () => {
      const response = await request(app)
        .get('/api/v1/form/dropdowns')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { metadata, statuses } = response.body.data;
      expect(metadata.totalCount).toBe(statuses.length);
      
      const activeStatuses = statuses.filter((s: any) => s.isActive);
      expect(metadata.activeCount).toBe(activeStatuses.length);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/form/dropdowns')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('Unauthorized Access', () => {
    it('should return 401 for unauthenticated review access', async () => {
      const response = await request(app).get('/api/v1/reviews');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });
  });
});