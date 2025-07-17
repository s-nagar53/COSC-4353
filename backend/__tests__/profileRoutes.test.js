const request = require('supertest');
const express = require('express');
const profileRoutes = require('../routes/profileRoutes');
const { profiles } = require('../data/memoryStore');

// 🔁 Create isolated app instance for testing
const app = express();
app.use(express.json());
app.use('/api/profile', profileRoutes);

beforeEach(() => {
  // Reset in-memory store before each test
  profiles.admins = [];
  profiles.volunteers = [];
});

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
    const res = await request(app)
      .post('/api/profile')
      .send(baseProfile);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Profile saved successfully');
    expect(profiles.volunteers.length).toBe(1);
  });

  it('should return validation error for missing name', async () => {
    const { name, ...incomplete } = baseProfile;
    const res = await request(app)
      .post('/api/profile')
      .send({ ...incomplete });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(res.body.errors).toContain('Full Name is required');
  });

  it('should return 400 if uid or role is missing', async () => {
    const { uid, role, ...rest } = baseProfile;
    const res = await request(app)
      .post('/api/profile')
      .send(rest);

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
    // Admins don’t need skills/availability per your validation
  };

  const res = await request(app).post('/api/profile').send(adminProfile);
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe('Profile saved successfully');
  expect(profiles.admins.length).toBe(1);
});

});

describe('GET /api/profile/:uid', () => {
  it('should return a saved profile', async () => {
    profiles.admins.push({ uid: 'admin1', role: 'admin', name: 'Admin' });
    const res = await request(app).get('/api/profile/admin1');

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Admin');
  });

  it('should return 404 for unknown profile', async () => {
    const res = await request(app).get('/api/profile/notfound');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Profile not found');
  });
});
it('should return a volunteer profile if UID exists in volunteers', async () => {
  profiles.volunteers = [
    { uid: 'vol123', role: 'volunteer', name: 'Volunteer User' }
  ];
  profiles.admins = []; // Make sure admin array is empty

  const res = await request(app).get('/api/profile/vol123');
  expect(res.statusCode).toBe(200);
  expect(res.body.name).toBe('Volunteer User');
});
