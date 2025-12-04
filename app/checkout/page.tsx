'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Truck, ShieldCheck, Check, Loader2, Copy, Building2, Wallet, Smartphone, Square, Upload, X, ArrowRight, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/components/cart-context';
import { useAuth } from '@/components/auth-context';
import { createOrder } from '@/lib/actions/orders';
import { getEnabledPaymentMethods, EnabledPaymentMethods } from '@/lib/actions/payments';
import { toast } from 'sonner';

type PaymentCategory = 'crypto' | 'bank' | 'p2p' | 'square';
type CheckoutStep = 'details' | 'payment-proof';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingPayments, setIsLoadingPayments] = React.useState(true);
  const [checkoutStep, setCheckoutStep] = React.useState<CheckoutStep>('details');
  const [selectedPaymentCategory, setSelectedPaymentCategory] = React.useState<PaymentCategory | null>(null);
  const [selectedCryptoId, setSelectedCryptoId] = React.useState<string | null>(null);
  const [selectedP2PId, setSelectedP2PId] = React.useState<string | null>(null);
  const [selectedSquareId, setSelectedSquareId] = React.useState<string | null>(null);
  const [adminPayments, setAdminPayments] = React.useState<EnabledPaymentMethods | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = React.useState<string | null>(null);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [shippingAddress, setShippingAddress] = React.useState({
    state: '',
    country: '',
  });



  // Fetch admin payment methods
  React.useEffect(() => {
    const fetchPayments = async () => {
      try {
        const payments = await getEnabledPaymentMethods();
        setAdminPayments(payments);
        // If admin has crypto or bank set up, default to that
        // Set default payment category based on available methods
        if (payments.cryptoWallets.length > 0) {
          setSelectedPaymentCategory('crypto');
          setSelectedCryptoId(payments.cryptoWallets[0].id);
        } else if (payments.bankDetails) {
          setSelectedPaymentCategory('bank');
        } else if (payments.p2pPayments.length > 0) {
          setSelectedPaymentCategory('p2p');
          setSelectedP2PId(payments.p2pPayments[0].id);
        } else if (payments.squarePayments.length > 0) {
          setSelectedPaymentCategory('square');
          setSelectedSquareId(payments.squarePayments[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
      } finally {
        setIsLoadingPayments(false);
      }
    };
    fetchPayments();
  }, []);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Handle file upload for payment screenshot
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploadingScreenshot(true);
    try {
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshot(reader.result as string);
        setIsUploadingScreenshot(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Failed to upload screenshot');
      setIsUploadingScreenshot(false);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shippingAddress.state || !shippingAddress.country) {
      toast.error('Please fill in state and country');
      return;
    }

    if (!selectedPaymentCategory) {
      toast.error('Please select a payment method');
      return;
    }

    // Check if a specific payment method is selected
    if (selectedPaymentCategory === 'crypto' && !selectedCryptoId) {
      toast.error('Please select a cryptocurrency');
      return;
    }
    if (selectedPaymentCategory === 'p2p' && !selectedP2PId) {
      toast.error('Please select a P2P payment method');
      return;
    }
    if (selectedPaymentCategory === 'square' && !selectedSquareId) {
      toast.error('Please select a SQUARE payment method');
      return;
    }

    setCheckoutStep('payment-proof');
  };

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('toolcraft-auth');
      if (authStatus !== 'true') {
        router.push('/login?redirect=/checkout');
      }
    }
  }, [isAuthenticated, router]);

  // Redirect if cart is empty
  React.useEffect(() => {
    if (items.length === 0) {
      router.push('/');
    }
  }, [items, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentScreenshot) {
      toast.error('Please upload a payment screenshot');
      return;
    }

    // Determine payment method string based on selection
    let paymentMethodStr = 'Bank Transfer';
    if (selectedPaymentCategory === 'crypto' && selectedCryptoId) {
      const crypto = adminPayments?.cryptoWallets.find(w => w.id === selectedCryptoId);
      paymentMethodStr = `Cryptocurrency (${crypto?.name || 'Crypto'})`;
    } else if (selectedPaymentCategory === 'bank') {
      paymentMethodStr = 'Bank Transfer';
    } else if (selectedPaymentCategory === 'p2p' && selectedP2PId) {
      const p2p = adminPayments?.p2pPayments.find(p => p.id === selectedP2PId);
      paymentMethodStr = `${p2p?.name || 'P2P Payment'}`;
    } else if (selectedPaymentCategory === 'square' && selectedSquareId) {
      const square = adminPayments?.squarePayments.find(s => s.id === selectedSquareId);
      paymentMethodStr = `SQUARE - ${square?.name || 'Square Payment'}`;
    }

    setIsLoading(true);

    try {
      const result = await createOrder({
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod: paymentMethodStr,
        paymentScreenshot,
      });

      if (result.success && result.order) {
        clearCart();
        toast.success('Order placed successfully!');
        router.push(`/checkout/success?orderId=${result.order.id}`);
      } else {
        toast.error(result.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">T</span>
              </div>
              <span className="font-semibold text-foreground">ToolCraft</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Form */}
          {checkoutStep === 'details' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <form onSubmit={handleNextStep} className="space-y-8">
              {/* Shipping Address */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">Shipping Address</h2>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State / Region</Label>
                      <Input
                        id="state"
                        placeholder="e.g. California, Lagos"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        placeholder="e.g. United States, Nigeria"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        className="h-11"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">Payment Method</h2>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                  {isLoadingPayments ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-12 bg-muted rounded-lg"></div>
                      <div className="h-12 bg-muted rounded-lg"></div>
                    </div>
                  ) : (
                    <>
                      {/* Payment Category Selection */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Crypto Payments (if available) */}
                        {adminPayments && adminPayments.cryptoWallets.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentCategory('crypto')}
                            className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                              selectedPaymentCategory === 'crypto'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <Wallet className={`h-5 w-5 ${selectedPaymentCategory === 'crypto' ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className={`text-sm font-medium ${selectedPaymentCategory === 'crypto' ? 'text-primary' : 'text-foreground'}`}>
                              Cryptocurrency
                            </span>
                            {selectedPaymentCategory === 'crypto' && (
                              <Check className="h-4 w-4 text-primary ml-auto" />
                            )}
                          </button>
                        )}

                        {/* Bank Transfer (if available) */}
                        {adminPayments && adminPayments.bankDetails && (
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentCategory('bank')}
                            className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                              selectedPaymentCategory === 'bank'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <Building2 className={`h-5 w-5 ${selectedPaymentCategory === 'bank' ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className={`text-sm font-medium ${selectedPaymentCategory === 'bank' ? 'text-primary' : 'text-foreground'}`}>
                              Bank Transfer
                            </span>
                            {selectedPaymentCategory === 'bank' && (
                              <Check className="h-4 w-4 text-primary ml-auto" />
                            )}
                          </button>
                        )}

                        {/* P2P Payments (if available) */}
                        {adminPayments && adminPayments.p2pPayments.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentCategory('p2p')}
                            className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                              selectedPaymentCategory === 'p2p'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <Smartphone className={`h-5 w-5 ${selectedPaymentCategory === 'p2p' ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className={`text-sm font-medium ${selectedPaymentCategory === 'p2p' ? 'text-primary' : 'text-foreground'}`}>
                              P2P Payment
                            </span>
                            {selectedPaymentCategory === 'p2p' && (
                              <Check className="h-4 w-4 text-primary ml-auto" />
                            )}
                          </button>
                        )}

                        {/* SQUARE Payments (if available) */}
                        {adminPayments && adminPayments.squarePayments.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentCategory('square')}
                            className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                              selectedPaymentCategory === 'square'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <Square className={`h-5 w-5 ${selectedPaymentCategory === 'square' ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className={`text-sm font-medium ${selectedPaymentCategory === 'square' ? 'text-primary' : 'text-foreground'}`}>
                              SQUARE Payment
                            </span>
                            {selectedPaymentCategory === 'square' && (
                              <Check className="h-4 w-4 text-primary ml-auto" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Payment Details */}
                      <AnimatePresence mode="wait">
                        {/* Crypto Payment Options */}
                        {selectedPaymentCategory === 'crypto' && adminPayments && (
                          <motion.div
                            key="crypto"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-4"
                          >
                            <p className="text-sm text-muted-foreground">Select a cryptocurrency to pay with:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {adminPayments.cryptoWallets.map((wallet) => (
                                <button
                                  key={wallet.id}
                                  type="button"
                                  onClick={() => setSelectedCryptoId(wallet.id)}
                                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                    selectedCryptoId === wallet.id
                                      ? 'border-orange-400 bg-orange-50'
                                      : 'border-border hover:border-orange-200'
                                  }`}
                                >
                                  <Image
                                    src={wallet.image}
                                    alt={wallet.name}
                                    width={24}
                                    height={24}
                                    className="w-6 h-6"
                                  />
                                  <span className="text-sm font-medium">{wallet.symbol}</span>
                                  {selectedCryptoId === wallet.id && (
                                    <Check className="h-4 w-4 text-orange-500 ml-auto" />
                                  )}
                                </button>
                              ))}
                            </div>
                            
                            {selectedCryptoId && (
                              <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                <p className="text-sm font-medium text-orange-900 mb-2">
                                  Send ${total.toFixed(2)} worth of {adminPayments.cryptoWallets.find(w => w.id === selectedCryptoId)?.symbol} to:
                                </p>
                                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-orange-200">
                                  <code className="text-xs text-zinc-700 flex-1 break-all font-mono">
                                    {adminPayments.cryptoWallets.find(w => w.id === selectedCryptoId)?.address}
                                  </code>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const addr = adminPayments.cryptoWallets.find(w => w.id === selectedCryptoId)?.address;
                                      if (addr) {
                                        navigator.clipboard.writeText(addr);
                                        toast.success('Address copied!');
                                      }
                                    }}
                                    className="p-2 hover:bg-orange-50 rounded-lg transition-colors shrink-0"
                                  >
                                    <Copy className="w-4 h-4 text-orange-600" />
                                  </button>
                                </div>
                                <p className="text-xs text-orange-700 mt-2">
                                  After payment, click &quot;Place Order&quot;. Your order will be confirmed once we verify the transaction.
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* Bank Transfer Details */}
                        {selectedPaymentCategory === 'bank' && adminPayments?.bankDetails && (
                          <motion.div
                            key="bank"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-4"
                          >
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                              <p className="text-sm font-medium text-blue-900 mb-3">
                                Transfer ${total.toFixed(2)} to:
                              </p>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                  <span className="text-sm text-blue-700">Bank Name</span>
                                  <span className="text-sm font-medium text-blue-900">{adminPayments.bankDetails.bankName}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                  <span className="text-sm text-blue-700">Account Name</span>
                                  <span className="text-sm font-medium text-blue-900">{adminPayments.bankDetails.accountName}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                  <span className="text-sm text-blue-700">Account Number</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-blue-900 font-mono">{adminPayments.bankDetails.accountNumber}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(adminPayments.bankDetails!.accountNumber);
                                        toast.success('Account number copied!');
                                      }}
                                      className="p-1 hover:bg-blue-100 rounded transition-colors"
                                    >
                                      <Copy className="w-3.5 h-3.5 text-blue-600" />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                  <span className="text-sm text-blue-700">Routing Number</span>
                                  <span className="text-sm font-medium text-blue-900 font-mono">{adminPayments.bankDetails.routingNumber}</span>
                                </div>
                              </div>
                              <p className="text-xs text-blue-700 mt-3">
                                After transferring, click &quot;Place Order&quot;. Your order will be confirmed once we verify the payment.
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {/* P2P Payment Options */}
                        {selectedPaymentCategory === 'p2p' && adminPayments && (
                          <motion.div
                            key="p2p"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-4"
                          >
                            <p className="text-sm text-muted-foreground">Select a payment app:</p>
                            <div className="grid grid-cols-2 gap-3">
                              {adminPayments.p2pPayments.map((p2p) => (
                                <button
                                  key={p2p.id}
                                  type="button"
                                  onClick={() => setSelectedP2PId(p2p.id)}
                                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                    selectedP2PId === p2p.id
                                      ? 'border-emerald-400 bg-emerald-50'
                                      : 'border-border hover:border-emerald-200'
                                  }`}
                                >
                                  <Image
                                    src={p2p.image}
                                    alt={p2p.name}
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-lg object-contain"
                                  />
                                  <span className="text-sm font-medium">{p2p.name}</span>
                                  {selectedP2PId === p2p.id && (
                                    <Check className="h-4 w-4 text-emerald-500 ml-auto" />
                                  )}
                                </button>
                              ))}
                            </div>
                            
                            {selectedP2PId && (
                              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                                <p className="text-sm font-medium text-emerald-900 mb-2">
                                  Send ${total.toFixed(2)} via {adminPayments.p2pPayments.find(p => p.id === selectedP2PId)?.name} to:
                                </p>
                                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-emerald-200">
                                  <span className="text-sm font-medium text-zinc-900">
                                    @{adminPayments.p2pPayments.find(p => p.id === selectedP2PId)?.username}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const username = adminPayments.p2pPayments.find(p => p.id === selectedP2PId)?.username;
                                      if (username) {
                                        navigator.clipboard.writeText(username);
                                        toast.success('Username copied!');
                                      }
                                    }}
                                    className="p-2 hover:bg-emerald-50 rounded-lg transition-colors ml-auto"
                                  >
                                    <Copy className="w-4 h-4 text-emerald-600" />
                                  </button>
                                </div>
                                <p className="text-xs text-emerald-700 mt-2">
                                  After payment, click &quot;Place Order&quot;. Your order will be confirmed once we verify the transaction.
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* SQUARE Payment Options */}
                        {selectedPaymentCategory === 'square' && adminPayments && (
                          <motion.div
                            key="square"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-4"
                          >
                            <p className="text-sm text-muted-foreground">Select a SQUARE payment method:</p>
                            <div className="grid grid-cols-2 gap-3">
                              {adminPayments.squarePayments.map((square) => (
                                <button
                                  key={square.id}
                                  type="button"
                                  onClick={() => setSelectedSquareId(square.id)}
                                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                    selectedSquareId === square.id
                                      ? 'border-purple-400 bg-purple-50'
                                      : 'border-border hover:border-purple-200'
                                  }`}
                                >
                                  <Image
                                    src={square.image}
                                    alt={square.name}
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-lg object-contain"
                                  />
                                  <span className="text-sm font-medium">{square.name}</span>
                                  {selectedSquareId === square.id && (
                                    <Check className="h-4 w-4 text-purple-500 ml-auto" />
                                  )}
                                </button>
                              ))}
                            </div>
                            
                            {selectedSquareId && (
                              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                <p className="text-sm font-medium text-purple-900 mb-2">
                                  Pay ${total.toFixed(2)} via {adminPayments.squarePayments.find(s => s.id === selectedSquareId)?.name} to:
                                </p>
                                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-purple-200">
                                  <span className="text-sm font-medium text-zinc-900">
                                    {adminPayments.squarePayments.find(s => s.id === selectedSquareId)?.username}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const username = adminPayments.squarePayments.find(s => s.id === selectedSquareId)?.username;
                                      if (username) {
                                        navigator.clipboard.writeText(username);
                                        toast.success('Account copied!');
                                      }
                                    }}
                                    className="p-2 hover:bg-purple-50 rounded-lg transition-colors ml-auto"
                                  >
                                    <Copy className="w-4 h-4 text-purple-600" />
                                  </button>
                                </div>
                                <p className="text-xs text-purple-700 mt-2">
                                  After payment, click &quot;Next&quot; to upload payment proof.
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold gap-2"
                disabled={isLoading || !selectedPaymentCategory}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}

        {/* Step 2: Payment Proof Upload */}
        {checkoutStep === 'payment-proof' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="space-y-8">
              {/* Step Indicator */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCheckoutStep('details')}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                      2
                    </div>
                    <span className="font-medium">Upload Payment Proof</span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4">Payment Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount to Pay</span>
                    <span className="font-bold text-lg text-primary">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium">
                      {selectedPaymentCategory === 'crypto' && selectedCryptoId && 
                        adminPayments?.cryptoWallets.find(w => w.id === selectedCryptoId)?.name}
                      {selectedPaymentCategory === 'bank' && 'Bank Transfer'}
                      {selectedPaymentCategory === 'p2p' && selectedP2PId && 
                        adminPayments?.p2pPayments.find(p => p.id === selectedP2PId)?.name}
                      {selectedPaymentCategory === 'square' && selectedSquareId && 
                        `SQUARE - ${adminPayments?.squarePayments.find(s => s.id === selectedSquareId)?.name}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Screenshot Upload */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Upload Payment Screenshot</h3>
                    <p className="text-sm text-muted-foreground">Upload proof of your payment for verification</p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="hidden"
                />

                {paymentScreenshot ? (
                  <div className="relative">
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                      <Image
                        src={paymentScreenshot}
                        alt="Payment Screenshot"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => setPaymentScreenshot(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingScreenshot}
                    className="w-full border-2 border-dashed border-border rounded-xl p-8 hover:border-primary/50 transition-colors text-center"
                  >
                    {isUploadingScreenshot ? (
                      <Loader2 className="h-8 w-8 mx-auto text-muted-foreground animate-spin" />
                    ) : (
                      <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                    )}
                    <p className="text-sm font-medium mb-1">Click to upload screenshot</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                  </button>
                )}
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handleSubmit}
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading || !paymentScreenshot}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Place Order • $${total.toFixed(2)}`
                )}
              </Button>
            </div>
          </motion.div>
        )}

          {/* Right Column - Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-medium">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                    </div>
                    <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? <span className="text-primary">Free</span> : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Free shipping on orders over $100</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
