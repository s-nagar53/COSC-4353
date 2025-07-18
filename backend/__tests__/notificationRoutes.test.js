const request = require('supertest');
const express = require('express');
const notificationRoutes = require('../routes/notificationRoutes');
const { notifications } = require('../data/memoryStore');

const app = express();
app.use(express.json());
app.use('/api/notifications', notificationRoutes);

describe('Notification Routes', () => {
  const testUid = 'test-user';

  beforeEach(() => {
    // Reset notifications before each test
    Object.keys(notifications).forEach(key => delete notifications[key]);
  });

  it('should send a notification', async () => {
    const res = await request(app)
      .post('/api/notifications/send')
      .send({ uid: testUid, type: 'info', message: 'Test message', data: { foo: 'bar' } });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/Notification sent/);
    expect(notifications[testUid]).toHaveLength(1);
    expect(notifications[testUid][0].type).toBe('info');
    expect(notifications[testUid][0].message).toBe('Test message');
    expect(notifications[testUid][0].data).toEqual({ foo: 'bar' });
    expect(notifications[testUid][0].read).toBe(false);
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/notifications/send')
      .send({ uid: testUid, type: 'info' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/required/);
  });

  it('should get all notifications for a user', async () => {
    notifications[testUid] = [
      { type: 'info', message: 'msg1', data: {}, timestamp: new Date().toISOString(), read: false },
      { type: 'alert', message: 'msg2', data: {}, timestamp: new Date().toISOString(), read: false },
    ];
    const res = await request(app).get(`/api/notifications/${testUid}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.notifications)).toBe(true);
    expect(res.body.notifications).toHaveLength(2);
  });

  it('should mark all notifications as read for a user', async () => {
    notifications[testUid] = [
      { type: 'info', message: 'msg1', data: {}, timestamp: new Date().toISOString(), read: false },
      { type: 'alert', message: 'msg2', data: {}, timestamp: new Date().toISOString(), read: false },
    ];
    const res = await request(app).patch(`/api/notifications/${testUid}/read`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/marked as read/);
    expect(notifications[testUid].every(n => n.read)).toBe(true);
  });
}); 