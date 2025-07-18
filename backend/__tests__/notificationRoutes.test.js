const request = require('supertest');
const app = require('../index');

describe('📢 Notification Routes', () => {
  const testUid = 'test-user';
  const testNotification = {
    uid: testUid,
    type: 'assignment',
    message: 'You have a new event assigned!',
    data: { eventId: 'event_001' }
  };

  // POST /api/notifications/send
  it('should send a notification', async () => {
    const res = await request(app)
      .post('/api/notifications/send')
      .send(testNotification);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Notification sent');
  });

  // GET /api/notifications/:uid
  it('should fetch notifications for the user', async () => {
    const res = await request(app)
      .get(`/api/notifications/${testUid}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.notifications)).toBe(true);
    expect(res.body.notifications.length).toBeGreaterThan(0);
    expect(res.body.notifications[0].message).toBe(testNotification.message);
  });

  // PATCH /api/notifications/:uid/read
  it('should mark all notifications as read', async () => {
    const res = await request(app)
      .patch(`/api/notifications/${testUid}/read`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('All notifications marked as read');

    const confirm = await request(app).get(`/api/notifications/${testUid}`);
    expect(confirm.body.notifications.every(n => n.read === true)).toBe(true);
  });

  // Validation: POST without required fields
  it('should fail if uid, type, or message is missing', async () => {
    const res = await request(app)
      .post('/api/notifications/send')
      .send({ uid: 'abc', message: 'Missing type' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

