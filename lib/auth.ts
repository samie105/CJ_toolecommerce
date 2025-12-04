import { supabase } from './supabase';

const ADMIN_SESSION_KEY = 'ecommerce_cj_admin_session';

export interface AdminData {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar: string | null;
  role: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminSession {
  admin: AdminData;
  token: string;
  expiresAt: number;
}

export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; admin?: AdminData; error?: string }> {
  try {
    console.log('=== LOGIN DEBUG ===');
    console.log('Input email:', email);
    console.log('Input password:', password);
    console.log('Input email length:', email.length);
    console.log('Input password length:', password.length);
    
    // Use ilike for case-insensitive email matching
    const { data, error } = await supabase
      .from('ecommerce_cj_admins')
      .select('*')
      .ilike('email', email)
      .eq('is_active', true)
      .single();

    console.log('Supabase response - data:', data);
    console.log('Supabase response - error:', error);

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { success: false, error: 'Invalid email or password' };
    }
    
    if (!data) {
      console.log('No data returned from query');
      return { success: false, error: 'Invalid email or password' };
    }

    const admin = data as unknown as AdminData;
    
    console.log('Admin from DB - email:', admin.email);
    console.log('Admin from DB - password:', admin.password);
    console.log('Admin from DB - password length:', admin.password?.length);
    console.log('Password comparison:', admin.password === password);
    console.log('Password char codes (input):', [...password].map(c => c.charCodeAt(0)));
    console.log('Password char codes (db):', [...(admin.password || '')].map(c => c.charCodeAt(0)));
    
    // Direct password comparison (no hashing)
    if (admin.password !== password) {
      console.log('Password mismatch!');
      return { success: false, error: 'Invalid email or password' };
    }

    // Create session
    const session: AdminSession = {
      admin,
      token: crypto.randomUUID(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    }

    return { success: true, admin };
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, error: 'An error occurred during login' };
  }
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  
  const sessionData = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!sessionData) return null;

  try {
    const session: AdminSession = JSON.parse(sessionData);
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
}

export function logoutAdmin(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null;
}
