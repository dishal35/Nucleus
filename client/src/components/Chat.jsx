import React, { useEffect, useState } from 'react';
import { refreshAccessToken } from '../utils/auth';

const Chat = ({ courseId, userId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const connectWebSocket = async () => {
            try {
                // Get a fresh token before establishing the WebSocket connection
                const token = await refreshAccessToken();
                const ws = new WebSocket(`ws://localhost:5000/chat?token=${token}&courseId=${courseId}`);

                ws.onopen = () => {
                    console.log('WebSocket connection established');
                    setError(null);
                };

                ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    setMessages((prevMessages) => [...prevMessages, message]);
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setError('Failed to connect to chat. Please try again.');
                };

                ws.onclose = () => {
                    console.log('WebSocket connection closed');
                };

                setSocket(ws);

                return () => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close();
                    }
                };
            } catch (error) {
                console.error('Error establishing WebSocket connection:', error);
                setError('Failed to connect to chat. Please try again.');
            }
        };

        connectWebSocket();
    }, [courseId]);

    const sendMessage = () => {
        if (newMessage.trim() && socket && socket.readyState === WebSocket.OPEN) {
            const message = { type: "chat", sender: userId, content: newMessage };
            socket.send(JSON.stringify(message));
            setNewMessage('');
        }
    };

    return (
        <div className="chat-container">
            {error && <div className="chat-error">{error}</div>}
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className="chat-message">
                        <strong>{msg.sender}: </strong>{msg.content}
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage} disabled={!socket || socket.readyState !== WebSocket.OPEN}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;
