'use client';

import { Reservation, ReservationStatus } from '@/types';
import { useCountdown } from '@/hooks/useCountdown';
import { useEffect, useRef } from 'react';

interface ReservationCardProps {
  reservation: Reservation;
  onComplete: (id: number) => Promise<void>;
  onExpire: (id: number) => void;
  isCompleting: boolean;
}

export function ReservationCard({ 
  reservation, 
  onComplete, 
  onExpire,
  isCompleting 
}: ReservationCardProps) {
  const { formattedTime, isExpired, timeLeft } = useCountdown(reservation.expiresAt);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    // Only call onExpire once when it transitions from active to expired
    // Don't call if it was already expired when we first saw it
    if (isExpired && reservation.status === ReservationStatus.ACTIVE && !hasExpiredRef.current) {
      // Check if we have a valid timeLeft calculation (not just initial state)
      const now = new Date().getTime();
      const expiration = new Date(reservation.expiresAt).getTime();
      if (expiration < now) {
        hasExpiredRef.current = true;
        onExpire(reservation.id);
      }
    }
  }, [isExpired, reservation.status, reservation.id, reservation.expiresAt, onExpire]);

  const getStatusBadge = () => {
    switch (reservation.status) {
      case ReservationStatus.ACTIVE:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Active
          </span>
        );
      case ReservationStatus.COMPLETED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
            ✓ Completed
          </span>
        );
      case ReservationStatus.EXPIRED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
            ✗ Expired
          </span>
        );
    }
  };

  const isActive = reservation.status === ReservationStatus.ACTIVE && !isExpired;
  const showTimer = reservation.status === ReservationStatus.ACTIVE;

  // Debug log to see the entire reservation object
  console.log("Reservation data:", JSON.stringify(reservation, null, 2));
  console.log("Product:", reservation);

  return (
    <div className={`bg-white rounded-xl shadow-md p-5 border-l-4 transition-all duration-300 ${
      reservation.status === ReservationStatus.ACTIVE 
        ? 'border-green-500 hover:shadow-lg' 
        : reservation.status === ReservationStatus.COMPLETED
        ? 'border-blue-500'
        : 'border-red-500 opacity-75'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-lg mb-1">
            {reservation.product?.name || `Product #${reservation.productId}`}
          </h4>
          <p className="text-sm text-gray-600">
            Quantity: <span className="font-semibold">{reservation.quantity}</span>
            {reservation.product && (
              <span className="ml-3">
                Total: <span className="font-bold text-indigo-600">
                  ${(reservation.product.price * reservation.quantity).toFixed(2)}
                </span>
              </span>
            )}
          </p>
        </div>
        {getStatusBadge()}
      </div>

      {showTimer && (
        <div className="mb-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1 font-medium">Time Remaining</div>
            <div className={`text-3xl font-bold font-mono transition-colors ${
              timeLeft <= 30 
                ? 'text-red-600 animate-pulse' 
                : timeLeft <= 60
                ? 'text-yellow-600'
                : 'text-green-600'
            }`}>
              {formattedTime}
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 rounded-full ${
                  timeLeft <= 30 
                    ? 'bg-red-500' 
                    : timeLeft <= 60
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${(timeLeft / 120) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1 mb-4">
        <div>Reservation ID: #{reservation.id}</div>
        <div>Created: {new Date(reservation.createdAt).toLocaleString()}</div>
        {reservation.status !== ReservationStatus.ACTIVE && (
          <div>Expires: {new Date(reservation.expiresAt).toLocaleString()}</div>
        )}
      </div>

      {isActive && (
        <button
          onClick={() => onComplete(reservation.id)}
          disabled={isCompleting}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {isCompleting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Completing...
            </span>
          ) : (
            'Complete Purchase'
          )}
        </button>
      )}
    </div>
  );
}
