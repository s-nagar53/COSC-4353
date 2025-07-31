// __tests__/profileRoutes.test.js

jest.mock('../firebase'); // Use Firestore mock

const request = require('supertest');
const express = require('express');
const profileRoutes = require('../routes/profileRoutes');

const app = express();
app.use(express.json());
app.use('/api/profile', profileRoutes);

describe('POST /api/profile', () => {
  const baseProfile = {
    uid: 'test123',
    role: 'volunteer',
    name: 'Test User',
    address: '123 Main St',
    address2: '',
    city: 'Houston',
    state: 'TX',
    zip: '77001',
    skills: ['Cooking'],
    availability: ['2024-10-01'],
  };

  it('should save a valid volunteer profile', async () => {
    const res = await request(app).post('/api/profile').send(baseProfile);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/saved/i);
  });

  it('should return validation error for missing name', async () => {
    const { name, ...incomplete } = baseProfile;
    const res = await request(app).post('/api/profile').send(incomplete);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors).toContain('Full Name is required');
  });

  it('should return 400 if uid or role is missing', async () => {
    const { uid, role, ...rest } = baseProfile;
    const res = await request(app).post('/api/profile').send(rest);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Missing UID or role');
  });

  it('should save a valid admin profile', async () => {
    const adminProfile = {
      uid: 'admin42',
      role: 'admin',
      name: 'Admin User',
      address: '456 Admin Rd',
      address2: '',
      city: 'Austin',
      state: 'TX',
      zip: '73301',
    };
    const res = await request(app).post('/api/profile').send(adminProfile);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/saved/i);
  });
});

describe('GET /api/profile/:uid', () => {
  it('should return 404 for unknown profile', async () => {
    const res = await request(app).get('/api/profile/notfound');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Profile not found');
  });
});

describe('POST /api/profile/:uid/history', () => {
  it('should return 404 for unknown user', async () => {
    const res = await request(app).post('/api/profile/unknown/history').send({});
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it('should add history to a valid user (mocked)', async () => {
    const history = {
      eid: 'ev123',
      eventname: 'Food Drive',
      address: '123 Main St',
      city: 'Houston',
      state: 'TX',
      zip: '77001',
      skills: ['Cooking'],
      requiredSkills: ['Cooking'],
      urgency: 'High',
      availability: ['2025-12-01']
    };
    const res = await request(app).post('/api/profile/u1/history').send(history);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/history added/i);
  });
});

describe('GET /api/profile/volunteer-history', () => {
  it('should return an array of volunteers (mocked)', async () => {
    const res = await request(app).get('/api/profile/volunteer-history');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

it('should return profile data for a valid UID', async () => {
  const res = await request(app).get('/api/profile/u1');
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('uid', 'u1');
});
