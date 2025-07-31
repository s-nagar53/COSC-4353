// const express = require('express');
// const router = express.Router();
// const { db } = require('../firebase');
// //const { statesHelper } = require('../data/statesData');

// const statesCollection = () => {
//   if (!db) {
//     throw new Error('Database not initialized');
//   }
//   return db.collection('states');
// }


// // Get all states
// router.get('/all', async (req, res) => {
//   try {
//     const snapshot = await statesCollection.orderBy('name').get();
//     const states = [];
//     snapshot.forEach(doc => {
//       states.push({ id: doc.id, ...doc.data() });
//     });
//     res.json({ states });
//   } catch (error) {
//       console.error('Error fetching all states:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     // Fallback to memory data
//     //res.json({ states: statesHelper.getAll() });
//   }
// });

// // Get states by region
// router.get('/region/:region', async (req, res) => {
//   try {
//     const region = req.params.region;
//     const snapshot = await statesCollection
//       .where('region', '==', region)
//       .orderBy('name')
//       .get();
//     const states = [];
//     snapshot.forEach(doc => {
//       states.push({ id: doc.id, ...doc.data() });
//     });
//     res.json({ states });
//   } catch (error) {
//     console.error(`Error fetching states for region ${req.params.region}:`, error);
//     res.status(500).json({ message: 'Internal server error' });
//     //res.json({ states: statesHelper.getByRegion(region) });
//   }
// });

// // Get state by code
// router.get('/:code', async (req, res) => {
//   try {
//     const code = req.params.code.toUpperCase();
//     const doc = await statesCollection.doc(code).get();
//     if (doc.exists) {
//       res.json({ id: doc.id, ...doc.data() });
//     } else {
//       res.status(404).json({ message: 'State not found' });
//     }
//   } catch (error) {
//     console.error(`Error fetching state with code ${req.params.code}:`, error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const { db, firebaseInitialized } = require('../firebase');

// Fallback state data when Firebase is unavailable
const fallbackStates = [
  { id: 'AL', name: 'Alabama', region: 'south' },
  { id: 'AK', name: 'Alaska', region: 'west' },
  { id: 'AZ', name: 'Arizona', region: 'west' },
  { id: 'AR', name: 'Arkansas', region: 'south' },
  { id: 'CA', name: 'California', region: 'west' },
  { id: 'CO', name: 'Colorado', region: 'west' },
  { id: 'CT', name: 'Connecticut', region: 'northeast' },
  { id: 'DE', name: 'Delaware', region: 'northeast' },
  { id: 'FL', name: 'Florida', region: 'south' },
  { id: 'GA', name: 'Georgia', region: 'south' },
  { id: 'HI', name: 'Hawaii', region: 'west' },
  { id: 'ID', name: 'Idaho', region: 'west' },
  { id: 'IL', name: 'Illinois', region: 'midwest' },
  { id: 'IN', name: 'Indiana', region: 'midwest' },
  { id: 'IA', name: 'Iowa', region: 'midwest' },
  { id: 'KS', name: 'Kansas', region: 'midwest' },
  { id: 'KY', name: 'Kentucky', region: 'south' },
  { id: 'LA', name: 'Louisiana', region: 'south' },
  { id: 'ME', name: 'Maine', region: 'northeast' },
  { id: 'MD', name: 'Maryland', region: 'northeast' },
  { id: 'MA', name: 'Massachusetts', region: 'northeast' },
  { id: 'MI', name: 'Michigan', region: 'midwest' },
  { id: 'MN', name: 'Minnesota', region: 'midwest' },
  { id: 'MS', name: 'Mississippi', region: 'south' },
  { id: 'MO', name: 'Missouri', region: 'midwest' },
  { id: 'MT', name: 'Montana', region: 'west' },
  { id: 'NE', name: 'Nebraska', region: 'midwest' },
  { id: 'NV', name: 'Nevada', region: 'west' },
  { id: 'NH', name: 'New Hampshire', region: 'northeast' },
  { id: 'NJ', name: 'New Jersey', region: 'northeast' },
  { id: 'NM', name: 'New Mexico', region: 'west' },
  { id: 'NY', name: 'New York', region: 'northeast' },
  { id: 'NC', name: 'North Carolina', region: 'south' },
  { id: 'ND', name: 'North Dakota', region: 'midwest' },
  { id: 'OH', name: 'Ohio', region: 'midwest' },
  { id: 'OK', name: 'Oklahoma', region: 'south' },
  { id: 'OR', name: 'Oregon', region: 'west' },
  { id: 'PA', name: 'Pennsylvania', region: 'northeast' },
  { id: 'RI', name: 'Rhode Island', region: 'northeast' },
  { id: 'SC', name: 'South Carolina', region: 'south' },
  { id: 'SD', name: 'South Dakota', region: 'midwest' },
  { id: 'TN', name: 'Tennessee', region: 'south' },
  { id: 'TX', name: 'Texas', region: 'south' },
  { id: 'UT', name: 'Utah', region: 'west' },
  { id: 'VT', name: 'Vermont', region: 'northeast' },
  { id: 'VA', name: 'Virginia', region: 'south' },
  { id: 'WA', name: 'Washington', region: 'west' },
  { id: 'WV', name: 'West Virginia', region: 'south' },
  { id: 'WI', name: 'Wisconsin', region: 'midwest' },
  { id: 'WY', name: 'Wyoming', region: 'west' }
];

