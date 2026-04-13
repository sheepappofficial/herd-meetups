import { create } from 'zustand';

interface MatchData {
  matchId: string;
  matchedUserId: string;
  matchedUserName: string;
  matchedUserImage: string | null;
  matchScore: number;
}

interface AppState {
  currentMatch: MatchData | null;
  selectedCafeId: string | null;
  sheepCode: string | null;
  setCurrentMatch: (match: MatchData | null) => void;
  setSelectedCafe: (cafeId: string | null) => void;
  setSheepCode: (code: string | null) => void;
  generateSheepCode: () => string;
}

export const useAppStore = create<AppState>((set) => ({
  currentMatch: null,
  selectedCafeId: null,
  sheepCode: null,
  setCurrentMatch: (match) => set({ currentMatch: match }),
  setSelectedCafe: (cafeId) => set({ selectedCafeId: cafeId }),
  setSheepCode: (code) => set({ sheepCode: code }),
  generateSheepCode: () => {
    const code = `SHP-${Math.floor(1000 + Math.random() * 9000)}`;
    set({ sheepCode: code });
    return code;
  },
}));
