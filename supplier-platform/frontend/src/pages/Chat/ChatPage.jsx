// supplier-platform/frontend/src/pages/Chat/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { getConversations, getMessages, sendMessage } from '@/services/chatService';
import { FiMessageSquare, FiSend, FiArrowLeft, FiChevronDown } from 'react-icons/fi';
import CreateProductComponent from '@/components/products/CreateProductComponent';

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showListingsDropdown, setShowListingsDropdown] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadConversations();
    
    // Poll for new messages every 5 seconds
    pollIntervalRef.current = setInterval(() => {
      if (selectedConversation) {
        loadMessages(selectedConversation.conversation_id);
      }
      loadConversations();
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowListingsDropdown(false);
      }
    };

    if (showListingsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showListingsDropdown]);

  // Determine active pages
  const isProductsPage = location.pathname.startsWith('/products');
  const isInsightsPage = location.pathname === '/insights';
  const isBookingsPage = location.pathname === '/bookings';

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data.conversations || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await getMessages(conversationId);
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.conversation_id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      await sendMessage(selectedConversation.other_party_id, newMessage.trim(), selectedConversation.product_id);
      setNewMessage('');
      // Reload messages
      await loadMessages(selectedConversation.conversation_id);
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    // Scroll within the messages container, not the page
    if (messagesContainerRef.current) {
      setTimeout(() => {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }, 50);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header activePage="" />
      
      {/* Dashboard Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !isProductsPage && !isInsightsPage && !isBookingsPage && location.pathname !== '/chat'
                  ? 'bg-gray-200 text-gray-900' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowListingsDropdown(!showListingsDropdown)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                  isProductsPage 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Listings
                <FiChevronDown className="ml-1" size={14} />
              </button>
              
              {/* Listings Dropdown */}
              {showListingsDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-gray-100 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowListingsDropdown(false);
                        setShowCreateProduct(true);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-900 hover:bg-gray-200 transition-colors rounded-lg mx-2"
                    >
                      Create new product
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowListingsDropdown(false);
                        navigate('/products');
                      }}
                      className="w-full text-left px-4 py-3 text-gray-900 hover:bg-gray-200 transition-colors rounded-lg mx-2"
                    >
                      Active Product listing
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => navigate('/availability')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                location.pathname === '/availability'
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Availability
            </button>
            <button 
              onClick={() => navigate('/bookings')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isBookingsPage
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Bookings
            </button>
            <button 
              onClick={() => navigate('/insights')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isInsightsPage
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Insights
            </button>
            <button 
              onClick={() => navigate('/finance')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                location.pathname === '/finance'
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Finance
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Chat with your customers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No conversations yet</div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.conversation_id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.conversation_id === conv.conversation_id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{conv.other_party_name}</h3>
                        {conv.product_title && (
                          <p className="text-xs text-gray-500 truncate mt-1">{conv.product_title}</p>
                        )}
                        {conv.last_message && (
                          <p className="text-sm text-gray-600 truncate mt-1">{conv.last_message.message}</p>
                        )}
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-2 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-semibold text-gray-900">{selectedConversation.other_party_name}</h2>
                  {selectedConversation.product_title && (
                    <p className="text-sm text-gray-600">{selectedConversation.product_title}</p>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesContainerRef}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'supplier' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender_type === 'supplier'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender_type === 'supplier' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <FiSend className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FiMessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Product Component */}
      {showCreateProduct && (
        <CreateProductComponent onClose={() => setShowCreateProduct(false)} />
      )}

      <Footer />
    </div>
  );
};

export default ChatPage;

