'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, TrendingUp, ShoppingCart, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUserStats, getUserOrders, Order } from '@/lib/actions/user';

export default function DashboardPage() {
  const [stats, setStats] = React.useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    thisMonthSpent: 0,
  });
  const [recentOrders, setRecentOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          getUserStats(),
          getUserOrders(),
        ]);
        setStats(statsData);
        const sortedOrders = ordersData.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRecentOrders(sortedOrders.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statsDisplay = [
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
    },
    {
      title: 'Total Spent',
      value: `$${stats.totalSpent.toFixed(2)}`,
      icon: DollarSign,
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: Package,
    },
    {
      title: 'This Month',
      value: `$${stats.thisMonthSpent.toFixed(2)}`,
      icon: TrendingUp,
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
      case 'shipped':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
      case 'processing':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
      case 'pending':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border p-6 rounded-lg animate-pulse">
              <div className="h-4 bg-muted rounded w-24 mb-4"></div>
              <div className="h-8 bg-muted rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back! Here&apos;s an overview of your account.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsDisplay.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-card border border-border p-6 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-semibold text-foreground mt-2">{stat.value}</p>
                </div>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-card border border-border rounded-lg overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
            <Link href="/dashboard/history" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="divide-y divide-border">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => {
              const primaryItem = order.items[0];
              const additionalCount = order.items.length - 1;
              return (
                <div
                  key={order.id}
                  className="px-6 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage src={primaryItem?.image} alt={primaryItem?.name} />
                        <AvatarFallback className="text-xs font-semibold">
                          {primaryItem?.name?.slice(0, 2).toUpperCase() || 'TC'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">#{order.id}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(order.created_at)} • {order.items.length} items
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {primaryItem?.name || 'Order items'}
                          {additionalCount > 0 && ` + ${additionalCount} more`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="text-sm font-semibold text-foreground">${order.total.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full min-w-20 text-center font-medium ${getStatusStyle(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No orders yet</p>
              <Link href="/" className="text-sm text-primary hover:underline mt-2 inline-block">
                Start shopping
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/history">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-card border border-border p-6 hover:border-primary transition-colors cursor-pointer rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Order History</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  View all your orders
                </p>
              </div>
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          </motion.div>
        </Link>

        <Link href="/">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            className="bg-card border border-border p-6 hover:border-primary transition-colors cursor-pointer rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Continue Shopping</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Browse our collection
                </p>
              </div>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
