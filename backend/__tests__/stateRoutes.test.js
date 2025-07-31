// const request = require('supertest');
// const app = require('../index');

// // Mock firebase BEFORE importing anything that depends on it
// jest.mock('../firebase', () => {
//   const mockStates = [
//     { id: 'tx', name: 'Texas', region: 'south' },
//     { id: 'ny', name: 'New York', region: 'northeast' }
//   ];

//   const get = jest.fn().mockResolvedValue({
//     forEach: (cb) => mockStates.forEach(d => cb({ id: d.id, data: () => d }))
//   });

//   const orderBy = jest.fn(() => ({ get }));
//   const where = jest.fn(() => ({ orderBy }));

//   const collection = jest.fn((name) => {
//     return {
//       orderBy,
//       where,
//       get,
//       doc: jest.fn((code) => ({
//         get: jest.fn(() => {
//           const match = mockStates.find(
//             s => s.id.toLowerCase() === code.toLowerCase()
//           );
//           return Promise.resolve({
//             exists: !!match,
//             id: code.toLowerCase(),
//             data: () => match
//           });
//         })
//       }))
//     };
//   });

//   return {
//     db: { collection },
//     __mockData: { mockStates }
//   };
// });


// const { db, __mockData } = require('../firebase');

// describe('State Routes', () => {
//   beforeEach(() => {
//     __mockData.mockStates.length = 0;
//     __mockData.mockStates.push(
//       { id: 'tx', name: 'Texas', region: 'south' },
//       { id: 'ny', name: 'New York', region: 'northeast' }
//     );
//   });

//   it('GET /api/state/all - should return all states', async () => {
//     const res = await request(app).get('/api/states/all');
//     expect(res.statusCode).toBe(200);
//     expect(res.body.states).toBeDefined();
//     expect(res.body.states.length).toBeGreaterThan(0);
//     expect(res.body.states[0]).toHaveProperty('id');
//     expect(res.body.states[0]).toHaveProperty('name');
//   });

//   it('GET /api/state/region/south - should return states in region', async () => {
//     const res = await request(app).get('/api/states/region/south');
//     expect(res.statusCode).toBe(200);
//     expect(res.body.states).toBeDefined();
//     expect(res.body.states.some(s => s.region === 'south')).toBe(true);
//   });

//   it('GET /api/state/all - fallback if Firestore throws', async () => {
//     const originalCollection = db.collection;

//     db.collection = jest.fn(() => ({
//       orderBy: jest.fn(() => ({
//         get: jest.fn().mockRejectedValue(new Error('Firestore failed'))
//       }))
//     }));

//     const res = await request(app).get('/api/states/all');
//     expect(res.statusCode).toBe(200);
//     expect(res.body.states).toBeDefined();

//     db.collection = originalCollection;
//   });

//  it('GET /api/states/tx - should return state by code', async () => {
//   const res = await request(app).get('/api/states/tx');
//   expect(res.statusCode).toBe(200);
//   expect(res.body).toBeDefined();
//   expect(res.body.id).toBe('tx');
//   expect(res.body.name).toBe('Texas');
// });

// });

const request = require('supertest');

