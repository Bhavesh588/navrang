#!/usr/bin/env node

/**
 * Manual Testing Script for Notification Queue System
 *
 * This script helps test the notification queue system with one device.
 * Run this after starting the backend server.
 *
 * Usage: node test-notification-queue.js
 */

const axios = require('axios');
const db = require('./config/dbConfig');

const API_BASE = 'http://localhost:5000/api/v1';
const TEST_TOKEN = 'your_test_jwt_token_here'; // Replace with actual token

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function logQueueStatus() {
  console.log('\n📊 Current Queue Status:');
  const queueItems = await db('notification_queue')
    .select('*')
    .orderBy('created_at', 'desc')
    .limit(5);

  if (queueItems.length === 0) {
    console.log('   No items in queue');
    return;
  }

  queueItems.forEach(item => {
    console.log(`   ID: ${item.id} | Status: ${item.status} | Attempts: ${item.attempts} | Token: ${item.push_token.substring(0, 20)}...`);
  });
}

async function logNotifications() {
  console.log('\n📋 Recent Notifications:');
  const notifications = await db('notifications')
    .select('*')
    .orderBy('created_at', 'desc')
    .limit(3);

  if (notifications.length === 0) {
    console.log('   No notifications found');
    return;
  }

  notifications.forEach(n => {
    console.log(`   ID: ${n.id} | Type: ${n.type} | Message: ${n.message.substring(0, 50)}...`);
  });
}

async function testStockTransaction() {
  console.log('\n🧪 Testing Stock Transaction Notification...');

  try {
    // This would normally be done through the API, but for testing we'll simulate
    const notificationService = require('./utils/notificationService');

    console.log('   Creating notification via service...');
    const result = await notificationService.notify({
      type: 'STOCK_ADD',
      referenceId: Math.floor(Math.random() * 1000),
      message: `Test stock addition at ${new Date().toISOString()}`
    });

    console.log(`   ✅ Notification created with ID: ${result.id}`);
    return result.id;

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function testQueueProcessing() {
  console.log('\n🔄 Testing Queue Processing...');

  try {
    const processor = require('./utils/notificationProcessor');

    console.log('   Running queue processor manually...');
    await processor.processQueue();
    console.log('   ✅ Queue processing completed');

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting Notification Queue System Tests\n');

  // Check database connection
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connection OK');
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return;
  }

  // Initial status
  await logNotifications();
  await logQueueStatus();

  // Test 1: Create notification
  const notificationId = await testStockTransaction();
  if (!notificationId) {
    console.log('❌ Cannot continue without notification creation');
    return;
  }

  await logNotifications();
  await logQueueStatus();

  // Test 2: Process queue
  console.log('\n⏳ Waiting 2 seconds before processing queue...');
  await sleep(2000);

  await testQueueProcessing();
  await logQueueStatus();

  // Test 3: Check final status
  console.log('\n📈 Final Status Check:');
  await logNotifications();
  await logQueueStatus();

  console.log('\n✅ Testing completed! Check your device for push notifications.');
  console.log('💡 If no push received, check server logs and device token validity.');

  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted');
  process.exit(0);
});

// Run tests
if (require.main === module) {
  runTests();
}

module.exports = { runTests, testStockTransaction, testQueueProcessing };