const Message = require('../models/MessageModel');
const mongoose = require('mongoose');

// Create new message from contact form
const createMessage = async (req, res) => {
    console.log('Received message request:');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate email format
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Create new message
        const newMessage = new Message({
            name,
            email,
            subject,
            message,
            status: 'unread'
        });

        // Save to database
        await newMessage.save();

        res.status(201).json({ 
            success: true,
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('Error creating message:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ error: 'Failed to send message: ' + error.message });
    }
};

// Get all messages (admin only)
const getAllMessages = async (req, res) => {
    try {
        // Get messages with newest first
        const messages = await Message.find().sort({ date: -1 });
        
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
};

// Update message status (mark as read/unread)
const updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate message id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid message ID' });
        }

        // Validate status
        if (status !== 'read' && status !== 'unread') {
            return res.status(400).json({ error: 'Status must be either "read" or "unread"' });
        }

        // Update message
        const message = await Message.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.status(200).json({ 
            success: true,
            message: 'Message status updated',
            data: message
        });
    } catch (error) {
        console.error('Error updating message status:', error);
        res.status(500).json({ error: 'Failed to update message status' });
    }
};

// Delete a message
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate message id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid message ID' });
        }

        // Delete message
        const message = await Message.findByIdAndDelete(id);

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.status(200).json({ 
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
};

module.exports = {
    createMessage,
    getAllMessages,
    updateMessageStatus,
    deleteMessage
};