// Mock Firebase BEFORE importing app
jest.mock('../firebase', () => {
  const mockStates = [
    { id: 'TX', name: 'Texas', region: 'south' },
    { id: 'NY', name: 'New York', region: 'northeast' },
    { id: 'CA', name: 'California', region: 'west' },
    { id: 'FL', name: 'Florida', region: 'south' },
    { id: 'IL', name: 'Illinois', region: 'midwest' }
  ];

  // Mock Firebase collection operations that can succeed or fail
  let shouldFirebaseSucceed = true;
  let mockDocExists = true;

  const createMockDoc = (code) => {
    const match = mockStates.find(s => s.id.toUpperCase() === code.toUpperCase());
    return {
      get: jest.fn(() => {
        if (!shouldFirebaseSucceed) {
          return Promise.reject(new Error('Firebase error'));
        }
        return Promise.resolve({
          exists: mockDocExists && !!match,
          id: code.toUpperCase(),
          data: () => match || null
        });
      })
    };
  };

  const createMockQuery = (region) => {
    const filteredStates = mockStates.filter(state => 
      state.region.toLowerCase() === region.toLowerCase()
    );
    
    return {
      get: jest.fn(() => {
        if (!shouldFirebaseSucceed) {
          return Promise.reject(new Error('Firebase region query error'));
        }
        return Promise.resolve({
          forEach: (cb) => filteredStates.forEach(d => cb({ id: d.id, data: () => d }))
        });
      })
    };
  };

  const mockCollection = {
    orderBy: jest.fn(() => ({
      get: jest.fn(() => {
        if (!shouldFirebaseSucceed) {
          return Promise.reject(new Error('Firebase orderBy error'));
        }
        return Promise.resolve({
          forEach: (cb) => mockStates.forEach(d => cb({ id: d.id, data: () => d }))
        });
      })
    })),
    where: jest.fn((field, operator, value) => ({
      orderBy: jest.fn(() => createMockQuery(value))
    })),
    doc: jest.fn((code) => createMockDoc(code)),
    get: jest.fn(() => {
      if (!shouldFirebaseSucceed) {
        return Promise.reject(new Error('Firebase get error'));
      }
      return Promise.resolve({
        forEach: (cb) => mockStates.forEach(d => cb({ id: d.id, data: () => d }))
      });
    })
  };

  return {
    db: {
      collection: jest.fn(() => mockCollection)
    },
    __mockControls: {
      setFirebaseSuccess: (success) => { shouldFirebaseSucceed = success; },
      setDocExists: (exists) => { mockDocExists = exists; },
      resetMocks: () => {
        shouldFirebaseSucceed = true;
        mockDocExists = true;
        jest.clearAllMocks();
      }
    },
    __mockData: { mockStates }
  };
});

const app = require('../index');
const { __mockControls, __mockData } = require('../firebase');

