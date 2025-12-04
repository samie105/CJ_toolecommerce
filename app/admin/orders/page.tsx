'use client';

import * as React from 'react';
import { useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Package,
  Search,
  MoreHorizontal,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  RefreshCw,
  Calendar,
  User,
  Mail,
  MapPin,
  CreditCard,
  DollarSign,
  ShoppingBag,
  ArrowUpRight,
  Hash,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/components/admin-context';

interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface ShippingAddress {
  state: string;
  country: string;
}

interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  payment_screenshot?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shipping_address?: ShippingAddress;
  created_at: string;
  updated_at: string;
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: CheckCircle2 },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: RefreshCw },
  { value: 'shipped', label: 'Shipped', color: 'bg-violet-100 text-violet-700 border-violet-200', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
];

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  failed: 'bg-red-50 text-red-600 border-red-200',
  refunded: 'bg-zinc-100 text-zinc-600 border-zinc-200',
};

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  { value: 'paid', label: 'Paid', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  { value: 'refunded', label: 'Refunded', color: 'bg-zinc-100 text-zinc-600 border-zinc-200', icon: RefreshCw },
];

function OrderTableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-200 rounded-lg" />
            <div className="flex-1">
              <div className="w-24 h-5 bg-zinc-200 rounded mb-2" />
              <div className="w-40 h-4 bg-zinc-200 rounded" />
            </div>
            <div className="w-20 h-6 bg-zinc-200 rounded-full" />
            <div className="w-24 h-5 bg-zinc-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminOrdersPage() {
  const { admin } = useAdmin();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = React.useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState<string>('');
  const [newPaymentStatus, setNewPaymentStatus] = React.useState<string>('');
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Fetch orders from database
  const fetchOrders = React.useCallback(async () => {
    if (!admin?.id) return;
    
    try {
      setIsLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('ecommerce_cj_users')
        .select('orders')
        .eq('admin_id', admin.id)
        .single();

      if (error) throw error;
      setOrders(data?.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [admin?.id]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Save orders to database
  async function saveOrders(updatedOrders: Order[]) {
    if (!admin?.id) return false;
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('ecommerce_cj_users')
        .update({ orders: updatedOrders })
        .eq('admin_id', admin.id);

      if (error) throw error;
      setOrders(updatedOrders);
      return true;
    } catch (err) {
      console.error('Error saving orders:', err);
      toast.error('Failed to save changes');
      return false;
    }
  }

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    return {
      total: orders.length,
      totalRevenue,
      pendingOrders,
      confirmedOrders,
      processingOrders,
    };
  }, [orders]);

  // Get status info
  function getStatusInfo(status: string) {
    return ORDER_STATUSES.find((s) => s.value === status);
  }

  // Get status badge
  function getStatusBadge(status: string) {
    const statusInfo = getStatusInfo(status);
    if (!statusInfo) return null;
    const Icon = statusInfo.icon;
    return (
      <Badge className={`${statusInfo.color} border hover:${statusInfo.color} gap-1.5 font-medium`}>
        <Icon className="w-3 h-3" />
        {statusInfo.label}
      </Badge>
    );
  }

  // Format date
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Handle status update
  async function handleStatusUpdate() {
    if (!selectedOrder || !newStatus) return;

    setIsUpdating(true);
    const updatedOrders = orders.map((o) =>
      o.id === selectedOrder.id
        ? { ...o, status: newStatus as Order['status'], updated_at: new Date().toISOString() }
        : o
    );
    
    const success = await saveOrders(updatedOrders);
    if (success) {
      toast.success(`Order status updated to ${newStatus}`);
      setIsStatusDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus('');
    }
    setIsUpdating(false);
  }

  // Handle payment status update
  async function handlePaymentStatusUpdate() {
    if (!selectedOrder || !newPaymentStatus) return;

    setIsUpdating(true);
    const updatedOrders = orders.map((o) =>
      o.id === selectedOrder.id
        ? { ...o, payment_status: newPaymentStatus as Order['payment_status'], updated_at: new Date().toISOString() }
        : o
    );
    
    const success = await saveOrders(updatedOrders);
    if (success) {
      toast.success(`Payment status updated to ${newPaymentStatus}`);
      setIsPaymentDialogOpen(false);
      setSelectedOrder(null);
      setNewPaymentStatus('');
    }
    setIsUpdating(false);
  }

  // Open view dialog
  function openViewDialog(order: Order) {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  }

  // Open status dialog
  function openStatusDialog(order: Order) {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusDialogOpen(true);
  }

  // Open payment dialog
  function openPaymentDialog(order: Order) {
    setSelectedOrder(order);
    setNewPaymentStatus(order.payment_status);
    setIsPaymentDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Orders</h1>
          <p className="text-zinc-600 mt-1">Track and manage customer orders</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchOrders}
          className="border-zinc-200"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <div className="p-5 bg-white border border-border rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
          <p className="text-sm text-zinc-500">Total Orders</p>
        </div>
        <div className="p-5 bg-white border border-border rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-zinc-500">Total Revenue</p>
        </div>
        <div className="p-5 bg-white border border-border rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.pendingOrders}</p>
          <p className="text-sm text-zinc-500">Pending</p>
        </div>
        <div className="p-5 bg-white border border-border rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.confirmedOrders}</p>
          <p className="text-sm text-zinc-500">Confirmed</p>
        </div>
        <div className="p-5 bg-white border border-border rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.processingOrders}</p>
          <p className="text-sm text-zinc-500">Processing</p>
        </div>
      </motion.div>

      {/* Status Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-2"
      >
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('all')}
          className={statusFilter === 'all' ? 'bg-zinc-900 hover:bg-zinc-800' : 'border-zinc-200'}
        >
          All Orders
          <Badge variant="secondary" className="ml-2 bg-zinc-100 text-zinc-600">{orders.length}</Badge>
        </Button>
        {ORDER_STATUSES.map((status) => {
          const count = orders.filter((o) => o.status === status.value).length;
          const Icon = status.icon;
          return (
            <Button
              key={status.value}
              variant={statusFilter === status.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status.value)}
              className={statusFilter === status.value ? 'bg-zinc-900 hover:bg-zinc-800' : 'border-zinc-200'}
            >
              <Icon className="w-3.5 h-3.5 mr-1.5" />
              {status.label}
              {count > 0 && (
                <Badge variant="secondary" className="ml-2 bg-zinc-100 text-zinc-600">{count}</Badge>
              )}
            </Button>
          );
        })}
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Search by order ID, customer name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-border"
        />
      </motion.div>

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white border border-border rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900">{filteredOrders.length} Orders</h2>
        </div>

        {isLoading ? (
          <OrderTableSkeleton />
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500 mb-1">No orders found</p>
            <p className="text-sm text-zinc-400">Orders will appear here when customers make purchases</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-5 hover:bg-zinc-50 transition-colors cursor-pointer"
                onClick={() => openViewDialog(order)}
              >
                <div className="flex items-center gap-4">
                  {/* Order Icon/Image */}
                  <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center shrink-0">
                    {order.items[0]?.image ? (
                      <Image
                        src={order.items[0].image}
                        alt=""
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>

                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-zinc-900 flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-zinc-400" />
                        {order.id}
                      </span>
                      {getStatusBadge(order.status)}
                      <Badge className={`${PAYMENT_STATUS_COLORS[order.payment_status]} border font-medium`}>
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </Badge>
                      {order.payment_screenshot && (
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 font-medium">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          Proof
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {order.customer_name}
                      </span>
                      <span className="hidden sm:flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="text-right hidden md:block">
                    <p className="text-lg font-bold text-zinc-900">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500">{order.items.reduce((sum, i) => sum + i.quantity, 0)} items</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const updatedOrders = orders.map((o) =>
                            o.id === order.id ? { ...o, status: 'confirmed' as const, updated_at: new Date().toISOString() } : o
                          );
                          const success = await saveOrders(updatedOrders);
                          if (success) {
                            toast.success('Order confirmed');
                          }
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-white h-8"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Confirm
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openViewDialog(order); }}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openStatusDialog(order); }}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openPaymentDialog(order); }}>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Update Payment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="flex items-center gap-1">
                  <Hash className="w-4 h-4 text-zinc-400" />
                  {selectedOrder?.id}
                </p>
                <p className="text-sm font-normal text-zinc-500">
                  {selectedOrder && formatDateTime(selectedOrder.created_at)}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">Order details</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-6 py-4">
                {/* Status Row */}
                <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl border border-border">
                  <div className="flex-1">
                    <p className="text-sm text-zinc-500 mb-1">Order Status</p>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <button 
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      openPaymentDialog(selectedOrder);
                    }}
                    className="text-right hover:bg-zinc-100 p-2 -m-2 rounded-lg transition-colors"
                  >
                    <p className="text-sm text-zinc-500 mb-1">Payment</p>
                    <Badge className={`${PAYMENT_STATUS_COLORS[selectedOrder.payment_status]} border font-medium`}>
                      {selectedOrder.payment_status.charAt(0).toUpperCase() + selectedOrder.payment_status.slice(1)}
                    </Badge>
                  </button>
                </div>

                {/* Customer Info */}
                <div className="p-4 bg-zinc-50 rounded-xl border border-border">
                  <h4 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-zinc-700">
                      <span className="font-medium">{selectedOrder.customer_name}</span>
                    </p>
                    <p className="flex items-center gap-2 text-zinc-600">
                      <Mail className="w-4 h-4 text-zinc-400" />
                      {selectedOrder.customer_email}
                    </p>
                    {selectedOrder.shipping_address && (
                      <p className="flex items-start gap-2 text-zinc-600">
                        <MapPin className="w-4 h-4 text-zinc-400 mt-0.5" />
                        <span>
                          {selectedOrder.shipping_address.state}, {selectedOrder.shipping_address.country}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-zinc-50 rounded-xl border border-border">
                        <div className="w-14 h-14 bg-white rounded-lg overflow-hidden border border-border shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-zinc-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-zinc-900 truncate">{item.name}</p>
                          <p className="text-sm text-zinc-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                        </div>
                        <p className="font-semibold text-zinc-900">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="p-4 bg-zinc-50 rounded-xl border border-border">
                  <h4 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    {selectedOrder.payment_method && (
                      <div className="flex justify-between text-zinc-600">
                        <span>Payment Method</span>
                        <span className="font-medium">{selectedOrder.payment_method}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Shipping</span>
                      <span>{selectedOrder.shipping === 0 ? 'Free' : `$${selectedOrder.shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Tax</span>
                      <span>${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-border font-semibold text-zinc-900 text-base">
                      <span>Total</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Screenshot */}
                {selectedOrder.payment_screenshot && (
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <h4 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Payment Screenshot
                    </h4>
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-emerald-200 bg-white">
                      <Image
                        src={selectedOrder.payment_screenshot}
                        alt="Payment Screenshot"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-emerald-700">
                        Customer uploaded payment proof
                      </p>
                      {selectedOrder.payment_status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={async () => {
                            const updatedOrders = orders.map((o) =>
                              o.id === selectedOrder.id 
                                ? { ...o, payment_status: 'paid' as const, status: 'confirmed' as const, updated_at: new Date().toISOString() } 
                                : o
                            );
                            const success = await saveOrders(updatedOrders);
                            if (success) {
                              toast.success('Payment confirmed & order confirmed');
                              setSelectedOrder({ ...selectedOrder, payment_status: 'paid', status: 'confirmed' });
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Confirm Payment
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedOrder) openStatusDialog(selectedOrder);
              }}
              className="bg-zinc-900 hover:bg-zinc-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              Update Order Status
            </DialogTitle>
            <DialogDescription>
              Change the status for order #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            {ORDER_STATUSES.map((status) => {
              const Icon = status.icon;
              const isSelected = newStatus === status.value;
              return (
                <button
                  key={status.value}
                  onClick={() => setNewStatus(status.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-50'
                      : 'border-border hover:border-zinc-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-zinc-900">{status.label}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-zinc-900 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={isUpdating || !newStatus || newStatus === selectedOrder?.status}
              className="bg-zinc-900 hover:bg-zinc-800"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Payment Status Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              Update Payment Status
            </DialogTitle>
            <DialogDescription>
              Change the payment status for order #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            {PAYMENT_STATUSES.map((status) => {
              const Icon = status.icon;
              const isSelected = newPaymentStatus === status.value;
              return (
                <button
                  key={status.value}
                  onClick={() => setNewPaymentStatus(status.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-border hover:border-zinc-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-zinc-900">{status.label}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button
              onClick={handlePaymentStatusUpdate}
              disabled={isUpdating || !newPaymentStatus || newPaymentStatus === selectedOrder?.payment_status}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
