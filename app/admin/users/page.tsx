'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  Search,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle2,
  Calendar,
  ShoppingBag,
  DollarSign,
  MapPin,
  Phone,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  UserPlus,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/components/admin-context';

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'banned';
  orders_count: number;
  total_spent: number;
  created_at: string;
  last_order_at?: string;
  addresses: Address[];
}

interface CustomerForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'banned';
  addresses: Address[];
}

const emptyForm: CustomerForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  status: 'active',
  addresses: [],
};

const emptyAddress: Address = {
  street: '',
  city: '',
  state: '',
  zip: '',
};

function UserTableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 bg-zinc-200 rounded-full" />
          <div className="flex-1">
            <div className="w-32 h-5 bg-zinc-200 rounded mb-2" />
            <div className="w-48 h-4 bg-zinc-200 rounded" />
          </div>
          <div className="w-16 h-6 bg-zinc-200 rounded-full" />
          <div className="w-20 h-5 bg-zinc-200 rounded" />
          <div className="w-8 h-8 bg-zinc-200 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function AdminUsersPage() {
  const { admin } = useAdmin();
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  
  // Dialog states
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  
  // Form state
  const [form, setForm] = React.useState<CustomerForm>(emptyForm);

  // Fetch customers from database
  const fetchCustomers = React.useCallback(async () => {
    if (!admin?.id) return;
    
    try {
      setIsLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('ecommerce_cj_users')
        .select('customers')
        .eq('admin_id', admin.id)
        .single();

      if (error) throw error;
      setCustomers(data?.customers || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  }, [admin?.id]);

  React.useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Save customers to database
  async function saveCustomers(updatedCustomers: Customer[]) {
    if (!admin?.id) return false;
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('ecommerce_cj_users')
        .update({ customers: updatedCustomers })
        .eq('admin_id', admin.id);

      if (error) throw error;
      setCustomers(updatedCustomers);
      return true;
    } catch (err) {
      console.error('Error saving customers:', err);
      toast.error('Failed to save changes');
      return false;
    }
  }

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        fullName.includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone?.includes(query);
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: customers.length,
      active: customers.filter((c) => c.status === 'active').length,
      inactive: customers.filter((c) => c.status === 'inactive').length,
      totalRevenue: customers.reduce((sum, c) => sum + c.total_spent, 0),
    };
  }, [customers]);

  // Format date
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Get status badge
  function getStatusBadge(status: string) {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 border-0">Inactive</Badge>;
      case 'banned':
        return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-0"><Ban className="w-3 h-3 mr-1" />Banned</Badge>;
      default:
        return null;
    }
  }

  // Open dialogs
  function openViewDialog(customer: Customer) {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  }

  function openAddDialog() {
    setForm(emptyForm);
    setIsAddDialogOpen(true);
  }

  function openEditDialog(customer: Customer) {
    setSelectedCustomer(customer);
    setForm({
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone || '',
      status: customer.status,
      addresses: customer.addresses || [],
    });
    setIsEditDialogOpen(true);
  }

  function openDeleteDialog(customer: Customer) {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  }

  // Handle add customer
  async function handleAddCustomer() {
    if (!form.first_name || !form.last_name || !form.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone || undefined,
      status: form.status,
      orders_count: 0,
      total_spent: 0,
      created_at: new Date().toISOString(),
      addresses: form.addresses.filter(a => a.street && a.city),
    };

    const success = await saveCustomers([...customers, newCustomer]);
    if (success) {
      toast.success('Customer added successfully');
      setIsAddDialogOpen(false);
      setForm(emptyForm);
    }
    setIsSaving(false);
  }

  // Handle edit customer
  async function handleEditCustomer() {
    if (!selectedCustomer || !form.first_name || !form.last_name || !form.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    const updatedCustomers = customers.map((c) =>
      c.id === selectedCustomer.id
        ? {
            ...c,
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            phone: form.phone || undefined,
            status: form.status,
            addresses: form.addresses.filter(a => a.street && a.city),
          }
        : c
    );

    const success = await saveCustomers(updatedCustomers);
    if (success) {
      toast.success('Customer updated successfully');
      setIsEditDialogOpen(false);
      setSelectedCustomer(null);
    }
    setIsSaving(false);
  }

  // Handle delete customer
  async function handleDeleteCustomer() {
    if (!selectedCustomer) return;

    setIsSaving(true);
    const updatedCustomers = customers.filter((c) => c.id !== selectedCustomer.id);
    const success = await saveCustomers(updatedCustomers);
    if (success) {
      toast.success('Customer deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
    }
    setIsSaving(false);
  }

  // Handle status change
  async function handleStatusChange(customer: Customer, newStatus: 'active' | 'inactive' | 'banned') {
    const updatedCustomers = customers.map((c) =>
      c.id === customer.id ? { ...c, status: newStatus } : c
    );
    const success = await saveCustomers(updatedCustomers);
    if (success) {
      toast.success(`Customer status updated to ${newStatus}`);
    }
  }

  // Add address
  function addAddress() {
    setForm((prev) => ({
      ...prev,
      addresses: [...prev.addresses, { ...emptyAddress }],
    }));
  }

  // Remove address
  function removeAddress(index: number) {
    setForm((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index),
    }));
  }

  // Update address
  function updateAddress(index: number, field: keyof Address, value: string) {
    setForm((prev) => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) =>
        i === index ? { ...addr, [field]: value } : addr
      ),
    }));
  }

  // Customer form element (memoized to prevent focus loss)
  const customerFormElement = useMemo(() => (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={form.first_name}
            onChange={(e) => setForm((prev) => ({ ...prev, first_name: e.target.value }))}
            placeholder="John"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={form.last_name}
            onChange={(e) => setForm((prev) => ({ ...prev, last_name: e.target.value }))}
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="john@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={form.phone}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={form.status}
          onValueChange={(value: 'active' | 'inactive' | 'banned') =>
            setForm((prev) => ({ ...prev, status: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Addresses */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Addresses</Label>
          <Button type="button" variant="outline" size="sm" onClick={addAddress}>
            <Plus className="w-3 h-3 mr-1" />
            Add Address
          </Button>
        </div>
        {form.addresses.map((address, index) => (
          <div key={index} className="p-3 border border-border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-600">Address {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAddress(index)}
                className="h-7 w-7 p-0 text-zinc-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Input
              placeholder="Street address"
              value={address.street}
              onChange={(e) => updateAddress(index, 'street', e.target.value)}
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="City"
                value={address.city}
                onChange={(e) => updateAddress(index, 'city', e.target.value)}
              />
              <Input
                placeholder="State"
                value={address.state}
                onChange={(e) => updateAddress(index, 'state', e.target.value)}
              />
              <Input
                placeholder="ZIP"
                value={address.zip}
                onChange={(e) => updateAddress(index, 'zip', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  ), [form]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Customers</h1>
          <p className="text-zinc-600 mt-1">Manage your customer accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchCustomers}
            className="border-zinc-200"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={openAddDialog} className="bg-zinc-900 hover:bg-zinc-800">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="p-4 bg-white border border-border rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
          <p className="text-xs text-zinc-500">Total Customers</p>
        </div>
        <div className="p-4 bg-white border border-border rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.active}</p>
          <p className="text-xs text-zinc-500">Active Customers</p>
        </div>
        <div className="p-4 bg-white border border-border rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-zinc-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.inactive}</p>
          <p className="text-xs text-zinc-500">Inactive Customers</p>
        </div>
        <div className="p-4 bg-white border border-border rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-zinc-500">Total Revenue</p>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-white border-border">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Customers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-border rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-zinc-900">{filteredCustomers.length} Customers</h2>
        </div>

        {isLoading ? (
          <UserTableSkeleton />
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500">No customers found</p>
            <Button onClick={openAddDialog} variant="outline" className="mt-4">
              <UserPlus className="w-4 h-4 mr-2" />
              Add your first customer
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredCustomers.map((customer, index) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={customer.avatar} />
                    <AvatarFallback className="bg-zinc-100 text-zinc-600">
                      {customer.first_name[0]}{customer.last_name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-zinc-900">
                        {customer.first_name} {customer.last_name}
                      </h3>
                      {getStatusBadge(customer.status)}
                    </div>
                    <p className="text-sm text-zinc-500 truncate">{customer.email}</p>
                  </div>

                  <div className="hidden md:block text-right">
                    <p className="font-semibold text-zinc-900">${customer.total_spent.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500">{customer.orders_count} orders</p>
                  </div>

                  <div className="hidden lg:block text-right">
                    <p className="text-sm text-zinc-600">{formatDate(customer.created_at)}</p>
                    <p className="text-xs text-zinc-400">Joined</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openViewDialog(customer)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Customer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {customer.status !== 'active' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(customer, 'active')}>
                          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                          Activate
                        </DropdownMenuItem>
                      )}
                      {customer.status !== 'inactive' && customer.status !== 'banned' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(customer, 'inactive')}>
                          <Users className="w-4 h-4 mr-2 text-zinc-500" />
                          Deactivate
                        </DropdownMenuItem>
                      )}
                      {customer.status !== 'banned' && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(customer, 'banned')}
                          className="text-red-600 focus:text-red-700"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Ban Customer
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(customer)}
                        className="text-red-600 focus:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Customer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Enter the customer&apos;s information.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            {customerFormElement}
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCustomer} disabled={isSaving} className="bg-zinc-900 hover:bg-zinc-800">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update the customer&apos;s information.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            {customerFormElement}
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditCustomer} disabled={isSaving} className="bg-zinc-900 hover:bg-zinc-800">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Customer Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{selectedCustomer?.first_name} {selectedCustomer?.last_name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCustomer}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedCustomer && (
                <>
                  <Avatar className="h-12 w-12 border border-border">
                    <AvatarImage src={selectedCustomer.avatar} />
                    <AvatarFallback className="bg-zinc-100 text-zinc-600">
                      {selectedCustomer.first_name[0]}{selectedCustomer.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg">{selectedCustomer.first_name} {selectedCustomer.last_name}</p>
                    <p className="text-sm font-normal text-zinc-500">{selectedCustomer.email}</p>
                  </div>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="sr-only">Customer details</DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-border">
                <span className="text-sm text-zinc-600">Status</span>
                {getStatusBadge(selectedCustomer.status)}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 bg-zinc-50 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingBag className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs text-zinc-500">Orders</span>
                  </div>
                  <p className="text-xl font-bold text-zinc-900">{selectedCustomer.orders_count}</p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs text-zinc-500">Total Spent</span>
                  </div>
                  <p className="text-xl font-bold text-zinc-900">${selectedCustomer.total_spent.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-3">
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-border">
                    <Phone className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm text-zinc-900">{selectedCustomer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-border">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-900">Joined {formatDate(selectedCustomer.created_at)}</span>
                </div>
                {selectedCustomer.last_order_at && (
                  <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-border">
                    <ShoppingBag className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm text-zinc-900">Last order {formatDate(selectedCustomer.last_order_at)}</span>
                  </div>
                )}
                {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && selectedCustomer.addresses[0] && (
                  <div className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg border border-border">
                    <MapPin className="w-4 h-4 text-zinc-400 mt-0.5" />
                    <span className="text-sm text-zinc-900">
                      {selectedCustomer.addresses[0].street}, {selectedCustomer.addresses[0].city}, {selectedCustomer.addresses[0].state} {selectedCustomer.addresses[0].zip}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedCustomer) openEditDialog(selectedCustomer);
              }}
              className="bg-zinc-900 hover:bg-zinc-800"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
