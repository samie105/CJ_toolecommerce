'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RefreshCw,
  MapPin,
  CreditCard,
  ShoppingCart,
  Plus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getOrderById, Order } from '@/lib/actions/orders';
import { useCart } from '@/components/cart-context';
import { toast } from 'sonner';

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-teal-100 text-teal-700', icon: CheckCircle2 },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
  { value: 'shipped', label: 'Shipped', color: 'bg-violet-100 text-violet-700', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
];

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600',
  paid: 'bg-emerald-50 text-emerald-600',
  failed: 'bg-red-50 text-red-600',
  refunded: 'bg-zinc-100 text-zinc-600',
};

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const orderId = params.id as string;
  
  const [order, setOrder] = React.useState<Order | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddingToCart, setIsAddingToCart] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await getOrderById(orderId);
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find((s) => s.value === status);
  };

  const handleAddToCart = async (item: Order['items'][0]) => {
    setIsAddingToCart(item.product_id);
    try {
      // Add item to cart (addItem automatically handles quantity increment)
      for (let i = 0; i < item.quantity; i++) {
        addItem({
          id: item.product_id,
          name: item.name,
          price: item.price,
          image: item.image,
          category: 'Reorder',
        });
      }
      toast.success(`${item.name} added to cart`);
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(null);
    }
  };

  const handleReorderAll = () => {
    if (!order) return;
    
    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        addItem({
          id: item.product_id,
          name: item.name,
          price: item.price,
          image: item.image,
          category: 'Reorder',
        });
      }
    });
    toast.success('All items added to cart');
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold text-sm">T</span>
                </div>
                <span className="font-semibold text-foreground">ToolCraft</span>
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t find an order with ID: {orderId}
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo?.icon || Package;

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
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Order Header */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="text-xl font-bold font-mono">{order.id}</p>
                </div>
                <Badge className={`${statusInfo?.color} border-0`}>
                  <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                  {statusInfo?.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p className="font-medium">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Status</p>
                  <Badge className={`${PAYMENT_STATUS_COLORS[order.payment_status]} border-0`}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold">Order Items</h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReorderAll}
                  className="gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Reorder All
                </Button>
              </div>
              <div className="divide-y divide-border">
                {order.items.map((item, index) => (
                  <div key={index} className="p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddToCart(item)}
                        disabled={isAddingToCart === item.product_id}
                      >
                        {isAddingToCart === item.product_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </h2>
              <p className="text-muted-foreground">
                {order.shipping_address.state}, {order.shipping_address.country}
              </p>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-primary">${order.total.toFixed(2)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Payment Method</p>
                <p className="font-medium">{order.payment_method}</p>
              </div>

              <div className="mt-6">
                <Button className="w-full" onClick={handleReorderAll}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Reorder & Checkout
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
