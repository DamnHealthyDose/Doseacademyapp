import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import slickImg from '@/assets/slick-character.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/slick-chat`;
const WELCOME_MSG: Message = { id: 'welcome', role: 'assistant', content: "Hey! I'm Slick 👋 Tell me how you're feeling and I'll try to help." };

const getDeviceId = (): string => {
  let id = localStorage.getItem('dose-device-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('dose-device-id', id);
  }
  return id;
};

const SlickChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load existing conversation on first open
  const loadConversation = useCallback(async () => {
    if (loaded) return;
    setLoaded(true);
    const deviceId = getDeviceId();

    // Find existing conversation
    const { data: convos } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('device_id', deviceId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (convos && convos.length > 0) {
      const convoId = convos[0].id;
      setConversationId(convoId);

      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('id, role, content')
        .eq('conversation_id', convoId)
        .order('created_at', { ascending: true });

      if (msgs && msgs.length > 0) {
        setMessages([WELCOME_MSG, ...msgs.map(m => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))]);
      }
    }
  }, [loaded]);

  useEffect(() => {
    if (open) loadConversation();
  }, [open, loadConversation]);

  const ensureConversation = async (): Promise<string> => {
    if (conversationId) return conversationId;
    const deviceId = getDeviceId();
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({ device_id: deviceId })
      .select('id')
      .single();
    if (error || !data) throw new Error('Failed to create conversation');
    setConversationId(data.id);
    return data.id;
  };

  const saveMessage = async (convoId: string, role: 'user' | 'assistant', content: string) => {
    await supabase.from('chat_messages').insert({ conversation_id: convoId, role, content });
    // Touch updated_at on conversation
    await supabase.from('chat_conversations').update({ updated_at: new Date().toISOString() }).eq('id', convoId);
  };

  const clearHistory = async () => {
    if (conversationId) {
      await supabase.from('chat_conversations').delete().eq('id', conversationId);
    }
    setConversationId(null);
    setMessages([WELCOME_MSG]);
    setLoaded(false);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    const streamId = 'streaming';

    try {
      const convoId = await ensureConversation();
      await saveMessage(convoId, 'user', text);

      // Only send actual chat messages (skip welcome)
      const apiMessages = updatedMessages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Something went wrong' }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantSoFar += delta;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.id === streamId) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { id: streamId, role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Finalize and save assistant message
      const finalId = crypto.randomUUID();
      setMessages(prev => prev.map(m => m.id === streamId ? { ...m, id: finalId } : m));
      if (assistantSoFar) {
        await saveMessage(convoId, 'assistant', assistantSoFar);
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Something went wrong';
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: `Hmm, I hit a snag: ${errorMsg}. Try again? 💚` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(true)}
className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full overflow-hidden bg-white border-[3px] border-muted shadow-lg"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
          >
            <img src={slickImg} alt="Chat with Slick" className="w-full h-full object-cover" />
          </motion.button>
        )}
      </AnimatePresence>

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
                <p className="text-xs text-text-hint">
                  {isLoading ? 'Thinking...' : 'Your SPARK buddy'}
                </p>
              </div>
              <button onClick={clearHistory} className="text-muted-foreground hover:text-foreground transition-colors mr-1" title="Clear chat">
                <Trash2 size={15} />
              </button>
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
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl rounded-bl-md px-3 py-2">
                    <Loader2 size={16} className="animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-2 border-t border-border flex items-center gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Tell me how you feel..."
                disabled={isLoading}
                className="flex-1 bg-secondary/60 text-foreground text-sm rounded-full px-4 py-2 font-body placeholder:text-text-hint focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
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
