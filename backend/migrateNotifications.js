// migrateNotifications.js - Set up Firestore notifications collection
const { db } = require('./firebase');
const notificationService = require('./utils/notificationService');

async function setupNotificationsCollection() {
  console.log('🚀 Setting up Firestore notifications collection...');
  
  try {
    // Test the connection by creating a sample notification
    const testNotification = {
      type: 'test',
      message: 'Test notification for Firestore setup',
      data: { test: true },
      timestamp: new Date().toISOString(),
      read: false,
      createdAt: new Date(),
      userId: 'test-user'
    };

    // Add test notification to Firestore
    const docRef = await db.collection('notifications').add(testNotification);
    console.log(`✅ Test notification created with ID: ${docRef.id}`);

    // Clean up test notification
    await docRef.delete();
    console.log('✅ Test notification cleaned up');

    console.log('🎉 Notifications collection setup complete!');
    console.log('📝 Collection structure:');
    console.log('   - Collection: notifications');
    console.log('   - Fields: type, message, data, timestamp, read, createdAt, userId');
    console.log('   - Indexes: userId (for queries), timestamp (for ordering)');

  } catch (error) {
    console.error('❌ Failed to setup notifications collection:', error);
    throw error;
  }
}

async function addSampleNotifications() {
  console.log('📝 Adding sample notifications...');
  
  try {
    const sampleUsers = [
      'IRNL3zMDkNSkEMN9lKmVvaiLHfE2', // David Kim
      'BiDMZnGixqQ8Cao6DuG8l59v90T2', // Sarah Johnson
      'CLQvkdh3vhbjASRJ5jfj7Iluzsh2'  // Robert Chen
    ];

    const sampleNotifications = [
      {
        type: 'assignment',
        message: 'You have been assigned to the event: Community Cleanup Day',
        data: {
          eventId: 'event_001',
          eventName: 'Community Cleanup Day',
          date: '2025-01-15',
          city: 'Houston'
        }
      },
      {
        type: 'reminder',
        message: 'Reminder: Your event starts in 2 hours',
        data: {
          eventId: 'event_002',
          eventName: 'Food Bank Volunteer',
          date: '2025-01-20',
          city: 'Los Angeles'
        }
      },
      {
        type: 'event_update',
        message: 'Event details have been updated: Youth Mentoring Program',
        data: {
          eventId: 'event_003',
          eventName: 'Youth Mentoring Program',
          date: '2025-01-25',
          city: 'Houston'
        }
      }
    ];

    for (const userId of sampleUsers) {
      for (const notification of sampleNotifications) {
        await notificationService.sendNotification(userId, notification);
      }
    }

    console.log(`✅ Added ${sampleNotifications.length} sample notifications for ${sampleUsers.length} users`);

  } catch (error) {
    console.error('❌ Failed to add sample notifications:', error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  console.log('🔔 Firestore Notifications Migration Tool\n');
  
  setupNotificationsCollection()
    .then(() => addSampleNotifications())
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = {
  setupNotificationsCollection,
  addSampleNotifications
}; 