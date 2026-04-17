export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  email: string;
  role: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  category?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface CartResponse {
  items: CartItem[];
  totalAmount: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface ShippingAddress {
  street?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
}

export interface OrderStatusUpdate {
  status: string;
  timestamp?: string;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress?: ShippingAddress;
  paymentStatus?: string;
  paymentMethod?: string;
  statusHistory?: OrderStatusUpdate[];
  returnStatus?: string;
  returnRequestedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AddressRequest {
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  address: AddressRequest;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface WishlistItem {
  productId: number;
  productName: string;
  price: number;
  imageUrl?: string;
  category?: string;
  stockQuantity?: number;
  addedAt?: string;
}

export interface ProductReview {
  id: string;
  productId: number;
  rating: number;
  title?: string;
  comment?: string;
  userName: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type?: 'order' | 'wishlist' | 'review' | 'return' | 'payment' | 'system';
  link?: string;
}
