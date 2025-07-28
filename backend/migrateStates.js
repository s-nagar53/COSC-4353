// migrateStates.js - Store US states data in Firestore
const { states } = require('./data/statesData');

// Firestore setup with fallback handling
let db, statesCollection;
let firestoreAvailable = false;

try {
  const firebase = require('./firebase');
  db = firebase.db;
  statesCollection = db.collection('states');
  firestoreAvailable = true;
  console.log('✅ Firestore connection established for states migration');
} catch (error) {
  console.error('❌ Firestore not available:', error.message);
  console.log('Please set up Firebase first before running this migration');
  process.exit(1);
}

async function migrateStatesToFirestore() {
  console.log('🚀 Starting migration of US states to Firestore...');
  console.log(`📊 Found ${states.length} states to migrate`);
  
  try {
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Check if states already exist
    const existingSnapshot = await statesCollection.get();
    
    if (!existingSnapshot.empty) {
      console.log(`⚠️  Found ${existingSnapshot.size} existing states in Firestore`);
      console.log('Options: (1) Skip existing, (2) Overwrite all, (3) Cancel');
      
      // For this script, we'll skip existing by default
      console.log('Proceeding with option 1: Skip existing states\n');
    }
    
    // Process each state
    for (const state of states) {
      try {
        const stateRef = statesCollection.doc(state.code);
        
        // Check if state already exists
        const existingState = await stateRef.get();
        
        if (existingState.exists) {
          console.log(`⏭️  State ${state.code} (${state.name}) already exists, skipping...`);
          skippedCount++;
          continue;
        }
        
        // Prepare state data with metadata
        const stateData = {
          code: state.code,
          name: state.name,
          region: state.region,
          createdAt: new Date(),
          updatedAt: new Date(),
          // Additional useful fields
          active: true,
          sortOrder: states.indexOf(state) + 1
        };
        
        // Save to Firestore using state code as document ID
        await stateRef.set(stateData);
        migratedCount++;
        
        console.log(`✅ Migrated: ${state.code} - ${state.name} (${state.region})`);
        
      } catch (stateError) {
        console.error(`❌ Failed to migrate state ${state.code}:`, stateError.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 States migration completed!');
    console.log(`📊 Final Stats:`);
    console.log(`   ✅ Successfully migrated: ${migratedCount} states`);
    console.log(`   ⏭️  Skipped (already exist): ${skippedCount} states`);
    console.log(`   ❌ Errors: ${errorCount} states`);
    
    if (migratedCount > 0) {
      console.log('\n🔍 Verifying migration...');
      
      // Verify the migration worked
      const snapshot = await statesCollection.get();
      console.log(`✅ Firestore now contains ${snapshot.size} total states`);
      
      // Show sample of migrated data
      if (!snapshot.empty) {
        console.log('\n📄 Sample migrated states:');
        let count = 0;
        snapshot.forEach(doc => {
          if (count < 5) { // Show first 5
            const data = doc.data();
            console.log(`   ${data.code}: ${data.name} (${data.region})`);
            count++;
          }
        });
        if (snapshot.size > 5) {
          console.log(`   ... and ${snapshot.size - 5} more states`);
        }
      }
    }
    
    if (migratedCount === states.length) {
      console.log('\n🎯 All states successfully migrated! You can now:');
      console.log('   1. Use states in your application');
      console.log('   2. Create API endpoints to fetch states');
      console.log('   3. Use states for form validation');
    }
    
  } catch (error) {
    console.error('❌ States migration failed with critical error:', error);
    throw error;
  }
}

// Helper function to check current Firestore state
async function checkStatesInFirestore() {
  try {
    const snapshot = await statesCollection.get();
    
    console.log('🔍 Current Firestore states:');
    console.log(`   📊 States collection size: ${snapshot.size}`);
    console.log(`   📊 Collection is empty: ${snapshot.empty}`);
    
    if (!snapshot.empty) {
      console.log('   📄 Existing states by region:');
      const statesByRegion = {};
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!statesByRegion[data.region]) {
          statesByRegion[data.region] = [];
        }
        statesByRegion[data.region].push(`${data.code} (${data.name})`);
      });
      
      Object.keys(statesByRegion).forEach(region => {
        console.log(`      ${region}: ${statesByRegion[region].length} states`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to check Firestore states:', error);
  }
}

// Function to create states API endpoints (bonus)
function createStatesAPI() {
  return `
// Add this to your routes/statesRoutes.js
const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { statesHelper } = require('../data/statesData');

const statesCollection = db.collection('states');

// Get all states
router.get('/all', async (req, res) => {
  try {
    const snapshot = await statesCollection.orderBy('name').get();
    const states = [];
    snapshot.forEach(doc => {
      states.push({ id: doc.id, ...doc.data() });
    });
    res.json({ states });
  } catch (error) {
    // Fallback to memory data
    res.json({ states: statesHelper.getAll() });
  }
});

// Get states by region
router.get('/region/:region', async (req, res) => {
  try {
    const region = req.params.region;
    const snapshot = await statesCollection
      .where('region', '==', region)
      .orderBy('name')
      .get();
    const states = [];
    snapshot.forEach(doc => {
      states.push({ id: doc.id, ...doc.data() });
    });
    res.json({ states });
  } catch (error) {
    res.json({ states: statesHelper.getByRegion(region) });
  }
});

// Get state by code
router.get('/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const doc = await statesCollection.doc(code).get();
    if (doc.exists) {
      res.json({ id: doc.id, ...doc.data() });
    } else {
      res.status(404).json({ message: 'State not found' });
    }
  } catch (error) {
    const state = statesHelper.getByCode(req.params.code);
    if (state) {
      res.json(state);
    } else {
      res.status(404).json({ message: 'State not found' });
    }
  }
});

module.exports = router;
`;
}

// Run migration if this file is executed directly
if (require.main === module) {
  console.log('🇺🇸 US States to Firestore Migration Tool\n');
  
  checkStatesInFirestore()
    .then(() => {
      console.log('\n' + '='.repeat(50));
      return migrateStatesToFirestore();
    })
    .then(() => {
      console.log('\n✅ States migration process completed successfully!');
      console.log('\n📋 Want to create API endpoints for states?');
      console.log('Here\'s sample code:');
      console.log(createStatesAPI());
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ States migration process failed:', error);
      process.exit(1);
    });
}

module.exports = { 
  migrateStatesToFirestore,
  checkStatesInFirestore
};