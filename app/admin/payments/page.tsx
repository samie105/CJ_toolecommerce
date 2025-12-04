'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2,
  Smartphone,
  Save,
  Loader2,
  Check,
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Wallet,
  CreditCard,
  Square,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/components/admin-context';
import type { 
  CryptoWallet, 
  BankDetails, 
  P2PPayment,
  SquarePayment,
  PaymentSettings
} from '@/lib/database.types';

const DEFAULT_CRYPTO_WALLETS: CryptoWallet[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    address: '',
    image: '/crypto/BTC.svg',
    enabled: false,
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    address: '',
    image: '/crypto/ETH.svg',
    enabled: false,
  },
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    address: '',
    image: '/crypto/USDT.svg',
    enabled: false,
  },
  {
    id: 'ltc',
    name: 'Litecoin',
    symbol: 'LTC',
    address: '',
    image: '/crypto/LTC.svg',
    enabled: false,
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    address: '',
    image: '/crypto/SOL.svg',
    enabled: false,
  },
  {
    id: 'doge',
    name: 'Dogecoin',
    symbol: 'DOGE',
    address: '',
    image: '/crypto/DOGE.svg',
    enabled: false,
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    address: '',
    image: '/crypto/USDC.svg',
    enabled: false,
  },
  {
    id: 'xrp',
    name: 'Ripple',
    symbol: 'XPR',
    address: '',
    image: '/crypto/XPR.svg',
    enabled: false,
  },
];

const DEFAULT_P2P_PAYMENTS: P2PPayment[] = [
  {
    id: 'venmo',
    name: 'Venmo',
    username: '',
    image: '/digital-assets/venmo.png',
    enabled: false,
  },
  {
    id: 'cashapp',
    name: 'Cash App',
    username: '',
    image: '/digital-assets/cashapp.webp',
    enabled: false,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    username: '',
    image: '/digital-assets/paypal.jpg',
    enabled: false,
  },
  {
    id: 'zelle',
    name: 'Zelle',
    username: '',
    image: '/digital-assets/zelle.png',
    enabled: false,
  },
];

const DEFAULT_SQUARE_PAYMENTS: SquarePayment[] = [
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    username: '',
    image: '/digital-assets/apple-pay.png',
    enabled: false,
  },
  {
    id: 'steam_card',
    name: 'Steam Card',
    username: '',
    image: '/digital-assets/steam.png',
    enabled: false,
  },
  {
    id: 'razer_gold',
    name: 'Razer Gold Card',
    username: '',
    image: '/digital-assets/razer-gold.png',
    enabled: false,
  },
  {
    id: 'amazon',
    name: 'Amazon',
    username: '',
    image: '/digital-assets/amazon.png',
    enabled: false,
  },
];

const DEFAULT_BANK_DETAILS: BankDetails = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  routingNumber: '',
  swiftCode: '',
  iban: '',
  enabled: false,
};

function PaymentSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="bg-white border border-border rounded-xl p-6 animate-pulse">
          <div className="w-48 h-6 bg-zinc-100 rounded mb-6" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-zinc-50 rounded-xl border border-border" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminPaymentsPage() {
  const { admin } = useAdmin();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  // State for payment methods
  const [cryptoWallets, setCryptoWallets] = React.useState<CryptoWallet[]>(DEFAULT_CRYPTO_WALLETS);
  const [bankDetails, setBankDetails] = React.useState<BankDetails>(DEFAULT_BANK_DETAILS);
  const [p2pPayments, setP2pPayments] = React.useState<P2PPayment[]>(DEFAULT_P2P_PAYMENTS);
  const [squarePayments, setSquarePayments] = React.useState<SquarePayment[]>(DEFAULT_SQUARE_PAYMENTS);

  // Dialog states
  const [editingCrypto, setEditingCrypto] = React.useState<CryptoWallet | null>(null);
  const [editingP2P, setEditingP2P] = React.useState<P2PPayment | null>(null);
  const [editingSquare, setEditingSquare] = React.useState<SquarePayment | null>(null);
  const [isBankDialogOpen, setIsBankDialogOpen] = React.useState(false);
  
  // Form states
  const [cryptoForm, setCryptoForm] = React.useState({ address: '' });
  const [p2pForm, setP2pForm] = React.useState({ username: '' });
  const [squareForm, setSquareForm] = React.useState({ username: '' });
  const [bankForm, setBankForm] = React.useState<BankDetails>(DEFAULT_BANK_DETAILS);
  
  // Visibility states
  const [showAccountNumber, setShowAccountNumber] = React.useState(false);

  // Load payment settings from database
  React.useEffect(() => {
    const loadPaymentSettings = async () => {
      if (!admin?.id) return;
      
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('ecommerce_cj_admins')
          .select('payment_settings')
          .eq('id', admin.id)
          .single();

        if (error) throw error;

        if (data?.payment_settings) {
          const settings = data.payment_settings as PaymentSettings;
          
          // Merge saved wallets with defaults (to keep images and new coins)
          if (settings.crypto_wallets?.length > 0) {
            const mergedWallets = DEFAULT_CRYPTO_WALLETS.map(defaultWallet => {
              const savedWallet = settings.crypto_wallets.find(w => w.id === defaultWallet.id);
              return savedWallet ? { ...defaultWallet, ...savedWallet, image: defaultWallet.image } : defaultWallet;
            });
            setCryptoWallets(mergedWallets);
          }
          
          if (settings.bank_details) {
            setBankDetails(settings.bank_details);
          }
          
          // Merge saved P2P with defaults
          if (settings.p2p_payments?.length > 0) {
            const mergedP2P = DEFAULT_P2P_PAYMENTS.map(defaultP2P => {
              const savedP2P = settings.p2p_payments.find(p => p.id === defaultP2P.id);
              return savedP2P ? { ...defaultP2P, ...savedP2P, image: defaultP2P.image } : defaultP2P;
            });
            setP2pPayments(mergedP2P);
          }
          
          // Merge saved Square Payments with defaults
          if (settings.square_payments && settings.square_payments.length > 0) {
            const mergedSquare = DEFAULT_SQUARE_PAYMENTS.map(defaultSquare => {
              const savedSquare = settings.square_payments?.find(s => s.id === defaultSquare.id);
              return savedSquare ? { ...defaultSquare, ...savedSquare, image: defaultSquare.image } : defaultSquare;
            });
            setSquarePayments(mergedSquare);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load payment settings:', error);
        toast.error('Failed to load payment settings');
        setIsLoading(false);
      }
    };

    loadPaymentSettings();
  }, [admin?.id]);

  // Save payment settings to database
  const saveToDatabase = async (
    newCryptoWallets?: CryptoWallet[],
    newBankDetails?: BankDetails,
    newP2pPayments?: P2PPayment[],
    newSquarePayments?: SquarePayment[]
  ) => {
    if (!admin?.id) return;

    const paymentSettings: PaymentSettings = {
      crypto_wallets: newCryptoWallets || cryptoWallets,
      bank_details: newBankDetails || bankDetails,
      p2p_payments: newP2pPayments || p2pPayments,
      square_payments: newSquarePayments || squarePayments,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('ecommerce_cj_admins')
      .update({ payment_settings: paymentSettings })
      .eq('id', admin.id);

    if (error) throw error;
  };

  // Handle crypto wallet update
  const handleCryptoUpdate = async () => {
    if (!editingCrypto) return;

    setIsSaving(true);
    try {
      const updatedWallets = cryptoWallets.map(w =>
        w.id === editingCrypto.id
          ? { ...w, address: cryptoForm.address, enabled: !!cryptoForm.address }
          : w
      );
      
      await saveToDatabase(updatedWallets, undefined, undefined);
      setCryptoWallets(updatedWallets);
      
      toast.success(`${editingCrypto.name} wallet updated`);
      setEditingCrypto(null);
      setCryptoForm({ address: '' });
    } catch {
      toast.error('Failed to update wallet');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle P2P payment update
  const handleP2PUpdate = async () => {
    if (!editingP2P) return;

    setIsSaving(true);
    try {
      const updatedPayments = p2pPayments.map(p =>
        p.id === editingP2P.id
          ? { ...p, username: p2pForm.username, enabled: !!p2pForm.username }
          : p
      );
      
      await saveToDatabase(undefined, undefined, updatedPayments, undefined);
      setP2pPayments(updatedPayments);
      
      toast.success(`${editingP2P.name} updated`);
      setEditingP2P(null);
      setP2pForm({ username: '' });
    } catch {
      toast.error('Failed to update payment method');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Square payment update
  const handleSquareUpdate = async () => {
    if (!editingSquare) return;

    setIsSaving(true);
    try {
      const updatedPayments = squarePayments.map(s =>
        s.id === editingSquare.id
          ? { ...s, username: squareForm.username, enabled: !!squareForm.username }
          : s
      );
      
      await saveToDatabase(undefined, undefined, undefined, updatedPayments);
      setSquarePayments(updatedPayments);
      
      toast.success(`${editingSquare.name} updated`);
      setEditingSquare(null);
      setSquareForm({ username: '' });
    } catch {
      toast.error('Failed to update payment method');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle bank details update
  const handleBankUpdate = async () => {
    setIsSaving(true);
    try {
      const updatedBankDetails = {
        ...bankForm,
        enabled: !!(bankForm.bankName && bankForm.accountNumber),
      };
      
      await saveToDatabase(undefined, updatedBankDetails, undefined);
      setBankDetails(updatedBankDetails);
      
      toast.success('Bank details updated');
      setIsBankDialogOpen(false);
    } catch {
      toast.error('Failed to update bank details');
    } finally {
      setIsSaving(false);
    }
  };

  // Open crypto edit dialog
  const openCryptoEdit = (wallet: CryptoWallet) => {
    setEditingCrypto(wallet);
    setCryptoForm({ address: wallet.address });
  };

  // Open P2P edit dialog
  const openP2PEdit = (payment: P2PPayment) => {
    setEditingP2P(payment);
    setP2pForm({ username: payment.username });
  };

  // Open Square edit dialog
  const openSquareEdit = (payment: SquarePayment) => {
    setEditingSquare(payment);
    setSquareForm({ username: payment.username });
  };

  // Open bank edit dialog
  const openBankEdit = () => {
    setBankForm(bankDetails);
    setIsBankDialogOpen(true);
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Payments</h1>
          <p className="text-zinc-500 mt-1">Configure your payment methods</p>
        </div>
        <PaymentSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Payments</h1>
          <p className="text-zinc-500 mt-1">Configure your accepted payment methods</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Crypto Wallets Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-border rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">Cryptocurrency Wallets</h2>
              <p className="text-sm text-zinc-500">Accept crypto payments</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cryptoWallets.map((wallet, index) => (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`relative p-4 rounded-xl border transition-all cursor-pointer hover:border-orange-300 hover:shadow-sm group ${
                  wallet.enabled
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-border bg-white hover:bg-orange-50/30'
                }`}
                onClick={() => openCryptoEdit(wallet)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center overflow-hidden">
                    <Image
                      src={wallet.image}
                      alt={wallet.name}
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 text-sm">{wallet.name}</h3>
                    <p className="text-xs text-zinc-500">{wallet.symbol}</p>
                  </div>
                  {wallet.enabled && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                
                {wallet.address ? (
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-zinc-600 truncate flex-1 bg-zinc-50 px-2 py-1.5 rounded-lg border border-border">
                      {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                    </code>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(wallet.address, wallet.name);
                      }}
                      className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">Click to add wallet</p>
                )}

                <button className="absolute top-3 right-3 p-1.5 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-transparent hover:border-border">
                  <Pencil className="w-3 h-3 text-zinc-400" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bank Details Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-border rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">Bank Transfer</h2>
              <p className="text-sm text-zinc-500">Accept direct bank transfers</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={openBankEdit}
            className="border-blue-200 hover:bg-blue-50 text-blue-700"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>

        <div className="p-6">
          {bankDetails.enabled ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-xs text-zinc-500 mb-1">Bank Name</p>
                <p className="font-medium text-zinc-900">{bankDetails.bankName}</p>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-xs text-zinc-500 mb-1">Account Name</p>
                <p className="font-medium text-zinc-900">{bankDetails.accountName}</p>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-xs text-zinc-500 mb-1">Account Number</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-zinc-900 font-mono">
                    {showAccountNumber
                      ? bankDetails.accountNumber
                      : '••••' + bankDetails.accountNumber.slice(-4)}
                  </p>
                  <button
                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                    className="p-1 hover:bg-white rounded-lg transition-colors"
                  >
                    {showAccountNumber ? (
                      <EyeOff className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountNumber, 'Account number')}
                    className="p-1 hover:bg-white rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-xs text-zinc-500 mb-1">Routing Number</p>
                <p className="font-medium text-zinc-900 font-mono">{bankDetails.routingNumber}</p>
              </div>
              {bankDetails.swiftCode && (
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="text-xs text-zinc-500 mb-1">SWIFT Code</p>
                  <p className="font-medium text-zinc-900 font-mono">{bankDetails.swiftCode}</p>
                </div>
              )}
              {bankDetails.iban && (
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="text-xs text-zinc-500 mb-1">IBAN</p>
                  <p className="font-medium text-zinc-900 font-mono">{bankDetails.iban}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-zinc-500 mb-4">No bank details configured</p>
              <Button
                variant="outline"
                onClick={openBankEdit}
                className="border-blue-200 hover:bg-blue-50 text-blue-700"
              >
                Add Bank Details
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* P2P Payments Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-border rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-900">P2P Payments</h2>
            <p className="text-sm text-zinc-500">Venmo, Cash App, PayPal, Zelle</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {p2pPayments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className={`relative p-4 rounded-xl border transition-all cursor-pointer hover:border-green-300 hover:shadow-sm group ${
                  payment.enabled
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-border bg-white hover:bg-green-50/30'
                }`}
                onClick={() => openP2PEdit(payment)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white border border-border flex items-center justify-center overflow-hidden">
                    <Image
                      src={payment.image}
                      alt={payment.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900">{payment.name}</h3>
                    {payment.username ? (
                      <p className="text-sm text-zinc-600">@{payment.username}</p>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">Click to add username</p>
                    )}
                  </div>
                  {payment.enabled && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Square Payments Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border border-border rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-gradient-to-r from-purple-50 to-violet-50">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
            <Square className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-900">SQUARE Payments</h2>
            <p className="text-sm text-zinc-500">Apple Pay, Steam Card, Razer Gold, Amazon</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {squarePayments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className={`relative p-4 rounded-xl border transition-all cursor-pointer hover:border-purple-300 hover:shadow-sm group ${
                  payment.enabled
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-border bg-white hover:bg-purple-50/30'
                }`}
                onClick={() => openSquareEdit(payment)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white border border-border flex items-center justify-center overflow-hidden">
                    <Image
                      src={payment.image}
                      alt={payment.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900">{payment.name}</h3>
                    {payment.username ? (
                      <p className="text-sm text-zinc-600">@{payment.username}</p>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">Click to add account</p>
                    )}
                  </div>
                  {payment.enabled && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Crypto Edit Dialog */}
      <Dialog open={!!editingCrypto} onOpenChange={() => setEditingCrypto(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {editingCrypto && (
                <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center overflow-hidden">
                  <Image
                    src={editingCrypto.image}
                    alt={editingCrypto.name}
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                </div>
              )}
              Edit {editingCrypto?.name} Wallet
            </DialogTitle>
            <DialogDescription>
              Enter your {editingCrypto?.symbol} wallet address to receive payments
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <Input
                placeholder={`Enter ${editingCrypto?.symbol} address`}
                value={cryptoForm.address}
                onChange={(e) => setCryptoForm({ ...cryptoForm, address: e.target.value })}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCrypto(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleCryptoUpdate}
              disabled={isSaving}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* P2P Edit Dialog */}
      <Dialog open={!!editingP2P} onOpenChange={() => setEditingP2P(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {editingP2P && (
                <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center overflow-hidden">
                  <Image
                    src={editingP2P.image}
                    alt={editingP2P.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>
              )}
              Edit {editingP2P?.name}
            </DialogTitle>
            <DialogDescription>
              Enter your {editingP2P?.name} username or email
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Username / Email / Phone</Label>
              <Input
                placeholder={`Enter your ${editingP2P?.name} handle`}
                value={p2pForm.username}
                onChange={(e) => setP2pForm({ username: e.target.value })}
              />
              <p className="text-xs text-zinc-500">
                {editingP2P?.id === 'zelle' 
                  ? 'Enter your registered email or phone number'
                  : `Enter your ${editingP2P?.name} username without the @ symbol`
                }
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingP2P(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleP2PUpdate}
              disabled={isSaving}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Square Edit Dialog */}
      <Dialog open={!!editingSquare} onOpenChange={() => setEditingSquare(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {editingSquare && (
                <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center overflow-hidden">
                  <Image
                    src={editingSquare.image}
                    alt={editingSquare.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>
              )}
              Edit {editingSquare?.name}
            </DialogTitle>
            <DialogDescription>
              Enter your {editingSquare?.name} account details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                {editingSquare?.id === 'apple_pay' ? 'Apple ID / Email' : 
                 editingSquare?.id === 'steam_card' ? 'Steam Username / ID' :
                 editingSquare?.id === 'razer_gold' ? 'Razer Gold ID / Email' :
                 'Amazon Email / Username'}
              </Label>
              <Input
                placeholder={`Enter your ${editingSquare?.name} account`}
                value={squareForm.username}
                onChange={(e) => setSquareForm({ username: e.target.value })}
              />
              <p className="text-xs text-zinc-500">
                {editingSquare?.id === 'steam_card' 
                  ? 'Enter your Steam username or gift card redemption info'
                  : editingSquare?.id === 'razer_gold'
                  ? 'Enter your Razer Gold account ID'
                  : `Enter your ${editingSquare?.name} account email or username`
                }
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSquare(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSquareUpdate}
              disabled={isSaving}
              className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
            >
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bank Details Dialog */}
      <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              Bank Transfer Details
            </DialogTitle>
            <DialogDescription>
              Configure your bank account for direct transfers
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Bank Name *</Label>
                <Input
                  placeholder="e.g., Chase, Bank of America"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Holder Name *</Label>
                <Input
                  placeholder="Full name on account"
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Account Number *</Label>
                <Input
                  placeholder="Enter account number"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Routing Number *</Label>
                <Input
                  placeholder="9-digit routing number"
                  value={bankForm.routingNumber}
                  onChange={(e) => setBankForm({ ...bankForm, routingNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>SWIFT Code (International)</Label>
                <Input
                  placeholder="Optional"
                  value={bankForm.swiftCode}
                  onChange={(e) => setBankForm({ ...bankForm, swiftCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>IBAN (International)</Label>
                <Input
                  placeholder="Optional"
                  value={bankForm.iban}
                  onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBankDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleBankUpdate}
              disabled={isSaving || !bankForm.bankName || !bankForm.accountNumber}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Details</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
