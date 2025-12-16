import React, { useState, useRef, useEffect, useMemo } from 'react';
import CustomerProfileModal from './CustomerProfileModal';
import { messageService } from '../services/messageService';

const typeLabelMap = {
  customer: 'Customer',
  supplier: 'Supplier',
  admin: 'Admin',
};

const avatarInitials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (!parts.length) return 'U';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
};

const formatTime = (ts) => {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
};

const MessagesContact = ({ initialTarget }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isThreeDotMenuOpen, setIsThreeDotMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const threeDotMenuRef = useRef(null);
  const pollRef = useRef(null);

  const loadConversations = async ({ showSpinner = false } = {}) => {
    try {
      if (showSpinner) setLoading(true);
      const data = await messageService.getConversations({
        participantType: filter === 'all' ? undefined : filter,
        search: searchQuery || undefined,
      });
      const items = data?.conversations || [];
      setConversations(items);
      // If we have an initial target (e.g., from supplier quick modal), try to focus that conversation
      if (initialTarget && initialTarget.type === 'supplier') {
        const match = items.find(
          (c) =>
            c.other_party_type === 'supplier' &&
            (c.other_party_id === initialTarget.id ||
              c.other_party_name?.toLowerCase() === initialTarget.name?.toLowerCase())
        );
        if (match) {
          setSelectedConversationId(match.conversation_id);
        } else if (!selectedConversationId && items.length) {
          // Fall back to first conversation if no direct match
          setSelectedConversationId(items[0].conversation_id);
        }
      } else if (!selectedConversationId && items.length) {
        setSelectedConversationId(items[0].conversation_id);
      }
      if (showSpinner) setLoading(false);
    } catch (error) {
      console.error('Error loading conversations', error);
      if (showSpinner) setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) return;
    try {
      const data = await messageService.getMessages(conversationId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading messages', error);
    }
  };

  useEffect(() => {
    loadConversations({ showSpinner: true });
  }, [filter, searchQuery, initialTarget]);

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
      }
  }, [selectedConversationId]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      loadConversations({ showSpinner: false });
      if (selectedConversationId) {
        loadMessages(selectedConversationId);
      }
    }, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedConversationId, filter, searchQuery]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (isThreeDotMenuOpen && threeDotMenuRef.current && !threeDotMenuRef.current.contains(e.target)) {
        setIsThreeDotMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isDropdownOpen, isThreeDotMenuOpen]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.other_party_name?.toLowerCase().includes(q) ||
        c.last_message?.message?.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  const currentConversation = filteredConversations.find(
    (c) => c.conversation_id === selectedConversationId
  );

  const handleSend = async () => {
    if (!messageInput.trim() || !currentConversation || sending) return;
    setSending(true);
    try {
      await messageService.sendMessage({
        recipientType: currentConversation.other_party_type,
        recipientId: currentConversation.other_party_id,
        message: messageInput.trim(),
      });
      setMessageInput('');
      await loadMessages(currentConversation.conversation_id);
      await loadConversations();
    } catch (error) {
      console.error('Failed to send message', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full flex flex-col" style={{ fontFamily: 'Poppins, sans-serif', height: 'calc(100vh - 120px)' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[36px] font-normal" style={{ color: '#27804A' }}>
          Messages & contact
        </h1>
        {/* Filter removed per request */}
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        <div className="w-80 bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden">
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

          <div 
            className="flex-1 overflow-y-auto conversations-list" 
            style={{ 
              scrollbarWidth: 'thin', 
              scrollbarColor: '#1B3166 transparent'
            }}
          >
            <style>{`
              .conversations-list::-webkit-scrollbar { width: 6px; }
              .conversations-list::-webkit-scrollbar-track { background: transparent; }
              .conversations-list::-webkit-scrollbar-thumb { background-color: #1B3166; border-radius: 3px; }
            `}</style>
            {loading && (
              <div className="p-4 text-sm text-gray-500">Loading conversations...</div>
            )}
            {!loading && !filteredConversations.length && (
              <div className="p-4 text-sm text-gray-500">No conversations found</div>
            )}
            {filteredConversations.map((conversation) => {
              const isActive = conversation.conversation_id === selectedConversationId;
              const lastMessage = conversation.last_message;
              return (
              <button
                  key={conversation.conversation_id}
                  onClick={() => setSelectedConversationId(conversation.conversation_id)}
                className={`w-full text-left p-4 transition relative ${
                    isActive ? 'bg-[#E0E7F0] border-l-4' : 'border-l border-gray-200 hover:bg-gray-50'
                }`}
                  style={isActive ? { borderLeftColor: '#1B3166', borderLeftWidth: '4px' } : { borderLeftWidth: '1px' }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold" style={{ backgroundColor: '#1B3166' }}>
                      {avatarInitials(conversation.other_party_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">{conversation.other_party_name}</span>
                        <span className="text-xs text-gray-500">{formatTime(lastMessage?.created_at)}</span>
                    </div>
                    <div className="mb-1">
                      <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 border border-gray-200 text-gray-600">
                          {typeLabelMap[conversation.other_party_type] || 'User'}
                        </span>
                        {conversation.unread_count > 0 && (
                          <span className="ml-2 text-[11px] text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1B3166' }}>
                            {conversation.unread_count}
                      </span>
                        )}
                    </div>
                      <p className="text-sm text-gray-600 truncate">{lastMessage?.message || ''}</p>
                  </div>
                </div>
              </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-sm flex flex-col overflow-hidden">
          {currentConversation ? (
            <>
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold" style={{ backgroundColor: '#1B3166' }}>
                    {avatarInitials(currentConversation.other_party_name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{currentConversation.other_party_name}</h3>
                    <p className="text-xs text-gray-500">{typeLabelMap[currentConversation.other_party_type] || 'User'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {formatTime(currentConversation.last_message?.created_at)}
                  </span>
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
                        try {
                          await messageService.deleteConversation(selectedConversationId);
                          setSelectedConversationId(null);
                          setMessages([]);
                          loadConversations({ showSpinner: false });
                        } catch (err) {
                          console.error('Failed to delete conversation:', err);
                          alert('Failed to delete conversation. Please try again.');
                        }
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    aria-label="Delete conversation"
                    title="Delete conversation"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isAdminMessage = msg.sender_type === 'admin' || msg.sender_id === 'admin';
                  return (
                  <div
                      key={msg.id}
                      className={`flex ${isAdminMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2.5 ${
                          isAdminMessage ? 'text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                        style={isAdminMessage ? { backgroundColor: '#1B3166BF' } : {}}
                    >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        <div className={`flex items-center gap-2 mt-1 ${isAdminMessage ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs opacity-70">{formatTime(msg.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Type your message here."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition ${sending ? 'opacity-70 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: '#1B3166' }}
                    onClick={handleSend}
                    disabled={sending}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              Select a conversation to view messages.
            </div>
          )}
        </div>
      </div>

      <CustomerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        customer={
          currentConversation?.other_party_type === 'customer'
            ? { id: currentConversation.other_party_id, name: currentConversation.other_party_name }
            : null
        }
        position={null}
      />
    </div>
  );
};

export default MessagesContact;

