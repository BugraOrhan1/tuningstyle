import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { filesApi } from '../api/client';
import { Send, Loader2 } from 'lucide-react';

export const FileChat = ({ fileId }) => {
  const { user } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    try {
      const data = await filesApi.getMessages(fileId);
      setMessages(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [fileId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      const msg = await filesApi.sendMessage(fileId, input.trim());
      setMessages(prev => [...prev, msg]);
      setInput('');
    } catch {}
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[400px] border border-gray-200 rounded">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {loading && <div className="text-center text-sm text-fct-muted"><Loader2 className="w-4 h-4 animate-spin inline" /> Loading...</div>}
        {!loading && messages.length === 0 && (
          <div className="text-center text-sm text-fct-muted py-8">No messages yet. Start a conversation with the support team.</div>
        )}
        {messages.map(m => {
          const isMine = m.senderId === user?.id;
          const isAdmin = m.senderRole === 'admin';
          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded px-3 py-2 ${isMine ? 'bg-fct-orange text-white' : isAdmin ? 'bg-fct-dark text-white' : 'bg-white border border-gray-200'}`}>
                <div className="text-xs font-semibold mb-0.5 opacity-80">
                  {isAdmin ? 'Support' : m.senderName}
                </div>
                <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                <div className="text-[10px] mt-1 opacity-60">{new Date(m.createdAt).toLocaleString()}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="border-t border-gray-200 p-3 flex gap-2 bg-white">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange" />
        <button type="submit" disabled={sending || !input.trim()}
          className="bg-fct-orange hover:bg-[#D45F25] text-white px-4 rounded flex items-center gap-2 disabled:opacity-60">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default FileChat;