// Collection getter function
const getStatesCollection = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db.collection('states');
};

// GET all states
router.get('/all', async (req, res) => {
  try {
    // Try Firebase first if available
    if (firebaseInitialized && db) {
      const statesCollection = getStatesCollection();
      const snapshot = await statesCollection.get();
      
      if (!snapshot.empty) {
        const states = [];
        snapshot.forEach(doc => {
          states.push({ id: doc.id, ...doc.data() });
        });
        return res.json({ states, source: 'firebase' });
      }
    }
    
    // Fallback to hardcoded data
    console.log('Using fallback state data');
    res.json({ states: fallbackStates, source: 'fallback' });
    
  } catch (error) {
    console.error('Error fetching states, using fallback:', error.message);
    // Always provide fallback data even if Firebase fails
    res.json({ states: fallbackStates, source: 'fallback' });
  }
});

// GET states by region
router.get('/region/:region', async (req, res) => {
  const { region } = req.params;
  
  try {
    // Try Firebase first if available
    if (firebaseInitialized && db) {
      const statesCollection = getStatesCollection();
      const snapshot = await statesCollection.where('region', '==', region.toLowerCase()).get();
      
      if (!snapshot.empty) {
        const states = [];
        snapshot.forEach(doc => {
          states.push({ id: doc.id, ...doc.data() });
        });
        return res.json({ states, source: 'firebase' });
      }
    }
    
    // Fallback to filtering hardcoded data
    console.log(`Using fallback state data for region: ${region}`);
    const filteredStates = fallbackStates.filter(
      state => state.region.toLowerCase() === region.toLowerCase()
    );
    
    res.json({ states: filteredStates, source: 'fallback' });
    
  } catch (error) {
    console.error(`Error fetching states for region ${region}, using fallback:`, error.message);
    // Always provide fallback data even if Firebase fails
    const filteredStates = fallbackStates.filter(
      state => state.region.toLowerCase() === region.toLowerCase()
    );
    res.json({ states: filteredStates, source: 'fallback' });
  }
});

// GET specific state by ID
router.get('/:stateId', async (req, res) => {
  const { stateId } = req.params;
  
  try {
    // Try Firebase first if available
    if (firebaseInitialized && db) {
      const statesCollection = getStatesCollection();
      const doc = await statesCollection.doc(stateId.toUpperCase()).get();
      
      if (doc.exists) {
        return res.json({ id: doc.id, ...doc.data(), source: 'firebase' });
      }
    }
    
    // Fallback to searching hardcoded data
    const state = fallbackStates.find(
      s => s.id.toLowerCase() === stateId.toLowerCase()
    );
    
    if (state) {
      res.json({ ...state, source: 'fallback' });
    } else {
      res.status(404).json({ message: 'State not found' });
    }
    
  } catch (error) {
    console.error(`Error fetching state ${stateId}, using fallback:`, error.message);
    // Always provide fallback data even if Firebase fails
    const state = fallbackStates.find(
      s => s.id.toLowerCase() === stateId.toLowerCase()
    );
    
    if (state) {
      res.json({ ...state, source: 'fallback' });
    } else {
      res.status(404).json({ message: 'State not found' });
    }
  }
});

module.exports = router;