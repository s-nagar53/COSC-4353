module.exports = {
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn()
  },
  auth: () => ({
    verifyIdToken: jest.fn(() => Promise.resolve({ uid: 'mockUid' })),
    setCustomUserClaims: jest.fn(() => Promise.resolve())
  })
};
