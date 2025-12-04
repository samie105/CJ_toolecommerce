'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package, MapPin, Clock, Search, ChevronDown } from 'lucide-react';
import { getUserOrders, Order } from '@/lib/actions/user';

const defaultProductImage = 'https://images.unsplash.com/photo-1504148453229-78e00b90ed30?auto=format&fit=crop&w=400&q=80&sat=-40';

export default function OrderHistoryPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [expandedOrder, setExpandedOrder] = React.useState<string | null>(null);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await getUserOrders();
        const sortedOrders = ordersData.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setOrders(sortedOrders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (order) => order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'shipped':
        return 'bg-violet-100 text-violet-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'confirmed':
        return 'bg-teal-100 text-teal-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
        </div>
        <div className="h-10 bg-muted rounded"></div>
        <div className="bg-white border border-zinc-200">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-6 py-4 border-b border-zinc-200 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-muted rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-semibold text-zinc-900">Order History</h1>
        <p className="text-sm text-zinc-600 mt-1">
          View all your orders and their details
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search by order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-10 border-zinc-200"
        />
      </motion.div>

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white border border-zinc-200"
      >
        <div className="divide-y divide-zinc-200">
          {filteredOrders.map((order) => {
            const primaryItem = order.items[0];
            const primaryImage = primaryItem?.image ?? defaultProductImage;
            const fallbackInitials = (primaryItem?.name ?? order.id)
              .split(' ')
              .slice(0, 2)
              .map((word) => word.charAt(0))
              .join('')
              .toUpperCase();

            return (
              <div key={order.id}>
                <div
                  className="px-6 py-4 hover:bg-zinc-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 rounded-xl border border-zinc-200 bg-zinc-100">
                        <AvatarImage
                          src={primaryImage}
                          alt={primaryItem?.name ?? 'Order item image'}
                          className="object-cover rounded-xl"
                        />
                        <AvatarFallback className="rounded-xl bg-zinc-100 text-[10px] font-semibold text-zinc-600">
                          {fallbackInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-medium text-zinc-900">#{order.id}</p>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusStyle(order.status)}`}>
                            {formatStatus(order.status)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {formatDate(order.created_at)} • {order.items.length} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="text-sm font-semibold text-zinc-900 hidden sm:block">
                        ${order.total.toFixed(2)}
                      </p>
                      <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200">
                    {/* Delivery Info */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-zinc-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-zinc-900">Order Date</p>
                          <p className="text-xs text-zinc-600 mt-0.5">{formatDate(order.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-zinc-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-zinc-900">Delivery Address</p>
                          <p className="text-xs text-zinc-600 mt-0.5">
                            {order.shipping_address?.street}, {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <p className="text-xs font-medium text-zinc-900 mb-3">Order Items</p>
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between py-2 px-3 bg-white border border-zinc-200"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 rounded-lg border border-zinc-200 bg-zinc-100">
                                <AvatarImage
                                  src={item.image ?? defaultProductImage}
                                  alt={item.name}
                                  className="object-cover rounded-lg"
                                />
                                <AvatarFallback className="rounded-lg bg-zinc-100 text-[10px] font-semibold text-zinc-600">
                                  {item.name
                                    .split(' ')
                                    .slice(0, 2)
                                    .map((word) => word.charAt(0))
                                    .join('')
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm text-zinc-900">{item.name}</p>
                                <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-zinc-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2 pt-3 mt-3 border-t border-zinc-200">
                        <div className="flex justify-between items-center text-xs text-zinc-600">
                          <span>Subtotal</span>
                          <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-zinc-600">
                          <span>Shipping</span>
                          <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-zinc-600">
                          <span>Tax</span>
                          <span>${order.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-zinc-200">
                          <p className="text-sm font-medium text-zinc-900">Total</p>
                          <p className="text-sm font-semibold text-zinc-900">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {filteredOrders.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12 bg-white border border-zinc-200"
        >
          <Package className="h-10 w-10 mx-auto text-zinc-300 mb-3" />
          <p className="text-sm text-zinc-600">
            {searchTerm ? 'No orders found matching your search' : 'No orders yet'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
