export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  label: string;
  last4?: string; // Last 4 digits for cards
  expiryMonth?: string;
  expiryYear?: string;
  cardBrand?: 'visa' | 'mastercard' | 'amex' | 'discover';
  email?: string; // For PayPal
  isDefault: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'processing' | 'in_transit' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  estimatedDelivery: string;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
  createdAt: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  orders: Order[];
  favorites: string[]; // Array of product IDs
}

// Mock user data
export const mockUser: User = {
  id: 'user_001',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1 (555) 123-4567',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
  createdAt: '2024-01-15T10:30:00Z',
  addresses: [
    {
      id: 'addr_001',
      label: 'Home',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      isDefault: true,
    },
    {
      id: 'addr_002',
      label: 'Office',
      street: '456 Business Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'United States',
      isDefault: false,
    },
  ],
  paymentMethods: [
    {
      id: 'pm_001',
      type: 'credit_card',
      label: 'Personal Visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '2027',
      cardBrand: 'visa',
      isDefault: true,
    },
    {
      id: 'pm_002',
      type: 'credit_card',
      label: 'Business Mastercard',
      last4: '8888',
      expiryMonth: '06',
      expiryYear: '2026',
      cardBrand: 'mastercard',
      isDefault: false,
    },
    {
      id: 'pm_003',
      type: 'paypal',
      label: 'PayPal',
      email: 'john.doe@example.com',
      isDefault: false,
    },
  ],
  orders: [
    {
      id: 'ORD-001',
      date: '2025-11-20T14:30:00Z',
      items: [
        {
          productId: '1',
          name: 'Professional Cordless Drill Kit',
          quantity: 1,
          price: 249.99,
          image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80',
        },
        {
          productId: '2',
          name: 'Precision Angle Grinder',
          quantity: 1,
          price: 179.99,
          image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&q=80',
        },
        {
          productId: '3',
          name: 'Heavy Duty Hammer Drill',
          quantity: 1,
          price: 329.99,
          image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&q=80',
        },
      ],
      subtotal: 759.97,
      shipping: 0,
      tax: 60.80,
      total: 820.77,
      status: 'delivered',
      trackingNumber: 'TRK-92847561',
      estimatedDelivery: '2025-11-22T18:00:00Z',
      shippingAddress: {
        id: 'addr_001',
        label: 'Home',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        isDefault: true,
      },
      paymentMethod: {
        id: 'pm_001',
        type: 'credit_card',
        label: 'Personal Visa',
        last4: '4242',
        cardBrand: 'visa',
        isDefault: true,
      },
    },
    {
      id: 'ORD-002',
      date: '2025-11-18T10:15:00Z',
      items: [
        {
          productId: '4',
          name: 'Multi-Tool Oscillating Set',
          quantity: 1,
          price: 199.99,
          image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&q=80',
        },
      ],
      subtotal: 199.99,
      shipping: 15.00,
      tax: 17.20,
      total: 232.19,
      status: 'in_transit',
      trackingNumber: 'TRK-84726351',
      estimatedDelivery: '2025-11-24T18:00:00Z',
      shippingAddress: {
        id: 'addr_001',
        label: 'Home',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        isDefault: true,
      },
      paymentMethod: {
        id: 'pm_001',
        type: 'credit_card',
        label: 'Personal Visa',
        last4: '4242',
        cardBrand: 'visa',
        isDefault: true,
      },
    },
    {
      id: 'ORD-003',
      date: '2025-11-15T16:45:00Z',
      items: [
        {
          productId: '5',
          name: 'Professional Jigsaw',
          quantity: 2,
          price: 159.99,
          image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80',
        },
        {
          productId: '6',
          name: 'Compact Impact Driver',
          quantity: 1,
          price: 149.99,
          image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80',
        },
        {
          productId: '7',
          name: 'Laser Distance Measure',
          quantity: 2,
          price: 89.99,
          image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80',
        },
      ],
      subtotal: 649.95,
      shipping: 0,
      tax: 52.00,
      total: 701.95,
      status: 'delivered',
      trackingNumber: 'TRK-65283947',
      estimatedDelivery: '2025-11-17T18:00:00Z',
      shippingAddress: {
        id: 'addr_001',
        label: 'Home',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        isDefault: true,
      },
      paymentMethod: {
        id: 'pm_002',
        type: 'credit_card',
        label: 'Business Mastercard',
        last4: '8888',
        cardBrand: 'mastercard',
        isDefault: false,
      },
    },
    {
      id: 'ORD-004',
      date: '2025-11-12T09:20:00Z',
      items: [
        {
          productId: '8',
          name: 'Digital Level Pro',
          quantity: 1,
          price: 119.99,
          image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80',
        },
        {
          productId: '9',
          name: 'Professional Circular Saw',
          quantity: 1,
          price: 279.99,
          image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80',
        },
      ],
      subtotal: 399.98,
      shipping: 0,
      tax: 32.00,
      total: 431.98,
      status: 'processing',
      estimatedDelivery: '2025-11-25T18:00:00Z',
      shippingAddress: {
        id: 'addr_002',
        label: 'Office',
        street: '456 Business Ave',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'United States',
        isDefault: false,
      },
      paymentMethod: {
        id: 'pm_003',
        type: 'paypal',
        label: 'PayPal',
        email: 'john.doe@example.com',
        isDefault: false,
      },
    },
    {
      id: 'ORD-005',
      date: '2025-11-08T13:10:00Z',
      items: [
        {
          productId: '10',
          name: 'Cordless Reciprocating Saw',
          quantity: 1,
          price: 219.99,
          image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80',
        },
        {
          productId: '11',
          name: 'Professional Tool Set - 200pc',
          quantity: 1,
          price: 399.99,
          image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80',
        },
      ],
      subtotal: 619.98,
      shipping: 0,
      tax: 49.60,
      total: 669.58,
      status: 'delivered',
      trackingNumber: 'TRK-39485762',
      estimatedDelivery: '2025-11-10T18:00:00Z',
      shippingAddress: {
        id: 'addr_001',
        label: 'Home',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        isDefault: true,
      },
      paymentMethod: {
        id: 'pm_001',
        type: 'credit_card',
        label: 'Personal Visa',
        last4: '4242',
        cardBrand: 'visa',
        isDefault: true,
      },
    },
  ],
  favorites: ['1', '3', '5', '7', '9'],
};

