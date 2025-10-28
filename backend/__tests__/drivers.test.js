const request = require('supertest');
const app = require('../app');
const { Driver } = require('../models');

describe('Driver API Tests', () => {
  let authToken;
  let coordinatorToken;

  beforeAll(async () => {
    // Login as coordinator
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'coordinator',
        password: 'password'
      });
    
    coordinatorToken = response.body.token;
    authToken = coordinatorToken;
  });

  describe('GET /api/drivers', () => {
    it('should return list of drivers for authenticated users', async () => {
      const response = await request(app)
        .get('/api/drivers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/drivers');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/drivers/:id', () => {
    it('should return driver details for valid ID', async () => {
      const response = await request(app)
        .get('/api/drivers/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('license_number');
    });

    it('should return 404 for non-existent driver', async () => {
      const response = await request(app)
        .get('/api/drivers/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/drivers', () => {
    it('should create new driver with valid data', async () => {
      const newDriver = {
        name: 'Test Driver',
        phone: '555-0123',
        license_number: 'DL12345678',
        available: true
      };

      const response = await request(app)
        .post('/api/drivers')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(newDriver);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(newDriver.name);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidDriver = {
        name: 'Test Driver'
        // Missing phone and license_number
      };

      const response = await request(app)
        .post('/api/drivers')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(invalidDriver);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for viewer role', async () => {
      const viewerResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'viewer',
          password: 'viewer123'
        });
      
      const viewerToken = viewerResponse.body.token;

      const response = await request(app)
        .post('/api/drivers')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          name: 'Test Driver',
          phone: '555-0123',
          license_number: 'DL12345678'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/drivers/:id', () => {
    it('should update driver with valid data', async () => {
      const updateData = {
        available: false,
        phone: '555-9999'
      };

      const response = await request(app)
        .put('/api/drivers/1')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.phone).toBe(updateData.phone);
      expect(response.body.data.available).toBe(updateData.available);
    });

    it('should return 404 for non-existent driver', async () => {
      const response = await request(app)
        .put('/api/drivers/99999')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({ available: false });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/drivers/:id', () => {
    it('should delete driver', async () => {
      // First create a driver to delete
      const createResponse = await request(app)
        .post('/api/drivers')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({
          name: 'Driver To Delete',
          phone: '555-DELETE',
          license_number: 'DL99999999'
        });

      const driverId = createResponse.body.data.id;

      const deleteResponse = await request(app)
        .delete(`/api/drivers/${driverId}`)
        .set('Authorization', `Bearer ${coordinatorToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      // Verify driver is deleted
      const getResponse = await request(app)
        .get(`/api/drivers/${driverId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
