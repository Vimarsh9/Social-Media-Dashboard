import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { messageAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuthStore } from '../context/authStore';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const { socket } = useSocket();
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageAPI.getConversations().then((r) => r.data),
  });

  const { data: convMessages, isLoading } = useQuery({
    queryKey: ['messages', activeConv],
    queryFn: () => messageAPI.getMessages(activeConv).then((r) => r.data),
    enabled: !!activeConv,
  });

  useEffect(() => {
    if (convMessages) setMessages(convMessages);
  }, [convMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    socket.on('message:receive', (msg) => {
      if (msg.conversationId === activeConv) setMessages((prev) => [...prev, msg]);
    });
    socket.on('typing:start', () => setIsTyping(true));
    socket.on('typing:stop', () => setIsTyping(false));
    return () => { socket.off('message:receive'); socket.off('typing:start'); socket.off('typing:stop'); };
  }, [socket, activeConv]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !activeConv) return;
    const [id1, id2] = activeConv.split('_');
    const receiverId = id1 === user._id ? id2 : id1;
    socket.emit('message:send', { receiverId, content: newMessage });
    setMessages((prev) => [...prev, { _id: Date.now(), sender: user, content: newMessage, createdAt: new Date(), conversationId: activeConv }]);
    setNewMessage('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket && activeConv) {
      const [id1, id2] = activeConv.split('_');
      const receiverId = id1 === user._id ? id2 : id1;
      socket.emit('typing:start', { receiverId });
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => socket.emit('typing:stop', { receiverId }), 1500);
    }
  };

  return (
    <div className="flex h-full">
      {/* Conversations sidebar */}
      <div className="w-72 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-lg font-bold text-slate-100">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations?.length === 0 && (
            <div className="p-8 text-center text-slate-600 text-sm">No conversations yet</div>
          )}
          {conversations?.map((conv) => (
            <button key={conv._id} onClick={() => setActiveConv(conv._id)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-slate-800/50 transition-colors text-left ${activeConv === conv._id ? 'bg-slate-800' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 font-bold shrink-0">
                ?
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-300 truncate">{conv._id}</p>
                <p className="text-xs text-slate-600 truncate">{conv.lastMessage?.content}</p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0">{conv.unreadCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center text-slate-600">
            <div className="text-center">
              <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-800">
              <p className="font-semibold text-slate-200 text-sm">{activeConv}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading && <div className="flex justify-center"><Loader2 size={24} className="animate-spin text-primary-500" /></div>}
              {messages.map((msg) => {
                const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-primary-500 text-white rounded-br-md' : 'bg-slate-800 text-slate-200 rounded-bl-md'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 rounded-2xl px-4 py-2.5 flex gap-1 items-center">
                    {[0, 1, 2].map((i) => <div key={i} className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />)}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-800 flex gap-3">
              <input
                value={newMessage}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="input-field text-sm"
              />
              <button onClick={sendMessage} disabled={!newMessage.trim()} className="btn-primary px-4">
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
