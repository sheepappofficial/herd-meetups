import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';

const ChatsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { setCurrentMatch } = useAppStore();

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['chats', user?.id],
    queryFn: async () => {
      // Get matches that have a cafe selected (active chats)
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user!.id},user2_id.eq.${user!.id}`)
        .not('cafe_id', 'is', null)
        .order('created_at', { ascending: false });

      if (!matches) return [];

      const enriched = await Promise.all(
        matches.map(async (match) => {
          const otherId = match.user1_id === user!.id ? match.user2_id : match.user1_id;
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', otherId)
            .single();

          // Get last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('match_id', match.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return { ...match, otherProfile: profile, lastMessage: lastMsg };
        })
      );
      return enriched;
    },
    enabled: !!user,
  });

  const openChat = (chat: any) => {
    setCurrentMatch({
      matchId: chat.id,
      matchedUserId: chat.otherProfile.user_id,
      matchedUserName: chat.otherProfile.name || 'Someone',
      matchedUserImage: chat.otherProfile.profile_image,
      matchScore: chat.match_score || 0,
    });
    if (chat.sheep_code) {
      useAppStore.getState().setSheepCode(chat.sheep_code);
    }
    navigate('/chat');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background safe-top pb-20">
      <div className="px-5 py-4">
        <h1 className="text-xl font-bold text-foreground">Chats 💬</h1>
        <p className="text-sm text-muted-foreground">Your conversations</p>
      </div>

      <div className="flex-1 px-5 space-y-3">
        {isLoading ? (
          <p className="text-center text-muted-foreground mt-10">Loading...</p>
        ) : chats.length === 0 ? (
          <p className="text-center text-muted-foreground mt-10">No chats yet. Match and pick a café to start!</p>
        ) : (
          chats.map((chat: any, i: number) => (
            <motion.button
              key={chat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => openChat(chat)}
              className="w-full flex items-center gap-3 p-3 bg-card rounded-2xl border border-border text-left"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src={chat.otherProfile?.profile_image || ''} />
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {(chat.otherProfile?.name || '?')[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {chat.otherProfile?.name || 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {chat.lastMessage?.content || 'Say hi to your herd! 🐑'}
                </p>
              </div>
            </motion.button>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ChatsPage;
