'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Package, Users, ShoppingBag, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
}

function StatCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-muted rounded-xl" />
        <div className="w-16 h-5 bg-muted rounded" />
      </div>
      <div className="w-24 h-8 bg-muted rounded mb-2" />
      <div className="w-32 h-4 bg-muted rounded" />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <div className="px-6 py-4 flex items-center justify-between animate-pulse">
      <div>
        <div className="w-20 h-4 bg-muted rounded mb-2" />
        <div className="w-28 h-3 bg-muted rounded" />
      </div>
      <div className="text-right">
        <div className="w-16 h-4 bg-muted rounded mb-2" />
        <div className="w-20 h-3 bg-muted rounded" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = React.useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data: users, error } = await supabase
          .from('ecommerce_cj_users')
          .select('*');

        if (error) throw error;

        let totalRevenue = 0;
        let totalOrders = 0;
        let totalProducts = 0;
        const allOrders: RecentOrder[] = [];

        interface UserData {
          first_name: string;
          last_name: string;
          orders: Array<{ id: string; total: number; status: string; date: string }>;
          products: Array<unknown>;
        }

        (users as unknown as UserData[])?.forEach((user) => {
          const orders = user.orders || [];
          const products = user.products || [];

          totalOrders += orders.length;
          totalProducts += products.length;

          orders.forEach((order) => {
            totalRevenue += order.total || 0;
            allOrders.push({
              id: order.id,
              customer: `${user.first_name} ${user.last_name}`,
              amount: order.total || 0,
              status: order.status || 'pending',
              date: order.date,
            });
          });
        });

        setStats({
          totalRevenue,
          totalOrders,
          totalUsers: users?.length || 0,
          totalProducts,
        });

        const sortedOrders = allOrders
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        setRecentOrders(sortedOrders);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Revenue',
      value: stats ? `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
      change: '+20.1% from last month',
      icon: DollarSign,
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders.toString() || '0',
      change: '+15% from last month',
      icon: Package,
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers.toString() || '0',
      change: '+180 new this month',
      icon: Users,
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts.toString() || '0',
      change: 'Active listings',
      icon: ShoppingBag,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700';
      case 'in_transit':
        return 'bg-blue-100 text-blue-700';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s an overview of your store.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                      <TrendingUp className="h-4 w-4" />
                      <span>+12%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{stat.title}</p>
                    <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
                  </div>
                </motion.div>
              );
            })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
              <Link
                href="/admin/orders"
                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="px-6 py-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{order.id}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        ${order.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>No orders yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link
              href="/admin/products"
              className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-secondary/50 hover:border-primary/30 transition-all group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Add New Product</p>
                <p className="text-sm text-muted-foreground">Create a new product listing</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-secondary/50 hover:border-primary/30 transition-all group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Manage Orders</p>
                <p className="text-sm text-muted-foreground">View and update order status</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </Link>

            <Link
              href="/admin/payments"
              className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-secondary/50 hover:border-primary/30 transition-all group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Payment Settings</p>
                <p className="text-sm text-muted-foreground">Configure payment methods</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
