// __mocks__/firebase-admin.js
const authMock = {
  verifyIdToken: jest.fn(() => Promise.resolve({ uid: 'mockUid' })),
  setCustomUserClaims: jest.fn(() => Promise.resolve())
};

module.exports = {
  apps: [], // ✅ required to prevent `admin.apps.length` crash
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn()
  },
  auth: jest.fn(() => authMock),
  firestore: jest.fn(() => ({})) // ✅ optional: allows importing `db = admin.firestore()`
};
