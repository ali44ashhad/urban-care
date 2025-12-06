 // src/tests/sample.test.js
// Requires: jest, supertest
const request = require('supertest');
const app = require('../../src/app');

describe('Health check', () => {
  test('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });
});
