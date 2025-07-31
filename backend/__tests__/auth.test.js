jest.mock('firebase-admin');

const request = require('supertest');
const app = require('../index');

describe('POST /set-role', () => {
  it('should return 400 if ID token or role is missing', async () => {
    const res = await request(app).post('/set-role').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing ID token or role/);
  });

  it('should return 200 with valid mocked token and role', async () => {
    const res = await request(app)
      .post('/set-role')
      .set('Authorization', 'Bearer mock-token')
      .send({ role: 'admin' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Role "admin" assigned to UID: mockUid/);
  });
});
