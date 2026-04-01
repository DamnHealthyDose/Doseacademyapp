import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Loader2 } from 'lucide-react';
import { AmbientMember } from '@/lib/squadContent';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface QuickChatBubbleProps {
  member: AmbientMember;
  onClose: () => void;
}

const GREETINGS = [
  "hey! how's it going? 👋",
  "yo what's up! taking a break? 📚",
  "hey there! how's studying going?",
  "hi! we got this 💪",
];

const QuickChatBubble = ({ member, onClose }: QuickChatBubbleProps) => {
  const greeting = useRef(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: greeting.current }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('squad-chat', {
        body: {
          messages: updated.map(m => ({ role: m.role, content: m.content })),
          personality: member.personality || 'friendly study buddy',
          subject: member.subject,
          initials: member.initials,
        },
      });

      if (error) throw error;
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || "brb 📖" }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "sorry, got distracted lol. try again? 😅" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-bg-card rounded-t-2xl sm:rounded-card w-full sm:max-w-[360px] max-h-[70vh] flex flex-col shadow-xl"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <div className="w-9 h-9 rounded-full bg-squad/20 flex items-center justify-center text-squad font-heading font-bold text-xs">
              {member.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-heading font-bold text-sm">{member.initials}</p>
              <p className="text-text-hint text-[10px] font-body">Studying {member.subject} · {member.minutesIn}m in</p>
            </div>
            <button onClick={onClose} className="text-text-hint hover:text-foreground p-1">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[120px] max-h-[300px]">
            {messages.slice(-5).map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm font-body ${
                  m.role === 'user'
                    ? 'bg-squad text-primary-foreground rounded-br-md'
                    : 'bg-bg-elevated text-foreground rounded-bl-md'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-bg-elevated px-3 py-2 rounded-2xl rounded-bl-md">
                  <Loader2 size={14} className="animate-spin text-text-hint" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Say something..."
              className="flex-1 bg-bg-elevated text-foreground text-sm font-body rounded-full px-4 py-2 outline-none placeholder:text-text-hint"
              maxLength={200}
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full bg-squad flex items-center justify-center text-primary-foreground disabled:opacity-40"
            >
              <Send size={14} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickChatBubble;
