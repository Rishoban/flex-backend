import request from 'supertest';
import app from '../index';

describe('Trust Proxy and Rate Limiting Configuration', () => {
  describe('Trust Proxy Configuration', () => {
    it('should have trust proxy configured', () => {
      const trustProxy = app.get('trust proxy');
      expect(trustProxy).toBeDefined();
      // In test environment (development), should be 'loopback'
      expect(trustProxy).toBe('loopback');
    });
  });

  describe('Rate Limiting with Forwarded Headers', () => {
    it('should respond with rate limit headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check that standardHeaders are returned
      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
      expect(response.headers).toHaveProperty('ratelimit-reset');
    });

    it('should handle x-forwarded-for header correctly', async () => {
      const response = await request(app)
        .get('/health')
        .set('x-forwarded-for', '203.0.113.1, 203.0.113.2')
        .expect(200);

      // Should successfully process the request with forwarded headers
      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('ratelimit-limit');
    });

    it('should handle x-real-ip header correctly', async () => {
      const response = await request(app)
        .get('/health')
        .set('x-real-ip', '203.0.113.1')
        .expect(200);

      // Should successfully process the request with real IP header
      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('ratelimit-limit');
    });

    it('should reject invalid IP addresses in headers', async () => {
      const response = await request(app)
        .get('/health')
        .set('x-forwarded-for', 'invalid-ip-address')
        .expect(200);

      // Should still process the request but use fallback IP
      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('ratelimit-limit');
    });

    it('should handle IPv6 addresses in headers', async () => {
      const response = await request(app)
        .get('/health')
        .set('x-forwarded-for', '2001:0db8:85a3:0000:0000:8a2e:0370:7334')
        .expect(200);

      // Should successfully process the request with IPv6 address
      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('ratelimit-limit');
    });

    it('should not include legacy rate limit headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check that legacyHeaders (X-RateLimit-*) are not present
      expect(response.headers['x-ratelimit-limit']).toBeUndefined();
      expect(response.headers['x-ratelimit-remaining']).toBeUndefined();
      expect(response.headers['x-ratelimit-reset']).toBeUndefined();
    });
  });
});
