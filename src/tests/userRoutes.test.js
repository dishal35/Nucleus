const request = require('supertest');
const app = require('../index'); // Adjust the path as necessary
const sequelize = require('../config/db');
const User = require('../models/User');

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Reset the database before tests
});

afterAll(async () => {
  await sequelize.close(); // Close the database connection after tests
});

describe('User Routes', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'student'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully');
  });

  it('should login a user', async () => {
    const response = await request(app)
      .post('/api/user/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id');
  });
});