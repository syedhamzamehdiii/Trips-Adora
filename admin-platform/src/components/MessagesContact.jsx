import React, { useState, useRef, useEffect } from 'react';
import CustomerProfileModal from './CustomerProfileModal';

const MessagesContact = () => {
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomersDropdownOpen, setIsCustomersDropdownOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalPosition, setProfileModalPosition] = useState(null);
  const [isThreeDotMenuOpen, setIsThreeDotMenuOpen] = useState(false);
  const customersDropdownRef = useRef(null);
  const threeDotMenuRef = useRef(null);
  const viewProfileButtonRef = useRef(null);

  const conversations = [
    {
      id: 0,
      name: 'Jhon suhmit',
      initial: 'JS',
      timeAgo: '2 min ago',
      preview: 'Thank you for the quick response!',
      email: 'Jhonsuhmit@gmail.com',
      customerId: 'CTA-00568',
      messages: [
        { type: 'user', text: 'Hi, I have a question about my upcoming tour to Mount Fuji.', time: '10:30 AM' },
        { type: 'agent', text: "Hello John! I'd be happy to help. What would you like to know?", time: '10:30 AM', read: true },
        { type: 'user', text: 'What should I bring for the tour? And is lunch included?', time: '10:33 AM' },
        { type: 'agent', text: 'Great questions! Please bring comfortable walking shoes, warm clothing (it can be cold at high altitude), and sunscreen. Yes, lunch is included in your tour package.', time: '10:33 AM', read: true },
        { type: 'user', text: 'Thank you for the quick response!', time: '10:33 AM' },
      ]
    },
    {
      id: 1,
      name: 'Sarah Johnson',
      initial: 'SJ',
      timeAgo: '5 min ago',
      preview: 'I need to update my booking details.',
      messages: [
        { type: 'user', text: 'I need to update my booking details.', time: '10:25 AM' },
        { type: 'agent', text: 'Sure, I can help you with that. What changes would you like to make?', time: '10:26 AM', read: true },
      ]
    },
    {
      id: 2,
      name: 'Michael Brown',
      initial: 'MB',
      timeAgo: '10 min ago',
      preview: 'When will I receive my confirmation?',
      messages: [
        { type: 'user', text: 'When will I receive my confirmation?', time: '10:20 AM' },
        { type: 'agent', text: 'You should receive it within 24 hours via email.', time: '10:21 AM', read: true },
      ]
    },
    {
      id: 3,
      name: 'Emily Davis',
      initial: 'ED',
      timeAgo: '15 min ago',
      preview: 'Can I cancel my reservation?',
      messages: [
        { type: 'user', text: 'Can I cancel my reservation?', time: '10:15 AM' },
        { type: 'agent', text: 'Yes, you can cancel up to 48 hours before the tour for a full refund.', time: '10:16 AM', read: true },
      ]
    },
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentConversation = conversations[selectedConversation];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCustomersDropdownOpen && customersDropdownRef.current && !customersDropdownRef.current.contains(event.target)) {
        setIsCustomersDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCustomersDropdownOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (isCustomersDropdownOpen) setIsCustomersDropdownOpen(false);
        if (isThreeDotMenuOpen) setIsThreeDotMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isCustomersDropdownOpen, isThreeDotMenuOpen]);

  // Close three-dot menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isThreeDotMenuOpen && threeDotMenuRef.current && !threeDotMenuRef.current.contains(event.target)) {
        setIsThreeDotMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isThreeDotMenuOpen]);

  return (
    <div className="w-full flex flex-col" style={{ fontFamily: 'Poppins, sans-serif', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[36px] font-normal" style={{ color: '#27804A' }}>
          Messages & contact
        </h1>
        <div className="relative" ref={customersDropdownRef}>
          <button
            onClick={() => setIsCustomersDropdownOpen(!isCustomersDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            <span>Customers</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isCustomersDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48 z-10">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                Customers
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                Suppliers
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Left Panel - Conversations List */}
        <div className="w-80 bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversation"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Conversations List */}
          <div 
            className="flex-1 overflow-y-auto conversations-list" 
            style={{ 
              scrollbarWidth: 'thin', 
              scrollbarColor: '#1B3166 transparent'
            }}
          >
            <style>{`
              .conversations-list::-webkit-scrollbar {
                width: 6px;
              }
              .conversations-list::-webkit-scrollbar-track {
                background: transparent;
              }
              .conversations-list::-webkit-scrollbar-thumb {
                background-color: #1B3166;
                border-radius: 3px;
              }
            `}</style>
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`w-full text-left p-4 transition relative ${
                  selectedConversation === conversation.id 
                    ? 'bg-[#E0E7F0] border-l-4' 
                    : 'border-l border-gray-200 hover:bg-gray-50'
                }`}
                style={selectedConversation === conversation.id ? { borderLeftColor: '#1B3166', borderLeftWidth: '4px' } : { borderLeftWidth: '1px' }}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold" style={{ backgroundColor: '#1B3166' }}>
                    {conversation.initial}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{conversation.name}</span>
                      <span className="text-xs text-gray-500">{conversation.timeAgo}</span>
                    </div>
                    <div className="mb-1">
                      <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 border border-gray-200 text-gray-600">
                        Customer
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversation.preview}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Active Conversation */}
        <div className="flex-1 bg-white rounded-lg shadow-sm flex flex-col overflow-hidden">
          {currentConversation && (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold" style={{ backgroundColor: '#1B3166' }}>
                    {currentConversation.initial}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{currentConversation.name}</h3>
                    <p className="text-xs text-gray-500">Customer</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{currentConversation.timeAgo}</span>
                  <button
                    ref={viewProfileButtonRef}
                    className="px-4 py-2 rounded-lg text-white font-medium text-sm"
                    style={{ backgroundColor: '#77FFAA' }}
                    onClick={() => {
                      setIsProfileModalOpen(true);
                    }}
                  >
                    View profile
                  </button>
                  <div className="relative" ref={threeDotMenuRef}>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      onClick={() => setIsThreeDotMenuOpen(!isThreeDotMenuOpen)}
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    {isThreeDotMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 w-48 z-50">
                        <div className="flex flex-col gap-2">
                          <button
                            className="w-full px-4 py-2.5 rounded-lg text-white font-medium text-sm transition"
                            style={{ backgroundColor: '#77FFAA' }}
                            onClick={() => {
                              setIsThreeDotMenuOpen(false);
                              setIsProfileModalOpen(true);
                            }}
                          >
                            View profile
                          </button>
                          <button
                            className="w-full px-4 py-2.5 rounded-lg text-white font-medium text-sm transition"
                            style={{ backgroundColor: '#FF4A43' }}
                            onClick={() => {
                              setIsThreeDotMenuOpen(false);
                              // Handle block action
                              if (window.confirm('Are you sure you want to block this customer?')) {
                                alert('Customer blocked');
                              }
                            }}
                          >
                            Block
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentConversation.messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${message.type === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2.5 ${
                        message.type === 'agent'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                      style={message.type === 'agent' ? { backgroundColor: '#1B3166BF' } : {}}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <div className={`flex items-center gap-2 mt-1 ${message.type === 'agent' ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs opacity-70">{message.time}</span>
                        {message.type === 'agent' && message.read && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input Area */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    placeholder="Type your message here."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white transition"
                    style={{ backgroundColor: '#1B3166' }}
                    onClick={() => {
                      if (messageInput.trim()) {
                        // Handle send message logic here
                        setMessageInput('');
                      }
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Customer Profile Modal */}
      <CustomerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        customer={currentConversation}
        position={profileModalPosition}
      />
    </div>
  );
};

export default MessagesContact;

