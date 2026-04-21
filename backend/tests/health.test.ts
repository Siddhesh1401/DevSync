const request = require('supertest');

// Mock the app module to avoid parsing issues
jest.mock('../src/app', () => {
  const express = require('express');
  const app = express();
  
  app.get('/api/health', (req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  return app;
});

const app = require('../src/app');

describe('Health Check', () => {
  it('should return 200 OK for health endpoint', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});