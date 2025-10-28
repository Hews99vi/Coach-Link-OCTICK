const request = require('supertest');
const app = require('../app');

describe('Analytics API Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Login
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'coordinator',
        password: 'password'
      });
    
    authToken = response.body.token;
  });

  describe('GET /api/analytics/daily', () => {
    it('should return daily request counts', async () => {
      const response = await request(app)
        .get('/api/analytics/daily')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('date');
        expect(response.body.data[0]).toHaveProperty('count');
      }
    });

    it('should return data for last 7 days', async () => {
      const response = await request(app)
        .get('/api/analytics/daily')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data.length).toBeLessThanOrEqual(7);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/analytics/daily');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/analytics/status', () => {
    it('should return request counts by status', async () => {
      const response = await request(app)
        .get('/api/analytics/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('status');
        expect(response.body.data[0]).toHaveProperty('count');
        
        // Verify status is one of the valid values
        const validStatuses = ['pending', 'approved', 'scheduled', 'completed', 'rejected'];
        expect(validStatuses).toContain(response.body.data[0].status);
      }
    });

    it('should return counts for all status types', async () => {
      const response = await request(app)
        .get('/api/analytics/status')
        .set('Authorization', `Bearer ${authToken}`);

      const statuses = response.body.data.map(item => item.status);
      const expectedStatuses = ['pending', 'approved', 'scheduled', 'completed', 'rejected'];
      
      // Check that we have counts for each status (even if count is 0)
      expectedStatuses.forEach(status => {
        const found = response.body.data.find(item => item.status === status);
        expect(found).toBeDefined();
      });
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/analytics/status');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/analytics/overview', () => {
    it('should return overview statistics', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalRequests');
      expect(response.body.data).toHaveProperty('totalDrivers');
      expect(response.body.data).toHaveProperty('totalVehicles');
      expect(typeof response.body.data.totalRequests).toBe('number');
      expect(typeof response.body.data.totalDrivers).toBe('number');
      expect(typeof response.body.data.totalVehicles).toBe('number');
    });

    it('should return non-negative counts', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data.totalRequests).toBeGreaterThanOrEqual(0);
      expect(response.body.data.totalDrivers).toBeGreaterThanOrEqual(0);
      expect(response.body.data.totalVehicles).toBeGreaterThanOrEqual(0);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/analytics/overview');

      expect(response.status).toBe(401);
    });
  });

  describe('Analytics for Viewer Role', () => {
    let viewerToken;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'viewer',
          password: 'viewer123'
        });
      
      viewerToken = response.body.token;
    });

    it('should allow viewer to access analytics/daily', async () => {
      const response = await request(app)
        .get('/api/analytics/daily')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.status).toBe(200);
    });

    it('should allow viewer to access analytics/status', async () => {
      const response = await request(app)
        .get('/api/analytics/status')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.status).toBe(200);
    });

    it('should allow viewer to access analytics/overview', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.status).toBe(200);
    });
  });
});
