import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const CafePage = () => {
  const navigate = useNavigate();
  const { currentMatch, setSelectedCafe, generateSheepCode } = useAppStore();

  const { data: cafes = [] } = useQuery({
    queryKey: ['cafes'],
    queryFn: async () => {
      const { data } = await supabase.from('cafes').select('*');
      return data || [];
    },
  });

  const handleSelectCafe = async (cafeId: string) => {
    setSelectedCafe(cafeId);
    const code = generateSheepCode();

    if (currentMatch) {
      await supabase
        .from('matches')
        .update({ cafe_id: cafeId, sheep_code: code })
        .eq('id', currentMatch.matchId);
    }

    navigate('/chat');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background safe-top">
      <div className="flex items-center gap-3 px-5 py-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Pick a Café ☕</h1>
      </div>

      <div className="flex-1 px-5 pb-6 space-y-4">
        {cafes.length === 0 ? (
          <p className="text-center text-muted-foreground mt-10">No cafés available yet</p>
        ) : (
          cafes.map((cafe, i) => (
            <motion.div
              key={cafe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border"
            >
              {cafe.image && (
                <img src={cafe.image} alt={cafe.name} className="w-full h-36 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-foreground">{cafe.name}</h3>
                  {cafe.rating && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      {Number(cafe.rating).toFixed(1)}
                    </div>
                  )}
                </div>
                {cafe.location && (
                  <p className="text-xs text-muted-foreground mb-3">{cafe.location}</p>
                )}
                <Button
                  onClick={() => handleSelectCafe(cafe.id)}
                  className="w-full h-10 rounded-2xl text-sm"
                >
                  Meet Here
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default CafePage;
