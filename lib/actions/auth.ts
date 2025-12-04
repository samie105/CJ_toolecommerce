'use server';

import { createServerClient, createUntypedClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { Customer as DbCustomer, CustomerAddress as DbCustomerAddress } from '@/lib/database.types';

// Re-export types for use in other files
export type Customer = DbCustomer;
export type CustomerAddress = DbCustomerAddress;

interface UserRow {
  id: string;
  customers: Customer[] | null;
}

// Simple hash function for passwords (in production, use bcrypt)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// Login user
export async function loginUser(email: string, password: string): Promise<{
  success: boolean;
  user?: Customer;
  error?: string;
}> {
  try {
    const supabase = createServerClient();
    
    // Fetch the main user with customers
    const { data: users, error } = await supabase
      .from('ecommerce_cj_users')
      .select('id, customers');

    if (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Database error' };
    }

    // Find customer with matching email
    let foundCustomer: Customer | null = null;
    let foundUserId: string | null = null;

    const typedUsers = users as unknown as UserRow[];
    if (typedUsers) {
      for (const user of typedUsers) {
        if (user.customers && Array.isArray(user.customers)) {
          const customer = user.customers.find(
            (c: Customer) => c.email.toLowerCase() === email.toLowerCase()
          );
          if (customer) {
            foundCustomer = customer;
            foundUserId = user.id;
            break;
          }
        }
      }
    }

    if (!foundCustomer) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Check password (simple comparison - in production use bcrypt)
    const hashedPassword = simpleHash(password);
    const customerPassword = foundCustomer.password;
    if (customerPassword && customerPassword !== hashedPassword && customerPassword !== password) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set('toolcraft-user-id', foundCustomer.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    cookieStore.set('toolcraft-admin-id', foundUserId!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Return customer without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...safeCustomer } = foundCustomer;
    return { success: true, user: safeCustomer as Customer };
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, error: 'An error occurred during login' };
  }
}

// Create new account
export async function createAccount(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{
  success: boolean;
  user?: Customer;
  error?: string;
}> {
  try {
    const supabase = createServerClient();

    // Fetch existing customers to check for duplicate email
    const { data: users, error: fetchError } = await supabase
      .from('ecommerce_cj_users')
      .select('id, customers');

    if (fetchError) {
      console.error('Signup error:', fetchError);
      return { success: false, error: 'Database error' };
    }

    // Check if email already exists
    let emailExists = false;
    let mainUserId: string | null = null;
    let existingCustomers: Customer[] = [];

    const typedUsers = users as unknown as UserRow[];
    if (typedUsers) {
      for (const user of typedUsers) {
        mainUserId = user.id;
        if (user.customers && Array.isArray(user.customers)) {
          existingCustomers = user.customers;
          const existing = user.customers.find(
            (c: Customer) => c.email.toLowerCase() === data.email.toLowerCase()
          );
          if (existing) {
            emailExists = true;
          }
        }
      }
    }

    if (emailExists) {
      return { success: false, error: 'Email already registered' };
    }

    if (!mainUserId) {
      return { success: false, error: 'System configuration error' };
    }

    // Create new customer
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      avatar: null,
      status: 'active',
      addresses: [],
      last_name: data.lastName,
      created_at: new Date().toISOString(),
      first_name: data.firstName,
      total_spent: 0,
      orders_count: 0,
      last_order_at: null,
      password: simpleHash(data.password),
    };

    // Add to customers array
    const updatedCustomers = [...existingCustomers, newCustomer];

    // Update database
    const untypedSupabase = createUntypedClient();
    const { error: updateError } = await untypedSupabase
      .from('ecommerce_cj_users')
      .update({ customers: updatedCustomers })
      .eq('id', mainUserId);

    if (updateError) {
      console.error('Signup update error:', updateError);
      return { success: false, error: 'Failed to create account' };
    }

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set('toolcraft-user-id', newCustomer.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set('toolcraft-admin-id', mainUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Return customer without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...safeCustomer } = newCustomer;
    return { success: true, user: safeCustomer as Customer };
  } catch (err) {
    console.error('Signup error:', err);
    return { success: false, error: 'An error occurred during signup' };
  }
}

// Get current logged in user
export async function getCurrentUser(): Promise<Customer | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('toolcraft-user-id')?.value;
    const adminId = cookieStore.get('toolcraft-admin-id')?.value;

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
    console.error('Get current user error:', err);
    return null;
  }
}

// Logout user
export async function logoutUser(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('toolcraft-user-id');
    cookieStore.delete('toolcraft-admin-id');
    return { success: true };
  } catch (err) {
    console.error('Logout error:', err);
    return { success: false };
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}
