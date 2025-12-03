import { Product, Reservation, CreateReservationDto } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = {
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async createReservation(data: CreateReservationDto): Promise<Reservation> {
    const response = await fetch(`${API_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create reservation');
    }
    return response.json();
  },

  async completeReservation(id: number): Promise<Reservation> {
    const response = await fetch(`${API_URL}/reservations/${id}/complete`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to complete reservation');
    }
    return response.json();
  },

  async getReservation(id: number): Promise<Reservation> {
    const response = await fetch(`${API_URL}/reservations/${id}`);
    if (!response.ok) throw new Error('Failed to fetch reservation');
    return response.json();
  },
};
