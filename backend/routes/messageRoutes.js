const express = require('express');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Public route - anyone can submit a contact message
router.post('/', messageController.createMessage);

// Protected routes - only authenticated admins can access
router.get('/', authMiddleware, adminMiddleware, messageController.getAllMessages);
router.patch('/:id', authMiddleware, adminMiddleware, messageController.updateMessageStatus);
router.delete('/:id', authMiddleware, adminMiddleware, messageController.deleteMessage);

module.exports = router;

