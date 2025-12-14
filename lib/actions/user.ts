'use server';

import { createServerClient, createUntypedClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { Customer, CustomerAddress } from './auth';
import { Product } from '@/lib/products-data';

interface OrderItem {
  product_id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
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
  payment_method?: string;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  created_at: string;
  updated_at: string;
}

interface UserRow {
  id: string;
  customers: Customer[] | null;
  orders: Order[] | null;
}

// Get user's orders
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
      .select('customers, orders')
      .eq('id', adminId)
      .single();

    if (error || !data) {
      return [];
    }

    const userData = data as unknown as UserRow;
    const customer = userData.customers?.find((c) => c.id === userId);

    if (!customer) {
      return [];
    }

    // Filter orders for this customer
    const userOrders = userData.orders?.filter(
      (order) => order.customer_email === customer.email || order.customer_id === userId
    ) || [];

    return userOrders;
  } catch (err) {
    console.error('Get user orders error:', err);
    return [];
  }
}

// Get user stats
export async function getUserStats(): Promise<{
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  thisMonthSpent: number;
}> {
  try {
    const orders = await getUserOrders();
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthOrders = orders.filter(
      (order) => new Date(order.created_at) >= startOfMonth
    );
    
    return {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => {
        if (order.status !== 'cancelled') {
          return sum + order.total;
        }
        return sum;
      }, 0),
      pendingOrders: orders.filter(
        (order) => order.status === 'pending' || order.status === 'processing' || order.status === 'shipped'
      ).length,
      thisMonthSpent: thisMonthOrders.reduce((sum, order) => {
        if (order.status !== 'cancelled') {
          return sum + order.total;
        }
        return sum;
      }, 0),
    };
  } catch (err) {
    console.error('Get user stats error:', err);
    return {
      totalOrders: 0,
      totalSpent: 0,
      pendingOrders: 0,
      thisMonthSpent: 0,
    };
  }
}

// Update user profile
export async function updateUserProfile(data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('aresdiamondtools-user-id')?.value;
    const adminId = cookieStore.get('aresdiamondtools-admin-id')?.value;

    if (!userId || !adminId) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = createServerClient();
    const { data: userData, error: fetchError } = await supabase
      .from('ecommerce_cj_users')
      .select('customers')
      .eq('id', adminId)
      .single();

    if (fetchError || !userData) {
      return { success: false, error: 'Failed to fetch user data' };
    }

    const customers = (userData as unknown as { customers: Customer[] }).customers || [];
    const customerIndex = customers.findIndex((c) => c.id === userId);

    if (customerIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    // Update customer data
    if (data.firstName !== undefined) {
      customers[customerIndex].first_name = data.firstName;
    }
    if (data.lastName !== undefined) {
      customers[customerIndex].last_name = data.lastName;
    }
    if (data.phone !== undefined) {
      customers[customerIndex].phone = data.phone;
    }
    if (data.avatar !== undefined) {
      customers[customerIndex].avatar = data.avatar;
    }

    const untypedSupabase = createUntypedClient();
    const { error: updateError } = await untypedSupabase
      .from('ecommerce_cj_users')
      .update({ customers })
      .eq('id', adminId);

    if (updateError) {
      return { success: false, error: 'Failed to update profile' };
    }

    return { success: true };
  } catch (err) {
    console.error('Update profile error:', err);
    return { success: false, error: 'An error occurred' };
  }
}

// Add address
export async function addUserAddress(address: Omit<CustomerAddress, 'id'>): Promise<{
  success: boolean;
  address?: CustomerAddress;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('aresdiamondtools-user-id')?.value;
    const adminId = cookieStore.get('aresdiamondtools-admin-id')?.value;

    if (!userId || !adminId) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = createServerClient();
    const { data: userData, error: fetchError } = await supabase
      .from('ecommerce_cj_users')
      .select('customers')
      .eq('id', adminId)
      .single();

    if (fetchError || !userData) {
      return { success: false, error: 'Failed to fetch user data' };
    }

    const customers = (userData as unknown as { customers: Customer[] }).customers || [];
    const customerIndex = customers.findIndex((c) => c.id === userId);

    if (customerIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    const newAddress: CustomerAddress = {
      ...address,
      id: `addr-${Date.now()}`,
    };

    customers[customerIndex].addresses = [
      ...(customers[customerIndex].addresses || []),
      newAddress,
    ];

    const untypedSupabase = createUntypedClient();
    const { error: updateError } = await untypedSupabase
      .from('ecommerce_cj_users')
      .update({ customers })
      .eq('id', adminId);

    if (updateError) {
      return { success: false, error: 'Failed to add address' };
    }

    return { success: true, address: newAddress };
  } catch (err) {
    console.error('Add address error:', err);
    return { success: false, error: 'An error occurred' };
  }
}

