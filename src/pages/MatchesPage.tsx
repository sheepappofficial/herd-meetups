import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';

const MatchesPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { setCurrentMatch } = useAppStore();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user!.id},user2_id.eq.${user!.id}`)
        .order('created_at', { ascending: false });

      if (!data) return [];

      const enriched = await Promise.all(
        data.map(async (match) => {
          const otherId = match.user1_id === user!.id ? match.user2_id : match.user1_id;
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', otherId)
            .single();
          return { ...match, otherProfile: profile };
        })
      );
      return enriched;
    },
    enabled: !!user,
  });

  const openChat = (match: any) => {
    setCurrentMatch({
      matchId: match.id,
      matchedUserId: match.otherProfile.user_id,
      matchedUserName: match.otherProfile.name || 'Someone',
      matchedUserImage: match.otherProfile.profile_image,
      matchScore: match.match_score || 0,
    });
    navigate('/chat');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background safe-top pb-20">
      <div className="px-5 py-4">
        <h1 className="text-xl font-bold text-foreground">Your Herd 🐑</h1>
        <p className="text-sm text-muted-foreground">People you've matched with</p>
      </div>

      <div className="flex-1 px-5 space-y-3">
        {isLoading ? (
          <p className="text-center text-muted-foreground mt-10">Loading...</p>
        ) : matches.length === 0 ? (
          <p className="text-center text-muted-foreground mt-10">No matches yet. Keep swiping!</p>
        ) : (
          matches.map((match: any, i: number) => (
            <motion.button
              key={match.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => openChat(match)}
              className="w-full flex items-center gap-3 p-3 bg-card rounded-2xl border border-border text-left"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src={match.otherProfile?.profile_image || ''} />
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {(match.otherProfile?.name || '?')[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {match.otherProfile?.name || 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {match.match_score ? `${match.match_score} interests match` : 'Matched'}
                </p>
              </div>
              {match.sheep_code && (
                <span className="text-[10px] font-mono bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                  {match.sheep_code}
                </span>
              )}
            </motion.button>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MatchesPage;
