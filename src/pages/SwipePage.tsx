import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { useQuery } from '@tanstack/react-query';
import SwipeCard from '@/components/SwipeCard';
import MatchModal from '@/components/MatchModal';
import { motion, AnimatePresence } from 'framer-motion';
import sheepLogo from '@/assets/sheep-logo.png';

const SwipePage = () => {
  const { user, profile } = useAuthStore();
  const { setCurrentMatch } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<any>(null);

  const { data: swipedIds = [] } = useQuery({
    queryKey: ['swipes', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user!.id);
      return (data || []).map((s) => s.swiped_id);
    },
    enabled: !!user,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles', user?.id, swipedIds],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('onboarding_completed', true)
        .neq('user_id', user!.id);
      return (data || []).filter((p) => !swipedIds.includes(p.user_id));
    },
    enabled: !!user && swipedIds !== undefined,
  });

  const sortedProfiles = useMemo(() => {
    if (!profile?.interests) return profiles;
    return [...profiles].sort((a, b) => {
      const scoreA = (a.interests || []).filter((i: string) => profile.interests.includes(i)).length;
      const scoreB = (b.interests || []).filter((i: string) => profile.interests.includes(i)).length;
      return scoreB - scoreA;
    });
  }, [profiles, profile]);

  const getMatchScore = (otherInterests: string[]) => {
    if (!profile?.interests?.length) return 0;
    const common = otherInterests.filter((i) => profile.interests.includes(i)).length;
    return common;
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const target = sortedProfiles[currentIndex];
    if (!target || !user) return;

    await supabase.from('swipes').insert({
      swiper_id: user.id,
      swiped_id: target.user_id,
      direction,
    });

    if (direction === 'right') {
      const { data: mutual } = await supabase
        .from('swipes')
        .select('id')
        .eq('swiper_id', target.user_id)
        .eq('swiped_id', user.id)
        .eq('direction', 'right')
        .maybeSingle();

      if (mutual) {
        const score = getMatchScore(target.interests || []);
        const { data: match } = await supabase
          .from('matches')
          .insert({
            user1_id: user.id,
            user2_id: target.user_id,
            match_score: score,
          })
          .select()
          .single();

        if (match) {
          setCurrentMatch({
            matchId: match.id,
            matchedUserId: target.user_id,
            matchedUserName: target.name || 'Someone',
            matchedUserImage: target.profile_image,
            matchScore: score,
          });
          setMatchedProfile(target);
          setShowMatch(true);
        }
      }
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const currentProfile = sortedProfiles[currentIndex];

  return (
    <div className="flex flex-col min-h-screen bg-background safe-top pb-20">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 px-5 py-4">
        <img src={sheepLogo} alt="Sheep" className="w-8 h-8" />
        <h1 className="text-lg font-bold text-foreground">Discover</h1>
      </div>

      {/* Cards */}
      <div className="flex-1 flex items-center justify-center px-5 pb-6">
        {currentProfile ? (
          <AnimatePresence>
            <SwipeCard
              key={currentProfile.user_id}
              profile={currentProfile}
              matchScore={getMatchScore(currentProfile.interests || [])}
              totalInterests={profile?.interests?.length || 0}
              onSwipe={handleSwipe}
            />
          </AnimatePresence>
        ) : (
          <div className="text-center">
            <p className="text-xl font-semibold text-foreground mb-2">No more sheep nearby 🐑</p>
            <p className="text-muted-foreground text-sm">Check back later!</p>
          </div>
        )}
      </div>

      {/* Match Modal */}
      <MatchModal
        open={showMatch}
        onClose={() => setShowMatch(false)}
        profile={matchedProfile}
        matchScore={matchedProfile ? getMatchScore(matchedProfile.interests || []) : 0}
        totalInterests={profile?.interests?.length || 0}
      />
    </div>
  );
};

export default SwipePage;
