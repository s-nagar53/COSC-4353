const request = require('supertest');
const app = require('../index');

// Mock firebase BEFORE importing anything that depends on it
jest.mock('../firebase', () => {
  const mockStates = [
    { id: 'tx', name: 'Texas', region: 'south' },
    { id: 'ny', name: 'New York', region: 'northeast' }
  ];

  const get = jest.fn().mockResolvedValue({
    forEach: (cb) => mockStates.forEach(d => cb({ id: d.id, data: () => d }))
  });

  const orderBy = jest.fn(() => ({ get }));
  const where = jest.fn(() => ({ orderBy }));

  const collection = jest.fn(() => ({ orderBy, where }));

  return {
    db: { collection },
    __mockData: { mockStates }
  };
});

const { db, __mockData } = require('../firebase');

describe('State Routes', () => {
  beforeEach(() => {
    __mockData.mockStates.length = 0;
    __mockData.mockStates.push(
      { id: 'tx', name: 'Texas', region: 'south' },
      { id: 'ny', name: 'New York', region: 'northeast' }
    );
  });

  it('GET /api/state/all - should return all states', async () => {
    const res = await request(app).get('/api/states/all');
    expect(res.statusCode).toBe(200);
    expect(res.body.states).toBeDefined();
    expect(res.body.states.length).toBeGreaterThan(0);
    expect(res.body.states[0]).toHaveProperty('id');
    expect(res.body.states[0]).toHaveProperty('name');
  });

  it('GET /api/state/region/south - should return states in region', async () => {
    const res = await request(app).get('/api/states/region/south');
    expect(res.statusCode).toBe(200);
    expect(res.body.states).toBeDefined();
    expect(res.body.states.some(s => s.region === 'south')).toBe(true);
  });

  it('GET /api/state/all - fallback if Firestore throws', async () => {
    const originalCollection = db.collection;

    db.collection = jest.fn(() => ({
      orderBy: jest.fn(() => ({
        get: jest.fn().mockRejectedValue(new Error('Firestore failed'))
      }))
    }));

    const res = await request(app).get('/api/states/all');
    expect(res.statusCode).toBe(200);
    expect(res.body.states).toBeDefined();

    db.collection = originalCollection;
  });

/*  it('GET /api/state/region/invalid - returns 500 if Firestore throws', async () => {
    const originalCollection = db.collection;

    db.collection = jest.fn(() => ({
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          get: jest.fn().mockRejectedValue(new Error('Firestore region error'))
        }))
      }))
    }));

    const res = await request(app).get('/api/states/region/west');
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Failed to fetch states');

    db.collection = originalCollection;
  });
  */
});
