const request = require('supertest');
const app = require('../app');

describe('Vehicles API Tests', () => {
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

  describe('GET /api/vehicles', () => {
    it('should return list of vehicles for authenticated users', async () => {
      const response = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/vehicles');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/vehicles/:id', () => {
    it('should return vehicle details for valid ID', async () => {
      const response = await request(app)
        .get('/api/vehicles/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('make');
      expect(response.body.data).toHaveProperty('model');
      expect(response.body.data).toHaveProperty('license_plate');
      expect(response.body.data).toHaveProperty('capacity');
    });

    it('should return 404 for non-existent vehicle', async () => {
      const response = await request(app)
        .get('/api/vehicles/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/vehicles', () => {
    it('should create new vehicle with valid data', async () => {
      const newVehicle = {
        make: 'Ford',
        model: 'Transit',
        year: 2023,
        license_plate: 'TEST123',
        capacity: 15,
        available: true
      };

      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(newVehicle);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.make).toBe(newVehicle.make);
      expect(response.body.data.capacity).toBe(newVehicle.capacity);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidVehicle = {
        make: 'Ford'
        // Missing model, year, license_plate, capacity
      };

      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(invalidVehicle);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid capacity', async () => {
      const invalidVehicle = {
        make: 'Ford',
        model: 'Transit',
        year: 2023,
        license_plate: 'TEST456',
        capacity: -5  // Invalid negative capacity
      };

      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(invalidVehicle);

      expect(response.status).toBe(400);
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
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          make: 'Ford',
          model: 'Transit',
          year: 2023,
          license_plate: 'TEST789',
          capacity: 15
        });

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('should update vehicle with valid data', async () => {
      const updateData = {
        available: false,
        capacity: 20
      };

      const response = await request(app)
        .put('/api/vehicles/1')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.capacity).toBe(updateData.capacity);
      expect(response.body.data.available).toBe(updateData.available);
    });

    it('should return 404 for non-existent vehicle', async () => {
      const response = await request(app)
        .put('/api/vehicles/99999')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({ available: false });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('should delete vehicle', async () => {
      // First create a vehicle to delete
      const createResponse = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({
          make: 'Toyota',
          model: 'Coaster',
          year: 2020,
          license_plate: 'DEL123',
          capacity: 25
        });

      const vehicleId = createResponse.body.data.id;

      const deleteResponse = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${coordinatorToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      // Verify vehicle is deleted
      const getResponse = await request(app)
        .get(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
