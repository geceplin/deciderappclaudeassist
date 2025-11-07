import { useState, useCallback } from 'react';
import { Movie } from '../types';
import { selectWinner } from '../utils/spinLogic';

const SPIN_DURATION_MS = 5000; // 5 seconds for the full animation

export interface RouletteResult {
  movie: Movie;
  finalRotation: number;
}

export const useRoulette = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<RouletteResult | null>(null);

  const spin = useCallback((movies: Movie[]): Promise<Movie> => {
    return new Promise((resolve) => {
      if (isSpinning || movies.length < 2) {
        // This case should be handled by disabling the button, but as a safeguard.
        return;
      }

      setIsSpinning(true);
      setResult(null);

      const winner = selectWinner(movies);
      if (!winner) {
          setIsSpinning(false);
          return;
      };

      const winnerIndex = movies.findIndex(m => m.id === winner.id);
      
      // --- Calculate Final Rotation ---
      // 1. Base Rotations: Add 5-7 full spins for visual effect.
      const fullSpins = 5 + Math.floor(Math.random() * 3);
      const baseRotation = 360 * fullSpins;

      // 2. Segment Angle: The angle for each movie slot on the reel.
      const segmentAngle = 360 / movies.length;

      // 3. Target Angle: The angle needed to land the pointer on the winner.
      // We subtract because the rotation is clockwise.
      const targetAngle = segmentAngle * winnerIndex;
      
      // 4. Random Offset: Add a small random offset within the segment for variability.
      const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;

      const finalRotation = baseRotation - targetAngle + randomOffset;
      
      setResult({ movie: winner, finalRotation });

      // After the animation duration, finalize the state
      setTimeout(() => {
        setIsSpinning(false);
        if (navigator.vibrate) {
          navigator.vibrate([200, 50, 200]); // Haptic feedback for win
        }
        resolve(winner);
      }, SPIN_DURATION_MS);
    });
  }, [isSpinning]);

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return { isSpinning, result, spin, reset };
};
