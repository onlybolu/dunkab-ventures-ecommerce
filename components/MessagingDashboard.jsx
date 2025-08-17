"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MessagingDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
  const messagesEndRef = useRef(null);
  const dashboardRef = useRef(null);

  // Function to generate a unique guest ID
  const getOrCreateGuestId = useCallback(() => {
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('guestId', guestId);
    }
    return guestId;
  }, []);

  // Fetch current user ID (either authenticated or guest)
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.user && data.user.id) {
            setCurrentUserId(data.user.id);
            setIsAuthenticatedUser(true);
            console.log("MessagingDashboard: Authenticated user ID set:", data.user.id);
            return;
          }
        }
      } catch (error) {
        console.error("MessagingDashboard: Error fetching user session:", error);
      }

      // If no authenticated user is found, use or create a guest ID.
      // This is now the fallback logic.
      const guestId = getOrCreateGuestId();
      setCurrentUserId(guestId);
      setIsAuthenticatedUser(false);
      console.log("MessagingDashboard: Guest user ID set:", guestId);
    };

    fetchUserId();
  }, [getOrCreateGuestId]);

  // Real-time message polling
  useEffect(() => {
    if (!currentUserId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages?userId=${currentUserId}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const fetchedMessages = data.messages || [];

          // Check for new unread messages from the admin
          if (messages.length > 0 && fetchedMessages.length > messages.length) {
            const lastOldMessage = messages[messages.length - 1];
            const newUnreadMessages = fetchedMessages.filter(msg =>
              msg.timestamp && lastOldMessage.timestamp &&
              new Date(msg.timestamp) > new Date(lastOldMessage.timestamp) &&
              msg.sender === 'admin'
            );
            if (newUnreadMessages.length > 0 && !isOpen) {
              setUnreadCount(prevCount => prevCount + newUnreadMessages.length);
              toast.info(`New message from Admin!`);
            }
          }
          setMessages(fetchedMessages);
        } else {
          console.error("MessagingDashboard: Failed to fetch messages:", res.statusText);
          toast.error("Failed to load chat messages.");
        }
      } catch (error) {
        console.error("MessagingDashboard: Error fetching messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [currentUserId, isOpen, messages.length]);

  // Scroll to bottom when messages update or dashboard opens
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUserId) {
      return;
    }

    const userMessageText = newMessage;
    const tempId = `temp-${Date.now()}`;

    // Optimistically add user's message to the UI
    setMessages(prevMessages => [...prevMessages, {
      id: tempId,
      text: userMessageText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    }]);

    setNewMessage(''); // Clear input immediately

    // Add an optimistic automated admin response
    // const autoResponseText = "Our agents are currently reviewing your message. Please wait, you will be responded to soon.";
    // setMessages(prevMessages => {
    //   const autoResponseTimestamp = new Date(new Date().getTime() + 100).toISOString();
    //   return [...prevMessages, {
    //     id: `auto-response-${Date.now()}`,
    //     text: autoResponseText,
    //     sender: 'admin',
    //     timestamp: autoResponseTimestamp,
    //   }];
    // });

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          text: userMessageText,
          sender: 'user',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("MessagingDashboard: Error sending message:", error);
      toast.error("Failed to send message.");
      // Revert optimistic message if sending fails
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempId && !msg.id.startsWith('auto-response-')));
    }
  };

  const toggleDashboard = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(prev => !prev);
  };

  const handleClickOutside = useCallback((event) => {
    const isFloatingButton = event.target.closest('.fixed.bottom-6.right-6.bg-indigo-600');
    if (dashboardRef.current && !dashboardRef.current.contains(event.target) && !isFloatingButton && !isFullScreen && isOpen) {
      setIsOpen(false);
    }
  }, [isFullScreen, isOpen]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  if (!currentUserId) {
    return null;
  }

  // Determine if input and send button should be disabled
  const disableInputAndSend = newMessage.trim() === '';

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} newestOnTop={true} />

      {/* Floating Message Icon */}
      <button
        onClick={toggleDashboard}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 z-[1000] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label="Open chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center -mt-1 -mr-1">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Messaging Dashboard */}
      <div
        ref={dashboardRef}
        className={`fixed bg-white rounded-xl shadow-2xl flex flex-col z-[1001] transition-all duration-300 ease-in-out
          ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
          ${isFullScreen
            ? 'top-0 left-0 w-full h-full rounded-none'
            : 'bottom-20 right-6 w-[calc(100vw-3rem)] max-w-sm h-[70vh] max-h-[600px] md:w-96 md:h-[500px]'
          }`}
      >
        {/* Dashboard Header */}
        <div className="bg-indigo-600 text-white p-4 rounded-t-xl flex items-center justify-between shadow-md">
          <h3 className="text-lg font-semibold">Admin Chat</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullScreen}
              className="p-1 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullScreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m0 8h3a2 2 0 0 1 2 2v3m8 0v-3a2 2 0 0 1 2-2h3m0-8h-3a2 2 0 0 1-2-2V3"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3m-18 0v3a2 2 0 0 0 2 2h3"></path></svg>
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>No messages yet. Start a conversation!</p>
              {!isAuthenticatedUser && (
                  <p className="text-sm text-gray-400 mt-2">
                    You are in guest mode. Your chat history will be saved on this device.
                  </p>
              )}
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg shadow-sm text-sm
                    ${msg.sender === 'user'
                      ? 'bg-indigo-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                >
                  <p>{msg.text}</p>
                  <span className="block text-xs opacity-75 mt-1">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-xl flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={"Type your message..."}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
          />
          <button
            type="submit"
            className="ml-3 bg-indigo-600 text-white p-3 rounded-full shadow-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Send message"
            disabled={disableInputAndSend}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </>
  );
};

export default MessagingDashboard;