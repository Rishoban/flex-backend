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

describe('Dropdown Endpoints', () => {
  describe('GET /api/v1/channels', () => {
    it('should return channels dropdown data successfully', async () => {
      const token = await getAuthToken();
      const response = await request(app)
        .get('/api/v1/channels')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('channels');
      expect(response.body.data).toHaveProperty('totalChannels');
      expect(response.body.data).toHaveProperty('totalReviews');
      expect(response.body.data).toHaveProperty('lastUpdated');
      expect(Array.isArray(response.body.data.channels)).toBe(true);

      // Check channel structure if any channels exist
      if (response.body.data.channels.length > 0) {
        const channel = response.body.data.channels[0];
        expect(channel).toHaveProperty('value');
        expect(channel).toHaveProperty('label');
        expect(channel).toHaveProperty('count');
        expect(channel).toHaveProperty('lastReview');
        expect(channel).toHaveProperty('isActive');
        expect(typeof channel.count).toBe('number');
        expect(typeof channel.isActive).toBe('boolean');
      }
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/channels')
        .expect(401);
    });

    it('should reject invalid token', async () => {
      await request(app)
        .get('/api/v1/channels')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('GET /api/v1/properties', () => {
    it('should return properties dropdown data successfully', async () => {
      const token = await getAuthToken();
      const response = await request(app)
        .get('/api/v1/properties')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data).toHaveProperty('totalProperties');
      expect(response.body.data).toHaveProperty('totalReviews');
      expect(response.body.data).toHaveProperty('lastUpdated');
      expect(Array.isArray(response.body.data.properties)).toBe(true);

      // Check property structure if any properties exist
      if (response.body.data.properties.length > 0) {
        const property = response.body.data.properties[0];
        expect(property).toHaveProperty('value');
        expect(property).toHaveProperty('label');
        expect(property).toHaveProperty('listingName');
        expect(property).toHaveProperty('count');
        expect(property).toHaveProperty('channels');
        expect(property).toHaveProperty('averageRating');
        expect(property).toHaveProperty('lastReview');
        expect(property).toHaveProperty('isActive');
        expect(typeof property.count).toBe('number');
        expect(typeof property.averageRating).toBe('number');
        expect(typeof property.listingName).toBe('string');
        expect(Array.isArray(property.channels)).toBe(true);
        expect(typeof property.isActive).toBe('boolean');
      }
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/properties')
        .expect(401);
    });

    it('should reject invalid token', async () => {
      await request(app)
        .get('/api/v1/properties')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Data consistency', () => {
    it('should have consistent data between channels and properties', async () => {
      const token = await getAuthToken();
      const [channelsResponse, propertiesResponse] = await Promise.all([
        request(app)
          .get('/api/v1/channels')
          .set('Authorization', `Bearer ${token}`),
        request(app)
          .get('/api/v1/properties')
          .set('Authorization', `Bearer ${token}`)
      ]);

      expect(channelsResponse.status).toBe(200);
      expect(propertiesResponse.status).toBe(200);

      const channelsData = channelsResponse.body.data;
      const propertiesData = propertiesResponse.body.data;

      // Both should have the same total reviews count
      expect(channelsData.totalReviews).toBe(propertiesData.totalReviews);

      // Check that channels mentioned in properties exist in channels list
      const channelValues = new Set(channelsData.channels.map((c: any) => c.label));
      propertiesData.properties.forEach((property: any) => {
        property.channels.forEach((channel: string) => {
          if (channel !== 'unknown') {
            expect(channelValues.has(channel)).toBe(true);
          }
        });
      });
    });

    it('should return sorted data by count (descending)', async () => {
      const token = await getAuthToken();
      const [channelsResponse, propertiesResponse] = await Promise.all([
        request(app)
          .get('/api/v1/channels')
          .set('Authorization', `Bearer ${token}`),
        request(app)
          .get('/api/v1/properties')
          .set('Authorization', `Bearer ${token}`)
      ]);

      // Check channels are sorted by count (descending)
      const channels = channelsResponse.body.data.channels;
      for (let i = 1; i < channels.length; i++) {
        expect(channels[i - 1].count).toBeGreaterThanOrEqual(channels[i].count);
      }

      // Check properties are sorted by count (descending)
      const properties = propertiesResponse.body.data.properties;
      for (let i = 1; i < properties.length; i++) {
        expect(properties[i - 1].count).toBeGreaterThanOrEqual(properties[i].count);
      }
    });
  });
});