// Helper functions
export function getUserById(userId: string): User | null {
  // In a real app, this would fetch from a database
  if (userId === mockUser.id) {
    return mockUser;
  }
  return null;
}

export function getCurrentUser(): User {
  // In a real app, this would check authentication and fetch the current user
  return mockUser;
}

export function getUserOrders(userId: string): Order[] {
  const user = getUserById(userId);
  return user?.orders || [];
}

export function getUserAddresses(userId: string): Address[] {
  const user = getUserById(userId);
  return user?.addresses || [];
}

export function getUserPaymentMethods(userId: string): PaymentMethod[] {
  const user = getUserById(userId);
  return user?.paymentMethods || [];
}

export function getUserFavorites(userId: string): string[] {
  const user = getUserById(userId);
  return user?.favorites || [];
}

export function getOrderById(userId: string, orderId: string): Order | null {
  const orders = getUserOrders(userId);
  return orders.find((order) => order.id === orderId) || null;
}

export function getDefaultAddress(userId: string): Address | null {
  const addresses = getUserAddresses(userId);
  return addresses.find((addr) => addr.isDefault) || addresses[0] || null;
}

export function getDefaultPaymentMethod(userId: string): PaymentMethod | null {
  const paymentMethods = getUserPaymentMethods(userId);
  return paymentMethods.find((pm) => pm.isDefault) || paymentMethods[0] || null;
}

// Stats helpers
export function getUserStats(userId: string) {
  const user = getUserById(userId);
  if (!user) {
    return {
      totalOrders: 0,
      totalSpent: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
    };
  }

  return {
    totalOrders: user.orders.length,
    totalSpent: user.orders.reduce((sum, order) => sum + order.total, 0),
    pendingOrders: user.orders.filter((o) => o.status === 'processing' || o.status === 'in_transit').length,
    deliveredOrders: user.orders.filter((o) => o.status === 'delivered').length,
  };
}

export function getRecentOrders(userId: string, limit: number = 5): Order[] {
  const orders = getUserOrders(userId);
  return orders
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// Format helpers
export function formatPaymentMethod(method: PaymentMethod): string {
  switch (method.type) {
    case 'credit_card':
    case 'debit_card':
      return `${method.cardBrand?.toUpperCase()} •••• ${method.last4}`;
    case 'paypal':
      return `PayPal (${method.email})`;
    case 'apple_pay':
      return 'Apple Pay';
    case 'google_pay':
      return 'Google Pay';
    default:
      return method.label;
  }
}

export function formatAddress(address: Address): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
}

export function getOrderStatusColor(status: Order['status']): string {
  switch (status) {
    case 'delivered':
      return 'green';
    case 'in_transit':
      return 'blue';
    case 'processing':
      return 'amber';
    case 'cancelled':
      return 'red';
    default:
      return 'gray';
  }
}

export function getOrderStatusLabel(status: Order['status']): string {
  switch (status) {
    case 'delivered':
      return 'Delivered';
    case 'in_transit':
      return 'In Transit';
    case 'processing':
      return 'Processing';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}
