import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';

const ChatPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentMatch, sheepCode } = useAppStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const matchId = currentMatch?.matchId;

  const { data: cafe } = useQuery({
    queryKey: ['cafe', currentMatch?.matchId],
    queryFn: async () => {
      if (!matchId) return null;
      const { data: match } = await supabase
        .from('matches')
        .select('cafe_id')
        .eq('id', matchId)
        .single();
      if (!match?.cafe_id) return null;
      const { data } = await supabase
        .from('cafes')
        .select('*')
        .eq('id', match.cafe_id)
        .single();
      return data;
    },
    enabled: !!matchId,
  });

  // Fetch initial messages
  useEffect(() => {
    if (!matchId) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();

    // Real-time subscription
    const channel = supabase
      .channel(`messages-${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || !matchId || !user) return;
    await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: user.id,
      content: message.trim(),
    });
    setMessage('');
  };

  if (!matchId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6">
        <p className="text-foreground font-semibold mb-4">No active match</p>
        <Button onClick={() => navigate('/')} className="rounded-2xl">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background safe-top">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card">
        <button onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">
            {currentMatch?.matchedUserName}
          </h1>
          {cafe && (
            <p className="text-xs text-muted-foreground">📍 {cafe.name}</p>
          )}
        </div>
        {sheepCode && (
          <span className="text-xs font-mono bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
            {sheepCode}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground text-sm mt-10">
            Say hi to your herd! 🐑
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isOwn
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-card text-foreground border border-border rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-border bg-card safe-bottom">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="h-10 rounded-2xl bg-background px-4 flex-1"
          />
          <Button
            onClick={sendMessage}
            size="icon"
            className="h-10 w-10 rounded-full"
            disabled={!message.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