// Remove address
export async function removeUserAddress(addressId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('aresdiamondtools-user-id')?.value;
    const adminId = cookieStore.get('aresdiamondtools-admin-id')?.value;

    if (!userId || !adminId) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = createServerClient();
    const { data: userData, error: fetchError } = await supabase
      .from('ecommerce_cj_users')
      .select('customers')
      .eq('id', adminId)
      .single();

    if (fetchError || !userData) {
      return { success: false, error: 'Failed to fetch user data' };
    }

    const customers = (userData as unknown as { customers: Customer[] }).customers || [];
    const customerIndex = customers.findIndex((c) => c.id === userId);

    if (customerIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    customers[customerIndex].addresses = (customers[customerIndex].addresses || []).filter(
      (addr) => addr.id !== addressId
    );

    const untypedSupabase = createUntypedClient();
    const { error: updateError } = await untypedSupabase
      .from('ecommerce_cj_users')
      .update({ customers })
      .eq('id', adminId);

    if (updateError) {
      return { success: false, error: 'Failed to remove address' };
    }

    return { success: true };
  } catch (err) {
    console.error('Remove address error:', err);
    return { success: false, error: 'An error occurred' };
  }
}

// Get user favorites (product IDs)
export async function getUserFavorites(): Promise<string[]> {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('aresdiamondtools-admin-id')?.value;

    if (!adminId) {
      return [];
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('ecommerce_cj_users')
      .select('favorites')
      .eq('id', adminId)
      .single();

    if (error || !data) {
      return [];
    }

    return (data as unknown as { favorites: string[] }).favorites || [];
  } catch (err) {
    console.error('Get favorites error:', err);
    return [];
  }
}

// Update user favorites
export async function updateUserFavorites(favorites: string[]): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('aresdiamondtools-admin-id')?.value;

    if (!adminId) {
      return { success: false, error: 'Not authenticated' };
    }

    const untypedSupabase = createUntypedClient();
    const { error: updateError } = await untypedSupabase
      .from('ecommerce_cj_users')
      .update({ favorites })
      .eq('id', adminId);

    if (updateError) {
      return { success: false, error: 'Failed to update favorites' };
    }

    return { success: true };
  } catch (err) {
    console.error('Update favorites error:', err);
    return { success: false, error: 'An error occurred' };
  }
}

interface DatabaseProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  rating?: number;
  in_stock?: boolean;
}

// Get products by IDs
export async function getProductsByIds(productIds: string[]): Promise<Product[]> {
  try {
    if (!productIds || productIds.length === 0) {
      return [];
    }

    const cookieStore = await cookies();
    const adminId = cookieStore.get('aresdiamondtools-admin-id')?.value;

    if (!adminId) {
      return [];
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('ecommerce_cj_users')
      .select('products')
      .eq('id', adminId)
      .single();

    if (error || !data) {
      return [];
    }

    const dbProducts = (data as unknown as { products: DatabaseProduct[] }).products || [];
    
    // Map database products to Product interface and filter by IDs
    return dbProducts
      .filter((product) => productIds.includes(product.id))
      .map((dbProduct): Product => ({
        id: dbProduct.id,
        name: dbProduct.name,
        price: dbProduct.price,
        image: dbProduct.image,
        images: dbProduct.images,
        category: dbProduct.category,
        description: dbProduct.description,
        rating: dbProduct.rating,
        inStock: dbProduct.in_stock ?? true,
      }));
  } catch (err) {
    console.error('Get products by IDs error:', err);
    return [];
  }
}

// Refresh user data from database
export async function refreshUserData(): Promise<Customer | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('aresdiamondtools-user-id')?.value;
    const adminId = cookieStore.get('aresdiamondtools-admin-id')?.value;

    if (!userId || !adminId) {
      return null;
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('ecommerce_cj_users')
      .select('customers')
      .eq('id', adminId)
      .single();

    if (error || !data) {
      return null;
    }

    const customers = (data as unknown as { customers: Customer[] }).customers;
    const customer = customers?.find((c) => c.id === userId);

    if (!customer) {
      return null;
    }

    // Return without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...safeCustomer } = customer;
    return safeCustomer as Customer;
  } catch (err) {
    console.error('Refresh user data error:', err);
    return null;
  }
}
