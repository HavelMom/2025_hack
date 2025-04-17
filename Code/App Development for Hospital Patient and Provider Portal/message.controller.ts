import { Request, Response } from 'express';
import { Message, IMessage } from '../models/message.model';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

// Send a new message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;
    
    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
    
    // Create message
    const message = new Message({
      senderId,
      receiverId,
      content,
      read: false,
      sentAt: new Date()
    });
    
    await message.save();
    
    res.status(201).json({ message: 'Message sent successfully', data: message });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get conversation between two users
export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;
    
    // Verify other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }).sort({ sentAt: 1 });
    
    res.status(200).json(messages);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark message as read
export const markMessageAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const messageId = req.params.id;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Only the receiver can mark a message as read
    if (message.receiverId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }
    
    message.read = true;
    message.readAt = new Date();
    
    await message.save();
    
    res.status(200).json({ message: 'Message marked as read', data: message });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all conversations for a user
export const getUserConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Get all unique users this user has exchanged messages with
    const sentMessages = await Message.find({ senderId: userId }).distinct('receiverId');
    const receivedMessages = await Message.find({ receiverId: userId }).distinct('senderId');
    
    // Combine and remove duplicates
    const conversationUserIds = [...new Set([...sentMessages, ...receivedMessages])];
    
    // Get user details for each conversation
    const conversationUsers = await User.find({
      _id: { $in: conversationUserIds }
    }).select('-password');
    
    // For each conversation, get the latest message
    const conversations = await Promise.all(
      conversationUsers.map(async (user) => {
        const latestMessage = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: user._id },
            { senderId: user._id, receiverId: userId }
          ]
        }).sort({ sentAt: -1 });
        
        // Count unread messages
        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: userId,
          read: false
        });
        
        return {
          user,
          latestMessage,
          unreadCount
        };
      })
    );
    
    // Sort by latest message date
    conversations.sort((a, b) => {
      return new Date(b.latestMessage?.sentAt || 0).getTime() - 
             new Date(a.latestMessage?.sentAt || 0).getTime();
    });
    
    res.status(200).json(conversations);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
