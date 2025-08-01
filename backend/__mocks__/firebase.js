
const mockDataStore = {
  u1: {
    uid: 'u1',
    name: 'Mock User',
    city: 'Dallas',
    state: 'TX',
    role: 'volunteer',
    skills: ['packing', 'organizing'],
    availability: ['2025-08-05'],
    history: []
  },
  
};

const mockEvents = [];
const mockMatches = [];
const mockStates = [];

const mockFieldValue = {
  arrayUnion: (...args) => ({
    __arrayUnion__: args
  })
};

const mockAuth = {
  verifyIdToken: jest.fn(),
  setCustomUserClaims: jest.fn()
};

const mockAdmin = {
  auth: () => mockAuth,
  firestore: () => ({ FieldValue: mockFieldValue })
};
mockAdmin.firestore.FieldValue = mockFieldValue;

function createMockCollection(name) {
  let store;

  if (name === 'events') store = mockEvents;
  else if (name === 'matches') store = mockMatches;
  else if (name === 'states') store = mockStates;
  else store = mockDataStore;

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

  const orderBy = jest.fn(() => query);
  const limit = jest.fn(() => query);

  const query = {
    get: jest.fn(),
    where: jest.fn(() => query),
    orderBy,
    limit
  };

  return {
    doc: jest.fn((docId) => {
      const id = docId;
      let index = Array.isArray(store)
        ? store.findIndex(e => e.eid === id || e.uid === id)
        : null;

      return {
        get: jest.fn(() => {
          const doc = Array.isArray(store)
            ? store.find(e => e.eid === id || e.uid === id)
            : store[id];
          return Promise.resolve({
            exists: !!doc,
            id,
            data: () => doc || null
          });
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
          if (Array.isArray(store) && index !== -1) {
            store[index] = { ...store[index], ...data };
          } else if (store[id]) {
            store[id] = { ...store[id], ...data };
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

    add: jest.fn(async (data) => {
      const newDoc = { id: `match-${Date.now()}`, ...data };
      mockMatches.push(newDoc);
      return { id: newDoc.id };
    }),

    get: jest.fn(() => {
      const docs = Array.isArray(store)
        ? store
        : Object.entries(store).map(([_, data]) => data);
      const snapshot = makeSnapshot(docs);
      return Promise.resolve({
        ...snapshot,
        forEach: (cb) => snapshot.docs.forEach(cb)
      });
    }),

    orderBy,

    where: jest.fn((field, op, value) => {
      let filteredDocs = [];

      if (name === 'users') {
        filteredDocs = Object.entries(mockDataStore)
          .filter(([, data]) => data.role === 'volunteer')
          .map(([id, data]) => ({
            id,
            data: () => data
          }));
      } else if (name === 'matches') {
        filteredDocs = mockMatches
          .filter(match => match[field] === value)
          .map((doc, i) => ({
            id: `match-${i}`,
            data: () => doc
          }));
      }

      const chainedQuery = {
        docs: filteredDocs,
        forEach: (cb) => filteredDocs.forEach(cb),
        get: jest.fn(() => Promise.resolve({
          docs: filteredDocs,
          forEach: (cb) => filteredDocs.forEach(cb)
        })),
        where: jest.fn(() => chainedQuery),
        orderBy: jest.fn(() => chainedQuery),
        limit: jest.fn(() => chainedQuery)
      };

      return chainedQuery;
    })
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