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

describe('API Routes', () => {
  describe('GET /api/v1/status', () => {
    it('should return API status', async () => {
      const token = await getAuthToken();
      const response = await request(app)
        .get('/api/v1/status')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('version');
      expect(response.body.data).toHaveProperty('environment');
      expect(response.body.data.message).toBe('Flex Backend API is running');
    });
  });

  describe('GET /api/v1/hello', () => {
    it('should return hello world message', async () => {
      const token = await getAuthToken();
      const response = await request(app)
        .get('/api/v1/hello')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data.message).toBe('Hello, World!');
    });

    it('should return personalized greeting with name parameter', async () => {
      const token = await getAuthToken();
      const response = await request(app)
        .get('/api/v1/hello?name=John')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Hello, John!');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/v1/hello');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });
  });
});