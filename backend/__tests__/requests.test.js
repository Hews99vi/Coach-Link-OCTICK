const request = require('supertest');
const express = require('express');
const requestsRouter = require('../routes/requests');
const { sequelize } = require('../models');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/requests', requestsRouter);

describe('POST /api/requests', () => {
  beforeAll(async () => {
    // Sync database before tests
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Close database connection after tests
    await sequelize.close();
  });

  describe('with valid data', () => {
    it('should create a service request and return 201', async () => {
      const validRequest = {
        customer_name: 'John Doe',
        phone: '555-1234',
        pickup_location: '123 Main St',
        dropoff_location: '456 Oak Ave',
        pickup_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        passengers: 3,
        notes: 'Test request'
      };

      const response = await request(app)
        .post('/api/requests')
        .send(validRequest)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.customer_name).toBe('John Doe');
      expect(response.body.data.phone).toBe('555-1234');
      expect(response.body.data.status).toBe('pending');
      expect(response.body.message).toBe('Service request created successfully');
    });

    it('should create request with minimum required fields', async () => {
      const minimalRequest = {
        customer_name: 'Jane Smith',
        phone: '555-5678',
        pickup_location: '789 Elm St',
        dropoff_location: '321 Pine Ave',
        pickup_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        passengers: 1
      };

      const response = await request(app)
        .post('/api/requests')
        .send(minimalRequest)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notes).toBeNull();
    });
  });

  describe('with invalid data', () => {
    it('should return 400 when customer_name is missing', async () => {
      const invalidRequest = {
        phone: '555-1234',
        pickup_location: '123 Main St',
        dropoff_location: '456 Oak Ave',
        pickup_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        passengers: 3
      };

      const response = await request(app)
        .post('/api/requests')
        .send(invalidRequest)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 400 when phone is missing', async () => {
      const invalidRequest = {
        customer_name: 'John Doe',
        pickup_location: '123 Main St',
        dropoff_location: '456 Oak Ave',
        pickup_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        passengers: 3
      };

      const response = await request(app)
        .post('/api/requests')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should return 400 when pickup_location is missing', async () => {
      const invalidRequest = {
        customer_name: 'John Doe',
        phone: '555-1234',
        dropoff_location: '456 Oak Ave',
        pickup_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        passengers: 3
      };

      const response = await request(app)
        .post('/api/requests')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when dropoff_location is missing', async () => {
      const invalidRequest = {
        customer_name: 'John Doe',
        phone: '555-1234',
        pickup_location: '123 Main St',
        pickup_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        passengers: 3
      };

      const response = await request(app)
        .post('/api/requests')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when pickup_time is missing', async () => {
      const invalidRequest = {
        customer_name: 'John Doe',
        phone: '555-1234',
        pickup_location: '123 Main St',
        dropoff_location: '456 Oak Ave',
        passengers: 3
      };

      const response = await request(app)
        .post('/api/requests')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when passengers is missing', async () => {
      const invalidRequest = {
        customer_name: 'John Doe',
        phone: '555-1234',
        pickup_location: '123 Main St',
        dropoff_location: '456 Oak Ave',
        pickup_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/requests')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when passengers is not a number', async () => {
      const invalidRequest = {
        customer_name: 'John Doe',
        phone: '555-1234',
        pickup_location: '123 Main St',
        dropoff_location: '456 Oak Ave',
        pickup_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        passengers: 'three'
      };

      const response = await request(app)
        .post('/api/requests')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when passengers is less than 1', async () => {
      const invalidRequest = {
        customer_name: 'John Doe',
        phone: '555-1234',
        pickup_location: '123 Main St',
        dropoff_location: '456 Oak Ave',
        pickup_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        passengers: 0
      };

      const response = await request(app)
        .post('/api/requests')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when passengers is greater than 50', async () => {
      const invalidRequest = {
        customer_name: 'John Doe',
        phone: '555-1234',
        pickup_location: '123 Main St',
        dropoff_location: '456 Oak Ave',
        pickup_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        passengers: 51
      };

      const response = await request(app)
        .post('/api/requests')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when pickup_time is invalid date', async () => {
      const invalidRequest = {
        customer_name: 'John Doe',
        phone: '555-1234',
        pickup_location: '123 Main St',
        dropoff_location: '456 Oak Ave',
        pickup_time: 'not-a-date',
        passengers: 3
      };

      const response = await request(app)
        .post('/api/requests')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
