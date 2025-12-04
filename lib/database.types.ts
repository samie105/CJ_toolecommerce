// Supabase Database Types for E-commerce CJ Tables
// Auto-generated types for ecommerce_cj_admins and ecommerce_cj_users tables

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// =============================================
// JSONB Field Types
// =============================================

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  label: string;
  last4?: string;
  expiry_month?: string;
  expiry_year?: string;
  card_brand?: 'visa' | 'mastercard' | 'amex' | 'discover';
  email?: string;
  is_default: boolean;
}

export interface OrderItem {
  product_id: string;
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
  tracking_number?: string;
  estimated_delivery: string;
  shipping_address: Address;
  payment_method: PaymentMethod;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  added_at: string;
}

export interface ProductFeature {
  icon: string;
  title: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image: string;
  images?: string[];
  category: string;
  badge?: string;
  rating?: number;
  review_count?: number;
  in_stock?: boolean;
  sku?: string;
  description?: string;
  long_description?: string;
  specs?: string[];
  features?: ProductFeature[];
  included?: string[];
  is_featured?: boolean;
  is_new?: boolean;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications_enabled?: boolean;
  marketing_emails?: boolean;
  preferred_currency?: string;
  preferred_language?: string;
}

// Payment Settings Types
export interface CryptoWallet {
  id: string;
  name: string;
  symbol: string;
  address: string;
  image: string;
  enabled: boolean;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode?: string;
  iban?: string;
  enabled: boolean;
}

export interface P2PPayment {
  id: string;
  name: string;
  username: string;
  image: string;
  enabled: boolean;
}

export interface SquarePayment {
  id: string;
  name: string;
  username: string;
  image: string;
  enabled: boolean;
}

export interface PaymentSettings {
  crypto_wallets: CryptoWallet[];
  bank_details: BankDetails | null;
  p2p_payments: P2PPayment[];
  square_payments?: SquarePayment[];
}

// Customer Types (for customers stored in the users table)
export interface Customer {
  id: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  status: 'active' | 'inactive' | 'banned';
  addresses: CustomerAddress[];
  last_name: string;
  created_at: string;
  first_name: string;
  total_spent: number;
  orders_count: number;
  last_order_at?: string | null;
  password?: string;
}

export interface CustomerAddress {
  id?: string;
  label?: string;
  zip: string;
  city: string;
  state: string;
  street: string;
  country?: string;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}

// =============================================
// Table Types
// =============================================

export interface EcommerceCjAdmin {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar: string | null;
  role: 'admin' | 'super_admin' | null;
  is_active: boolean | null;
  payment_settings: PaymentSettings | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface EcommerceCjAdminInsert {
  id?: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  avatar?: string | null;
  role?: 'admin' | 'super_admin' | null;
  is_active?: boolean | null;
  payment_settings?: PaymentSettings | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface EcommerceCjAdminUpdate {
  id?: string;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  avatar?: string | null;
  role?: 'admin' | 'super_admin' | null;
  is_active?: boolean | null;
  payment_settings?: PaymentSettings | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface EcommerceCjUser {
  id: string;
  admin_id: string | null;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar: string | null;
  is_active: boolean | null;
  addresses: Address[] | null;
  payment_methods: PaymentMethod[] | null;
  orders: Order[] | null;
  favorites: string[] | null;
  cart: CartItem[] | null;
  products: Product[] | null;
  customers: Customer[] | null;
  categories: Category[] | null;
  preferences: UserPreferences | null;
  created_at: string | null;
  updated_at: string | null;
  last_login_at: string | null;
}

export interface EcommerceCjUserInsert {
  id?: string;
  admin_id?: string | null;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  avatar?: string | null;
  is_active?: boolean | null;
  addresses?: Address[] | null;
  payment_methods?: PaymentMethod[] | null;
  orders?: Order[] | null;
  favorites?: string[] | null;
  cart?: CartItem[] | null;
  products?: Product[] | null;
  customers?: Customer[] | null;
  categories?: Category[] | null;
  preferences?: UserPreferences | null;
  created_at?: string | null;
  updated_at?: string | null;
  last_login_at?: string | null;
}

export interface EcommerceCjUserUpdate {
  id?: string;
  admin_id?: string | null;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  avatar?: string | null;
  is_active?: boolean | null;
  addresses?: Address[] | null;
  payment_methods?: PaymentMethod[] | null;
  orders?: Order[] | null;
  favorites?: string[] | null;
  cart?: CartItem[] | null;
  products?: Product[] | null;
  customers?: Customer[] | null;
  categories?: Category[] | null;
  preferences?: UserPreferences | null;
  created_at?: string | null;
  updated_at?: string | null;
  last_login_at?: string | null;
}

// =============================================
// Database Schema
// =============================================

export interface Database {
  public: {
    Tables: {
      ecommerce_cj_admins: {
        Row: EcommerceCjAdmin;
        Insert: EcommerceCjAdminInsert;
        Update: EcommerceCjAdminUpdate;
        Relationships: [];
      };
      ecommerce_cj_users: {
        Row: EcommerceCjUser;
        Insert: EcommerceCjUserInsert;
        Update: EcommerceCjUserUpdate;
        Relationships: [
          {
            foreignKeyName: 'ecommerce_cj_users_admin_id_fkey';
            columns: ['admin_id'];
            isOneToOne: false;
            referencedRelation: 'ecommerce_cj_admins';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// =============================================
// Helper Types
// =============================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
