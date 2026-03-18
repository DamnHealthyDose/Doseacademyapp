import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import slickImg from '@/assets/slick-character.png';

interface Message {
  id: number;
  role: 'user' | 'slick';
  text: string;
}

const SLICK_RESPONSES: Record<string, string> = {
  anxious: "Take a slow breath in… hold… and out. You're safe right now. Want to try a SPARK session?",
  overwhelmed: "When everything feels like too much, just pick ONE thing. The smallest thing. That's your win.",
  sad: "It's okay to feel sad. You don't have to fix it right now — just notice it. I'm here.",
  angry: "Anger is just energy looking for somewhere to go. Can you squeeze your fists tight for 5 seconds, then release?",
  help: "I'm Slick — your SPARK buddy! I can help you when you're feeling stuck. Try telling me how you feel, or start a SPARK session from the home screen.",
  spark: "SPARK stands for Situation, Perception, Affect, Reframe, Key Result. It's a 2-minute reset for when things feel big. Hit 'Start SPARK' on the home screen!",
  default: "I hear you. Whatever you're feeling right now is valid. Want to try a quick SPARK session to work through it?",
};

const getSlickReply = (input: string): string => {
  const lower = input.toLowerCase();
  if (lower.includes('anxious') || lower.includes('anxiety') || lower.includes('nervous') || lower.includes('scared')) return SLICK_RESPONSES.anxious;
  if (lower.includes('overwhelm') || lower.includes('too much') || lower.includes('can\'t')) return SLICK_RESPONSES.overwhelmed;
  if (lower.includes('sad') || lower.includes('cry') || lower.includes('lonely') || lower.includes('alone')) return SLICK_RESPONSES.sad;
  if (lower.includes('angry') || lower.includes('mad') || lower.includes('frustrated') || lower.includes('rage')) return SLICK_RESPONSES.angry;
  if (lower.includes('help') || lower.includes('what') || lower.includes('who')) return SLICK_RESPONSES.help;
  if (lower.includes('spark') || lower.includes('how')) return SLICK_RESPONSES.spark;
  return SLICK_RESPONSES.default;
};

const SlickChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'slick', text: "Hey! I'm Slick 👋 Tell me how you're feeling and I'll try to help." },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const reply: Message = { id: Date.now() + 1, role: 'slick', text: getSlickReply(text) };
      setMessages(prev => [...prev, reply]);
    }, 600);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
            style={{ boxShadow: '0 4px 24px rgba(0,200,200,0.3)' }}
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 z-50 w-[340px] max-h-[460px] rounded-2xl border border-border bg-card flex flex-col overflow-hidden shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary/50">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/40 flex-shrink-0">
                <img src={slickImg} alt="Slick" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-heading font-bold text-foreground">Slick</p>
                <p className="text-xs text-text-hint">Your SPARK buddy</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-[200px]">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm font-body leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-secondary text-foreground rounded-bl-md'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-2 border-t border-border flex items-center gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Tell me how you feel..."
                className="flex-1 bg-secondary/60 text-foreground text-sm rounded-full px-4 py-2 font-body placeholder:text-text-hint focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 transition-opacity"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SlickChatWidget;
