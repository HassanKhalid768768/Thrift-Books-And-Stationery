const cron = require('node-cron');
const { cleanupAbandonedOrders } = require('../controllers/orderController');

// Schedule cleanup to run every 15 minutes
const scheduleCleanup = () => {
  console.log('Starting scheduled cleanup job for abandoned orders...');
  
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('Running scheduled cleanup for abandoned orders...');
    try {
      const deletedCount = await cleanupAbandonedOrders();
      if (deletedCount > 0) {
        console.log(`✅ Cleanup completed: ${deletedCount} abandoned orders removed`);
      }
    } catch (error) {
      console.error('❌ Scheduled cleanup failed:', error);
    }
  });
  
  // Also run cleanup on startup
  setTimeout(async () => {
    console.log('Running initial cleanup on startup...');
    try {
      const deletedCount = await cleanupAbandonedOrders();
      if (deletedCount > 0) {
        console.log(`✅ Initial cleanup completed: ${deletedCount} abandoned orders removed`);
      }
    } catch (error) {
      console.error('❌ Initial cleanup failed:', error);
    }
  }, 5000); // Wait 5 seconds after startup
};

module.exports = { scheduleCleanup };
