'use server';

import { createClient } from '@supabase/supabase-js';
import type { PaymentSettings, CryptoWallet, BankDetails, P2PPayment, SquarePayment } from '@/lib/database.types';

// Create an untyped Supabase client for flexible queries
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Fixed admin ID - in production this would be dynamic based on the store
const ADMIN_ID = 'e434ad85-575d-4165-93c6-d7b4219d92f1';

export interface EnabledPaymentMethods {
  cryptoWallets: CryptoWallet[];
  bankDetails: BankDetails | null;
  p2pPayments: P2PPayment[];
  squarePayments: SquarePayment[];
  hasPaymentMethods: boolean;
}

export async function getEnabledPaymentMethods(): Promise<EnabledPaymentMethods> {
  try {
    const { data, error } = await supabase
      .from('ecommerce_cj_admins')
      .select('payment_settings')
      .eq('id', ADMIN_ID)
      .single();

    if (error) {
      console.error('Error fetching payment methods:', error);
      return {
        cryptoWallets: [],
        bankDetails: null,
        p2pPayments: [],
        squarePayments: [],
        hasPaymentMethods: false,
      };
    }

    const settings = data?.payment_settings as PaymentSettings | null;

    if (!settings) {
      return {
        cryptoWallets: [],
        bankDetails: null,
        p2pPayments: [],
        squarePayments: [],
        hasPaymentMethods: false,
      };
    }

    // Filter only enabled payment methods
    const enabledCrypto = (settings.crypto_wallets || []).filter(w => w.enabled && w.address);
    const enabledP2P = (settings.p2p_payments || []).filter(p => p.enabled && p.username);
    const enabledSquare = (settings.square_payments || []).filter(s => s.enabled && s.username);
    const bankEnabled = settings.bank_details?.enabled && settings.bank_details?.accountNumber;

    return {
      cryptoWallets: enabledCrypto,
      bankDetails: bankEnabled ? settings.bank_details : null,
      p2pPayments: enabledP2P,
      squarePayments: enabledSquare,
      hasPaymentMethods: enabledCrypto.length > 0 || enabledP2P.length > 0 || enabledSquare.length > 0 || !!bankEnabled,
    };
  } catch (error) {
    console.error('Error in getEnabledPaymentMethods:', error);
    return {
      cryptoWallets: [],
      bankDetails: null,
      p2pPayments: [],
      squarePayments: [],
      hasPaymentMethods: false,
    };
  }
}

export async function savePaymentSettings(
  adminId: string,
  settings: PaymentSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('ecommerce_cj_admins')
      .update({ payment_settings: settings })
      .eq('id', adminId);

    if (error) {
      console.error('Error saving payment settings:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in savePaymentSettings:', error);
    return { success: false, error: 'Failed to save payment settings' };
  }
}
