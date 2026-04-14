import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';

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

      if (!data?.length) return [];

      const otherIds = data.map((m) =>
        m.user1_id === user!.id ? m.user2_id : m.user1_id
      );

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', otherIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      return data.map((m) => {
        const otherId = m.user1_id === user!.id ? m.user2_id : m.user1_id;
        return { ...m, otherProfile: profileMap.get(otherId) || null };
      });
    },
    enabled: !!user,
  });

  const handleOpenChat = (match: any) => {
    setCurrentMatch({
      matchId: match.id,
      matchedUserId: match.otherProfile?.user_id,
      matchedUserName: match.otherProfile?.name || 'Someone',
      matchedUserImage: match.otherProfile?.profile_image,
      matchScore: match.match_score || 0,
    });
    navigate('/chat');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background safe-top pb-20">
      <div className="px-5 py-4">
        <h1 className="text-xl font-bold text-foreground">Your Matches 🐑</h1>
        <p className="text-sm text-muted-foreground mt-1">People in your herd</p>
      </div>

      <div className="flex-1 px-5 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center mt-20">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <Heart className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-foreground font-semibold">No matches yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Keep swiping to find your herd!
            </p>
          </div>
        ) : (
          matches.map((match: any, i: number) => (
            <motion.button
              key={match.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleOpenChat(match)}
              className="w-full flex items-center gap-3 p-3 bg-card rounded-2xl border border-border text-left"
            >
              <div className="w-14 h-14 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                {match.otherProfile?.profile_image ? (
                  <img
                    src={match.otherProfile.profile_image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">
                    🐑
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {match.otherProfile?.name || 'Someone'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {match.match_score
                    ? `${match.match_score} interests match`
                    : 'Matched'}
                </p>
              </div>
              {match.cafe_id && (
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                  ☕ Café set
                </span>
              )}
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
};

export default MatchesPage;
