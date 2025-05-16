import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { useAuth } from '../context/AuthContext';

const Chat = ({ courseId, userId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            const response = await fetchWithAuth(`/api/chat/${courseId}/unread`);
            const data = await response.json();
            if (response.ok) {
                setUnreadCount(data.data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    // Reset unread count
    const resetUnreadCount = async () => {
        try {
            await fetchWithAuth(`/api/chat/${courseId}/unread/reset`, {
                method: 'POST'
            });
            setUnreadCount(0);
        } catch (error) {
            console.error('Error resetting unread count:', error);
        }
    };

    useEffect(() => {
        // Fetch message history first
        const fetchMessageHistory = async () => {
            try {
                const response = await fetchWithAuth(`/api/chat/${courseId}/history`);
                const data = await response.json();
                if (response.ok) {
                    setMessages(data.messages);
                    scrollToBottom();
                }
            } catch (error) {
                console.error('Error fetching message history:', error);
                setError('Failed to load message history');
            }
        };

        fetchMessageHistory();
        fetchUnreadCount();

        // Initialize WebSocket connection
        const socket = new WebSocket(`ws://localhost:5000/chat?token=${localStorage.getItem('token')}&courseId=${courseId}`);

        socket.onopen = () => {
            console.log('Connected to chat server');
            setIsConnected(true);
            setError(null);
        };

        socket.onclose = () => {
            console.log('Disconnected from chat server');
            setIsConnected(false);
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setMessages(prev => [...prev, message]);
            scrollToBottom();
            
            // If the user is not the sender, increment unread count
            if (message.sender !== userId) {
                setUnreadCount(prev => prev + 1);
            }
        };

        socket.onerror = (error) => {
            console.error('Socket error:', error);
            setError('Chat connection error. Please try again.');
        };

        socketRef.current = socket;

        // Cleanup on unmount
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [courseId, userId]);

    // Reset unread count when chat is focused
    const handleChatFocus = () => {
        resetUnreadCount();
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim() || !isConnected) return;

        try {
            const messageData = {
                type: 'chat',
                sender: userId,
                content: newMessage,
                courseId,
                timestamp: new Date().toISOString()
            };

            socketRef.current.send(JSON.stringify(messageData));
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            setError('Failed to send message');
        }
    };

    return (
        <div 
            className="chat-container" 
            onFocus={handleChatFocus}
            tabIndex="0"
        >
            {error && <div className="chat-error">{error}</div>}
            
            <div className="chat-header">
                <h3>Course Chat</h3>
                {!isConnected && (
                    <span className="connection-status">
                        Reconnecting...
                    </span>
                )}
                {unreadCount > 0 && (
                    <span className="unread-badge">
                        {unreadCount} new
                    </span>
                )}
            </div>

            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`message ${msg.sender === userId ? 'sent' : 'received'}`}
                    >
                        <div className="message-header">
                            <span className="sender-name">{msg.senderName}</span>
                            <span className="message-time">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        <div className="message-content">{msg.content}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="chat-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={!isConnected}
                />
                <button 
                    type="submit" 
                    disabled={!isConnected || !newMessage.trim()}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat;
