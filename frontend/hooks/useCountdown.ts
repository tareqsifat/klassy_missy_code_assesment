'use client';

import { useState, useEffect, useMemo } from 'react';

interface UseCountdownResult {
  timeLeft: number;
  isExpired: boolean;
  formattedTime: string;
}

export function useCountdown(expiresAt: string): UseCountdownResult {
  // Calculate initial time left immediately to avoid flash of "expired"
  const initialTimeLeft = useMemo(() => {
    const now = new Date().getTime();
    const expiration = new Date(expiresAt).getTime();
    const difference = expiration - now;
    return Math.max(0, Math.floor(difference / 1000));
  }, [expiresAt]);

  const [timeLeft, setTimeLeft] = useState<number>(initialTimeLeft);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiration = new Date(expiresAt).getTime();
      const difference = expiration - now;
      return Math.max(0, Math.floor(difference / 1000));
    };

    // Set initial value
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return {
    timeLeft,
    isExpired: timeLeft <= 0,
    formattedTime,
  };
}
