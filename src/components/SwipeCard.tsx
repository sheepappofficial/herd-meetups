import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

interface SwipeCardProps {
  profile: {
    user_id: string;
    name: string | null;
    age: number | null;
    profile_image: string | null;
    interests: string[] | null;
    bio: string | null;
  };
  matchScore: number;
  totalInterests: number;
  onSwipe: (direction: 'left' | 'right') => void;
}

const SwipeCard = ({ profile, matchScore, totalInterests, onSwipe }: SwipeCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const baahOpacity = useTransform(x, [0, 100], [0, 1]);
  const naahOpacity = useTransform(x, [-100, 0], [1, 0]);

  const [exiting, setExiting] = useState(false);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setExiting(true);
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      setExiting(true);
      onSwipe('left');
    }
  };

  const matchLabel =
    matchScore >= 8
      ? 'Perfect Herd Match 🐑'
      : matchScore >= 5
      ? 'Great Match 🐏'
      : 'New Friend 🐑';

  return (
    <motion.div
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      animate={exiting ? { opacity: 0 } : {}}
      className="w-full max-w-sm bg-card rounded-3xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing relative"
    >
      {/* Overlay Labels */}
      <motion.div
        style={{ opacity: baahOpacity }}
        className="absolute top-8 left-6 z-10 bg-green-500/90 px-5 py-2 rounded-2xl -rotate-12"
      >
        <span className="text-2xl font-black tracking-wider" style={{ color: 'white' }}>BAAH</span>
      </motion.div>
      <motion.div
        style={{ opacity: naahOpacity }}
        className="absolute top-8 right-6 z-10 bg-destructive/90 px-5 py-2 rounded-2xl rotate-12"
      >
        <span className="text-2xl font-black tracking-wider" style={{ color: 'white' }}>NAAH</span>
      </motion.div>

      {/* Image */}
      <div className="w-full aspect-[3/4] bg-secondary">
        {profile.profile_image ? (
          <img
            src={profile.profile_image}
            alt={profile.name || ''}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🐑</div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-xl font-bold text-foreground">{profile.name || 'Anonymous'}</h3>
          {profile.age && <span className="text-muted-foreground">{profile.age}</span>}
        </div>

        {profile.bio && (
          <p className="text-sm text-muted-foreground mb-3">{profile.bio}</p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-primary">
            {matchScore}/{totalInterests} match
          </span>
          <span className="text-xs text-muted-foreground">– {matchLabel}</span>
        </div>

        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 6).map((interest) => (
              <span
                key={interest}
                className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SwipeCard;
