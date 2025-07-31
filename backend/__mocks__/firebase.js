const mockDataStore = {
  u1: {
    uid: 'u1',
    name: 'Mock User',
    role: 'volunteer',
    history: []
  }
};

const mockEvents = [];
const mockMatches = [];
const mockStates = [];

const mockAuth = {
  verifyIdToken: jest.fn(),
  setCustomUserClaims: jest.fn()
};

const mockAdmin = {
  auth: () => mockAuth
};

function createMockCollection(name) {
  let store;

  if (name === 'events') store = mockEvents;
  else if (name === 'matches') store = mockMatches;
  else if (name === 'states') store = mockStates;
  else store = mockDataStore; // default to profiles

  const makeSnapshot = (dataArray) => {
    const docs = dataArray.map((doc, i) => ({
      id: doc.eid || doc.uid || `mock-${i}`,
      data: () => doc
    }));
    return {
      docs,
      forEach: (cb) => docs.forEach(cb)
    };
  };

  const orderBy = jest.fn(() => ({
    get: jest.fn(() => Promise.resolve(makeSnapshot(store)))
  }));

  return {
    doc: jest.fn((docId) => {
      const id = docId;
      let index = Array.isArray(store)
        ? store.findIndex(e => e.eid === id || e.uid === id)
        : null;

      return {
        get: jest.fn(() => {
          if (Array.isArray(store)) {
            const doc = store.find(e => e.eid === id || e.uid === id);
            return Promise.resolve({
              exists: !!doc,
              id,
              data: () => doc || null
            });
          } else {
            const doc = store[id];
            return Promise.resolve({
              exists: !!doc,
              id,
              data: () => doc || null
            });
          }
        }),
        set: jest.fn((data) => {
          if (Array.isArray(store)) {
            store.push({ ...data });
          } else {
            store[id] = data;
          }
          return Promise.resolve();
        }),
        update: jest.fn((data) => {
          if (Array.isArray(store)) {
            if (index !== -1) store[index] = { ...store[index], ...data };
          } else {
            if (store[id]) store[id] = { ...store[id], ...data };
          }
          return Promise.resolve();
        }),
        delete: jest.fn(() => {
          if (Array.isArray(store) && index !== -1) {
            store.splice(index, 1);
          } else if (store[id]) {
            delete store[id];
          }
          return Promise.resolve();
        }),
      };
    }),

    get: jest.fn(() => {
      const docs = Array.isArray(store)
        ? store
        : Object.entries(store).map(([_, data]) => data);
      return Promise.resolve(makeSnapshot(docs));
    }),

    orderBy, // ✅ support top-level .orderBy()

    where: jest.fn(() => ({
      get: jest.fn(() => {
        if (name === 'profiles') {
          const docs = Object.entries(mockDataStore)
            .filter(([, data]) => data.role === 'volunteer')
            .map(([id, data]) => ({
              id,
              data: () => data
            }));
          return Promise.resolve({
            docs,
            forEach: (cb) => docs.forEach(cb)
          });
        } else if (name === 'matches') {
          const docs = mockMatches.map((doc, i) => ({
            id: doc.eventId || `match-${i}`,
            data: () => doc
          }));
          return Promise.resolve({
            docs,
            forEach: (cb) => docs.forEach(cb)
          });
        } else {
          return Promise.resolve({ docs: [], forEach: () => {} });
        }
      }),
      orderBy // ✅ support chained .where(...).orderBy()
    }))
  };
}

module.exports = {
  db: {
    collection: jest.fn((name) => createMockCollection(name))
  },
  admin: mockAdmin,
  __mockData: {
    mockEvents,
    mockMatches,
    mockDataStore,
    mockStates
  }
};
