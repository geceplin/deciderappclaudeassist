import { useState, useMemo, useCallback } from 'react';
import { Movie } from '../types';
import { selectWinner } from '../utils/spinLogic';

const REEL_LENGTH = 50; // Total number of items in the visual reel
const SPIN_DURATION_MS = 5000; // Duration of the spin animation

export const useRoulette = (eligibleMovies: Movie[]) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Movie | null>(null);
  const [spinTargetIndex, setSpinTargetIndex] = useState(0);

  const reelItems = useMemo(() => {
    if (eligibleMovies.length === 0) return [];
    
    // Create a long list of movies for the reel by repeating the eligible list
    const items = [];
    for (let i = 0; i < REEL_LENGTH; i++) {
      items.push(eligibleMovies[i % eligibleMovies.length]);
    }
    return items;
  }, [eligibleMovies]);

  const startSpin = useCallback(() => {
    if (isSpinning || eligibleMovies.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    const winningMovie = selectWinner(eligibleMovies);
    if (!winningMovie) {
        setIsSpinning(false);
        return;
    }
    
    // Find the index of the winner in the original list
    const winnerIndexInEligible = eligibleMovies.findIndex(m => m.id === winningMovie.id);
    
    // Determine the target index in the long reel
    // We want to land on the winner somewhere in the latter half of the reel
    // To make it look random, we find an instance of the winner around the 3/4 mark
    const targetZoneStart = Math.floor(REEL_LENGTH * 0.75);
    let targetIndex = -1;
    for(let i = targetZoneStart; i < REEL_LENGTH; i++) {
        if(reelItems[i].id === winningMovie.id) {
            targetIndex = i;
            break;
        }
    }
    // Fallback if not found (should be impossible with the modulo logic)
    if (targetIndex === -1) {
        targetIndex = REEL_LENGTH - eligibleMovies.length + winnerIndexInEligible;
    }

    setSpinTargetIndex(targetIndex);

    setTimeout(() => {
      setIsSpinning(false);
      setWinner(winningMovie);
    }, SPIN_DURATION_MS);
  }, [isSpinning, eligibleMovies, reelItems]);

  const reset = useCallback(() => {
    setIsSpinning(false);
    setWinner(null);
    setSpinTargetIndex(0);
  }, []);

  return {
    isSpinning,
    winner,
    reelItems,
    spinTargetIndex,
    startSpin,
    reset,
    SPIN_DURATION_MS,
  };
};
