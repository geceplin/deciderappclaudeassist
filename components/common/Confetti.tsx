import React, { useEffect, useState } from 'react';

const CONFETTI_COLORS = ['#FFC300', '#FFD54F', '#E50914', '#FFFFFF', '#FFA000'];
const NUM_PIECES = 50;

const ConfettiPiece: React.FC<{ initialX: number; initialY: number; color: string; delay: number }> = ({ initialX, initialY, color, delay }) => {
  return (
    <div
      className="absolute w-2 h-4"
      style={{
        left: `${initialX}%`,
        top: `${initialY}%`,
        backgroundColor: color,
        animation: `fall 3s ${delay}s ease-out forwards`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  );
};

const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  const [pieces, setPieces] = useState<{ id: number; x: number; y: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    if (active) {
      setPieces(
        Array.from({ length: NUM_PIECES }).map((_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: -10 - Math.random() * 20, // Start above the screen
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          delay: Math.random() * 0.5,
        }))
      );
    } else {
        // Clear confetti after animation
        const timer = setTimeout(() => setPieces([]), 3500);
        return () => clearTimeout(timer);
    }
  }, [active]);

  if (!active && pieces.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        {pieces.map(p => (
          <ConfettiPiece key={p.id} initialX={p.x} initialY={p.y} color={p.color} delay={p.delay} />
        ))}
      </div>
    </>
  );
};

export default Confetti;
