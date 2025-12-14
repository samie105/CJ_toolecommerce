'use server';

import { createServerClient, createUntypedClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

interface OrderItem {
  product_id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  state: string;
  country: string;
}

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  payment_screenshot?: string;
  shipping_address: ShippingAddress;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface CreateOrderData {
  items: {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentScreenshot?: string;
  notes?: string;
}

// Create a new order
export async function createOrder(data: CreateOrderData): Promise<{
  success: boolean;
  order?: Order;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('aresdiamondtools-user-id')?.value;
    const adminId = cookieStore.get('aresdiamondtools-admin-id')?.value;

    if (!userId || !adminId) {
      return { success: false, error: 'Please login to place an order' };
    }

    const supabase = createServerClient();
    
    // Get customer data
    const { data: userData, error: fetchError } = await supabase
      .from('ecommerce_cj_users')
      .select('customers, orders')
      .eq('id', adminId)
      .single();

    if (fetchError || !userData) {
      return { success: false, error: 'Failed to fetch user data' };
    }

    const customers = (userData as { customers: { id: string; first_name: string; last_name: string; email: string }[] }).customers || [];
    const customer = customers.find((c) => c.id === userId);

    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 100 ? 0 : 15;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    // Create order
    const newOrder: Order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      customer_id: userId,
      customer_name: `${customer.first_name} ${customer.last_name}`,
      customer_email: customer.email,
      items: data.items.map((item) => ({
        product_id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal,
      shipping,
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      status: 'pending',
      payment_status: 'pending',
      payment_method: data.paymentMethod,
      payment_screenshot: data.paymentScreenshot,
      shipping_address: data.shippingAddress,
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to orders array
    const existingOrders = (userData as { orders: Order[] }).orders || [];
    const updatedOrders = [newOrder, ...existingOrders];

    // Update database
    const untypedSupabase = createUntypedClient();
    const { error: updateError } = await untypedSupabase
      .from('ecommerce_cj_users')
      .update({ orders: updatedOrders })
      .eq('id', adminId);

    if (updateError) {
      console.error('Order creation error:', updateError);
      return { success: false, error: 'Failed to create order' };
    }

    return { success: true, order: newOrder };
  } catch (err) {
    console.error('Create order error:', err);
    return { success: false, error: 'An error occurred' };
  }
}

// Get orders for current user
export async function getUserOrders(): Promise<Order[]> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('aresdiamondtools-user-id')?.value;
    const adminId = cookieStore.get('aresdiamondtools-admin-id')?.value;

    if (!userId || !adminId) {
      return [];
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('ecommerce_cj_users')
      .select('orders')
      .eq('id', adminId)
      .single();

    if (error || !data) {
      return [];
    }

    const orders = (data as { orders: Order[] }).orders || [];
    
    // Filter orders for this customer
    return orders.filter((order) => order.customer_id === userId);
  } catch (err) {
    console.error('Get user orders error:', err);
    return [];
  }
}

// Get order by ID
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('aresdiamondtools-admin-id')?.value;
    const userId = cookieStore.get('aresdiamondtools-user-id')?.value;

    // Check if user is admin or regular user
    const searchId = adminId || userId;
    
    if (!searchId) {
      return null;
    }

    const supabase = createServerClient();
    
    // If admin, search all users' orders
    if (adminId) {
      const { data: allUsers, error } = await supabase
        .from('ecommerce_cj_users')
        .select('orders');
      
      if (error || !allUsers) {
        return null;
      }
      
      for (const userData of allUsers) {
        const orders = (userData as { orders: Order[] }).orders || [];
        const foundOrder = orders.find((order) => order.id === orderId);
        if (foundOrder) {
          return foundOrder;
        }
      }
      return null;
    }
    
    // For regular users, search only their orders
    const { data, error } = await supabase
      .from('ecommerce_cj_users')
      .select('orders')
      .eq('id', userId!)
      .single();

    if (error || !data) {
      return null;
    }

    const orders = (data as { orders: Order[] }).orders || [];
    return orders.find((order) => order.id === orderId) || null;
  } catch (err) {
    console.error('Get order by ID error:', err);
    return null;
  }
}
