'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product, Reservation, ReservationStatus } from '@/types';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { ReservationCard } from '@/components/ReservationCard';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProducts = useCallback(async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      showToast('Failed to load products', 'error');
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await fetchProducts();
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  useEffect(() => {
    fetchData();
    
    // Poll products every 3 seconds to sync stock
    const interval = setInterval(fetchProducts, 3000);
    
    return () => clearInterval(interval);
  }, [fetchData, fetchProducts]);

  // Load reservations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('reservations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setReservations(parsed);
      } catch (error) {
        console.error('Failed to parse stored reservations:', error);
      }
    }
  }, []);

  // Save reservations to localStorage whenever they change
  useEffect(() => {
    if (reservations.length > 0) {
      localStorage.setItem('reservations', JSON.stringify(reservations));
    }
  }, [reservations]);

  const handleReserve = async (productId: number, quantity: number) => {
    try {
      const reservation = await api.createReservation({ productId, quantity });
      setReservations((prev) => [reservation, ...prev]);
      showToast('Reservation created successfully!', 'success');
      await fetchProducts(); // Refresh stock
    } catch (error: any) {
      showToast(error.message || 'Failed to create reservation', 'error');
    }
  };

  const handleComplete = async (id: number) => {
    setCompletingId(id);
    try {
      const completed = await api.completeReservation(id);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? completed : r))
      );
      showToast('Purchase completed successfully!', 'success');
      await fetchProducts(); // Refresh stock
    } catch (error: any) {
      showToast(error.message || 'Failed to complete purchase', 'error');
      
      // If expired, update local state
      if (error.message.includes('expired')) {
        setReservations((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: ReservationStatus.EXPIRED } : r
          )
        );
      }
    } finally {
      setCompletingId(null);
    }
  };

  const handleExpire = (id: number) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: ReservationStatus.EXPIRED } : r
      )
    );
    showToast('Reservation expired', 'error');
    fetchProducts(); // Refresh stock
  };

  const activeReservations = reservations.filter(
    (r) => r.status === ReservationStatus.ACTIVE
  );
  const pastReservations = reservations.filter(
    (r) => r.status !== ReservationStatus.ACTIVE
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div
            className={`px-6 py-4 rounded-lg shadow-2xl border-l-4 ${
              toast.type === 'success'
                ? 'bg-white border-green-500 text-green-800'
                : 'bg-white border-red-500 text-red-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {toast.type === 'success' ? '✓' : '✗'}
              </span>
              <span className="font-semibold">{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">⚡</div>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Flash Sale Reservation System
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Reserve products for 2 minutes before someone else does!
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Reservations */}
        {activeReservations.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Active Reservations
              </h2>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                {activeReservations.length}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onComplete={handleComplete}
                  onExpire={handleExpire}
                  isCompleting={completingId === reservation.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Available Products
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <svg
                  className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-gray-600 font-medium">Loading products...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <p className="text-gray-600 text-lg">No products available</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onReserve={handleReserve}
                  isLoading={loading}
                />
              ))}
            </div>
          )}
        </section>

        {/* Past Reservations */}
        {pastReservations.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Reservation History
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onComplete={handleComplete}
                  onExpire={handleExpire}
                  isCompleting={completingId === reservation.id}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            Built with NestJS + Next.js | Flash Sale Reservation System
          </p>
        </div>
      </footer>
    </div>
  );
}
