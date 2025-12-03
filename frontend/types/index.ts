export interface Product {
  id: number;
  name: string;
  price: number;
  availableStock: number;
}

export enum ReservationStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

export interface Reservation {
  id: number;
  productId: number;
  quantity: number;
  status: ReservationStatus;
  createdAt: string;
  expiresAt: string;
  product?: Product;
}

export interface CreateReservationDto {
  productId: number;
  quantity: number;
}
