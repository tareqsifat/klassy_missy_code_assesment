'use client';

import { Product } from '@/types';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onReserve: (productId: number, quantity: number) => Promise<void>;
  isLoading: boolean;
}

export function ProductCard({ product, onReserve, isLoading }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [reserving, setReserving] = useState(false);

  const handleReserve = async () => {
    setReserving(true);
    try {
      await onReserve(product.id, quantity);
    } finally {
      setReserving(false);
      setQuantity(1);
    }
  };

  const isOutOfStock = product.availableStock === 0;
  const maxQuantity = Math.min(10, product.availableStock);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border border-gray-100">
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 h-48 flex items-center justify-center">
        <div className="text-6xl text-white opacity-90">📦</div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex items-baseline justify-between mb-4">
          <div className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ${product.price.toFixed(2)}
          </div>
          <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
            isOutOfStock 
              ? 'bg-red-100 text-red-700' 
              : product.availableStock < 10
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {isOutOfStock ? 'Out of Stock' : `${product.availableStock} in stock`}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label htmlFor={`quantity-${product.id}`} className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Quantity:
            </label>
            <select
              id={`quantity-${product.id}`}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              disabled={isOutOfStock || reserving}
              className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleReserve}
            disabled={isOutOfStock || reserving || isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {reserving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Reserving...
              </span>
            ) : isOutOfStock ? (
              'Out of Stock'
            ) : (
              'Reserve Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