describe('State Routes - Mocked 80%+ Coverage', () => {
  
  beforeEach(() => {
    __mockControls.resetMocks();
  });

  describe('GET /api/states/all - Branch Coverage', () => {
    it('should return states from Firebase successfully (success branch)', async () => {
      // Ensure Firebase succeeds
      __mockControls.setFirebaseSuccess(true);
      
      const res = await request(app).get('/api/states/all');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.states).toBeDefined();
      expect(Array.isArray(res.body.states)).toBe(true);
      expect(res.body.states.length).toBe(5); // Should match mock data
      
      // Should have basic state structure from Firebase
      expect(res.body.states[0]).toHaveProperty('id');
      expect(res.body.states[0]).toHaveProperty('name');
      expect(res.body.states[0]).toHaveProperty('region');
    });

    it('should use fallback data when Firebase fails (error branch)', async () => {
      // Force Firebase to fail
      __mockControls.setFirebaseSuccess(false);
      
      const res = await request(app).get('/api/states/all');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.states).toBeDefined();
      expect(Array.isArray(res.body.states)).toBe(true);
      expect(res.body.states.length).toBe(50); // Should be fallback data (all 50 states)
      
      // Should include Texas from fallback
      const texasState = res.body.states.find(state => state.id === 'TX');
      expect(texasState).toBeDefined();
      expect(texasState.name).toBe('Texas');
    });
  });

  describe('GET /api/states/region/:region - Branch Coverage', () => {
    it('should return filtered states from Firebase (success branch)', async () => {
      __mockControls.setFirebaseSuccess(true);
      
      const res = await request(app).get('/api/states/region/south');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.states).toBeDefined();
      expect(Array.isArray(res.body.states)).toBe(true);
      
      // Should return filtered mock data (TX and FL)
      expect(res.body.states.length).toBe(2);
      const stateIds = res.body.states.map(s => s.id);
      expect(stateIds).toContain('TX');
      expect(stateIds).toContain('FL');
      
      // All should be south region
      const allSouthern = res.body.states.every(state => state.region === 'south');
      expect(allSouthern).toBe(true);
    });

    it('should use filtered fallback data when Firebase fails (error branch)', async () => {
      __mockControls.setFirebaseSuccess(false);
      
      const res = await request(app).get('/api/states/region/south');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.states).toBeDefined();
      expect(Array.isArray(res.body.states)).toBe(true);
      expect(res.body.states.length).toBeGreaterThan(5); // Should be fallback southern states
      
      // All should be southern states from fallback
      const allSouthern = res.body.states.every(state => 
        state.region.toLowerCase() === 'south'
      );
      expect(allSouthern).toBe(true);
      
      // Should include Texas and Florida from fallback
      const stateNames = res.body.states.map(s => s.name);
      expect(stateNames).toContain('Texas');
      expect(stateNames).toContain('Florida');
    });

    it('should return empty array for invalid region from Firebase (success branch, empty result)', async () => {
      __mockControls.setFirebaseSuccess(true);
      
      const res = await request(app).get('/api/states/region/invalid');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.states).toBeDefined();
      expect(Array.isArray(res.body.states)).toBe(true);
      expect(res.body.states.length).toBe(0); // No states in mock data for 'invalid' region
    });

    it('should return empty array for invalid region from fallback (error branch, empty result)', async () => {
      __mockControls.setFirebaseSuccess(false);
      
      const res = await request(app).get('/api/states/region/nonexistentregion');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.states).toBeDefined();
      expect(Array.isArray(res.body.states)).toBe(true);
      expect(res.body.states.length).toBe(0); // No states in fallback for this region
    });

    it('should handle case insensitive region matching in both Firebase and fallback', async () => {
      const testCases = [
        { region: 'SOUTH', firebase: true },
        { region: 'South', firebase: true },
        { region: 'south', firebase: false }, // Test fallback too
        { region: 'NORTHEAST', firebase: false }
      ];
      
      for (const testCase of testCases) {
        __mockControls.setFirebaseSuccess(testCase.firebase);
        
        const res = await request(app).get(`/api/states/region/${testCase.region}`);
        expect(res.statusCode).toBe(200);
        
        if (res.body.states.length > 0) {
          const expectedRegion = testCase.region.toLowerCase();
          const allMatchRegion = res.body.states.every(state => 
            state.region.toLowerCase() === expectedRegion
          );
          expect(allMatchRegion).toBe(true);
        }
      }
    });

    it('should test all regions with both Firebase success and failure', async () => {
      const regions = ['south', 'northeast', 'west', 'midwest'];
      
      for (const region of regions) {
        // Test Firebase success
        __mockControls.setFirebaseSuccess(true);
        const successRes = await request(app).get(`/api/states/region/${region}`);
        expect(successRes.statusCode).toBe(200);
        
        // Test Firebase failure (fallback)
        __mockControls.setFirebaseSuccess(false);
        const fallbackRes = await request(app).get(`/api/states/region/${region}`);
        expect(fallbackRes.statusCode).toBe(200);
        
        if (fallbackRes.body.states.length > 0) {
          const allMatchRegion = fallbackRes.body.states.every(state => 
            state.region.toLowerCase() === region
          );
          expect(allMatchRegion).toBe(true);
        }
      }
    });
  });

  describe('GET /api/states/:code - Branch Coverage', () => {
    it('should return state from Firebase when doc exists (Firebase success, doc exists branch)', async () => {
      __mockControls.setFirebaseSuccess(true);
      __mockControls.setDocExists(true);
      
      const res = await request(app).get('/api/states/tx');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body.id).toBe('TX');
      expect(res.body.name).toBe('Texas');
      expect(res.body.region).toBe('south');
    });

    it('should check fallback when Firebase doc does not exist (Firebase success, doc not exists, fallback found branch)', async () => {
      __mockControls.setFirebaseSuccess(true);
      __mockControls.setDocExists(false); // Doc doesn't exist in Firebase
      
      const res = await request(app).get('/api/states/tx');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body.id).toBe('TX');
      expect(res.body.name).toBe('Texas'); // Should come from fallback
    });

    it('should return 404 when Firebase doc does not exist and not in fallback (Firebase success, doc not exists, fallback not found branch)', async () => {
      __mockControls.setFirebaseSuccess(true);
      __mockControls.setDocExists(false);
      
      const res = await request(app).get('/api/states/ZZ');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('State not found');
    });

    it('should use fallback when Firebase throws error and state exists in fallback (Firebase error, fallback found branch)', async () => {
      __mockControls.setFirebaseSuccess(false); // Firebase fails
      
      const res = await request(app).get('/api/states/tx');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body.id).toBe('TX');
      expect(res.body.name).toBe('Texas'); // Should come from fallback
    });

    it('should return 404 when Firebase throws error and state not in fallback (Firebase error, fallback not found branch)', async () => {
      __mockControls.setFirebaseSuccess(false); // Firebase fails
      
      const res = await request(app).get('/api/states/ZZ');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('State not found');
    });

    it('should handle case conversion in all branches', async () => {
      const testCases = [
        { code: 'tx', firebase: true, docExists: true },
        { code: 'TX', firebase: true, docExists: false }, // Should find in fallback
        { code: 'Tx', firebase: false }, // Firebase error, use fallback
        { code: 'tX', firebase: true, docExists: true }
      ];
      
      for (const testCase of testCases) {
        __mockControls.setFirebaseSuccess(testCase.firebase);
        if (testCase.hasOwnProperty('docExists')) {
          __mockControls.setDocExists(testCase.docExists);
        }
        
        const res = await request(app).get(`/api/states/${testCase.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe('TX');
        expect(res.body.name).toBe('Texas');
      }
    });

    it('should test multiple valid states in different branches', async () => {
      const validStates = ['TX', 'CA', 'NY', 'FL', 'IL'];
      
      for (const state of validStates) {
        // Test Firebase success branch
        __mockControls.setFirebaseSuccess(true);
        __mockControls.setDocExists(true);
        const successRes = await request(app).get(`/api/states/${state.toLowerCase()}`);
        expect(successRes.statusCode).toBe(200);
        expect(successRes.body.id).toBe(state);
        
        // Test fallback branch
        __mockControls.setFirebaseSuccess(false);
        const fallbackRes = await request(app).get(`/api/states/${state.toLowerCase()}`);
        expect(fallbackRes.statusCode).toBe(200);
        expect(fallbackRes.body.id).toBe(state);
      }
    });

    it('should test invalid codes in all branches', async () => {
      const invalidCodes = ['ZZ', 'XX', 'QQ', 'AA'];
      
      for (const code of invalidCodes) {
        // Test Firebase success but doc not exists branch
        __mockControls.setFirebaseSuccess(true);
        __mockControls.setDocExists(false);
        const successRes = await request(app).get(`/api/states/${code}`);
        expect(successRes.statusCode).toBe(404);
        
        // Test Firebase error branch
        __mockControls.setFirebaseSuccess(false);
        const errorRes = await request(app).get(`/api/states/${code}`);
        expect(errorRes.statusCode).toBe(404);
      }
    });
  });

  describe('Comprehensive Branch Testing', () => {
    it('should test all conditional branches in fallback logic', async () => {
      // Test filter method branches with various conditions
      __mockControls.setFirebaseSuccess(false);
      
      const regions = ['south', 'northeast', 'west', 'midwest', 'invalid'];
      for (const region of regions) {
        const res = await request(app).get(`/api/states/region/${region}`);
        expect(res.statusCode).toBe(200);
        
        if (region === 'invalid') {
          expect(res.body.states.length).toBe(0);
        } else {
          expect(res.body.states.length).toBeGreaterThan(0);
          const allMatch = res.body.states.every(state => 
            state.region.toLowerCase() === region
          );
          expect(allMatch).toBe(true);
        }
      }
    });

    it('should test find method branches with various conditions', async () => {
      __mockControls.setFirebaseSuccess(false);
      
      // Test states that exist in fallback
      const existingStates = ['TX', 'CA', 'NY', 'FL', 'AL', 'AK'];
      for (const state of existingStates) {
        const res = await request(app).get(`/api/states/${state.toLowerCase()}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe(state);
      }
      
      // Test states that don't exist
      const nonExistentStates = ['ZA', 'ZB', 'ZC', 'XY'];
      for (const state of nonExistentStates) {
        const res = await request(app).get(`/api/states/${state}`);
        expect(res.statusCode).toBe(404);
      }
    });

    it('should test string comparison branches', async () => {
      __mockControls.setFirebaseSuccess(false);
      
      // Test exact string matches in different cases
      const testCases = [
        { input: 'south', expected: 'south' },
        { input: 'SOUTH', expected: 'south' },
        { input: 'South', expected: 'south' },
        { input: 'SoUtH', expected: 'south' }
      ];
      
      for (const testCase of testCases) {
        const res = await request(app).get(`/api/states/region/${testCase.input}`);
        expect(res.statusCode).toBe(200);
        
        if (res.body.states.length > 0) {
          const allMatch = res.body.states.every(state => 
            state.region.toLowerCase() === testCase.expected
          );
          expect(allMatch).toBe(true);
        }
      }
    });

    it('should test all array method branches (filter, find, every, some)', async () => {
      __mockControls.setFirebaseSuccess(false);
      
      // Test filter with empty results
      const emptyRes = await request(app).get('/api/states/region/nonexistent');
      expect(emptyRes.body.states.length).toBe(0);
      
      // Test filter with results
      const southRes = await request(app).get('/api/states/region/south');
      expect(southRes.body.states.length).toBeGreaterThan(0);
      
      // Test find with match
      const foundRes = await request(app).get('/api/states/tx');
      expect(foundRes.statusCode).toBe(200);
      
      // Test find with no match
      const notFoundRes = await request(app).get('/api/states/ZZ');
      expect(notFoundRes.statusCode).toBe(404);
    });

    it('should test edge cases in all branches', async () => {
      const edgeCases = [
        { type: 'empty', url: '/api/states/', expected: 404 },
        { type: 'space', url: '/api/states/ ', expected: 404 },
        { type: 'special', url: '/api/states/@#', expected: 404 },
        { type: 'long', url: '/api/states/' + 'X'.repeat(100), expected: 404 }
      ];
      
      for (const testCase of edgeCases) {
        __mockControls.setFirebaseSuccess(false);
        const res = await request(app).get(testCase.url);
        expect(res.statusCode).toBe(testCase.expected);
      }
    });
  });

  describe('Firebase vs Fallback Comparison', () => {
    it('should ensure consistent behavior between Firebase and fallback', async () => {
      const testStates = ['TX', 'CA', 'NY'];
      
      for (const state of testStates) {
        // Get result from Firebase
        __mockControls.setFirebaseSuccess(true);
        __mockControls.setDocExists(true);
        const firebaseRes = await request(app).get(`/api/states/${state.toLowerCase()}`);
        
        // Get result from fallback
        __mockControls.setFirebaseSuccess(false);
        const fallbackRes = await request(app).get(`/api/states/${state.toLowerCase()}`);
        
        // Both should succeed
        expect(firebaseRes.statusCode).toBe(200);
        expect(fallbackRes.statusCode).toBe(200);
        
        // Should have same basic structure
        expect(firebaseRes.body.id).toBe(fallbackRes.body.id);
        expect(firebaseRes.body.name).toBe(fallbackRes.body.name);
      }
    });

    it('should test error handling consistency', async () => {
      const invalidCode = 'ZZ';
      
      // Test Firebase path (doc doesn't exist)
      __mockControls.setFirebaseSuccess(true);
      __mockControls.setDocExists(false);
      const firebaseRes = await request(app).get(`/api/states/${invalidCode}`);
      
      // Test fallback path
      __mockControls.setFirebaseSuccess(false);
      const fallbackRes = await request(app).get(`/api/states/${invalidCode}`);
      
      // Both should return 404
      expect(firebaseRes.statusCode).toBe(404);
      expect(fallbackRes.statusCode).toBe(404);
      expect(firebaseRes.body.message).toBe('State not found');
      expect(fallbackRes.body.message).toBe('State not found');
    });
  });
});