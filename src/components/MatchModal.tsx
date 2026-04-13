import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface MatchModalProps {
  open: boolean;
  onClose: () => void;
  profile: any;
  matchScore: number;
  totalInterests: number;
}

const MatchModal = ({ open, onClose, profile, matchScore, totalInterests }: MatchModalProps) => {
  const navigate = useNavigate();

  if (!open || !profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-foreground/60 flex items-center justify-center px-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-card rounded-3xl p-8 w-full max-w-sm text-center shadow-xl"
      >
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          You found your herd! 🐑
        </h2>
        <p className="text-muted-foreground mb-6">
          {matchScore}/{totalInterests} interests match with{' '}
          <span className="font-semibold text-foreground">{profile.name}</span>
        </p>

        <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-6 overflow-hidden">
          {profile.profile_image ? (
            <img src={profile.profile_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">🐑</div>
          )}
        </div>

        <Button
          onClick={() => {
            onClose();
            navigate('/cafes');
          }}
          className="w-full h-12 rounded-2xl text-base font-semibold mb-3"
        >
          Pick a Café ☕
        </Button>
        <button onClick={onClose} className="text-sm text-muted-foreground">
          Keep Swiping
        </button>
      </motion.div>
    </motion.div>
  );
};

export default MatchModal;
