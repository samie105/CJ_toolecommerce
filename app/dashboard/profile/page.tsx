'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { User, Mail, MapPin, Camera, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-context';
import { updateUserProfile, addUserAddress, removeUserAddress } from '@/lib/actions/user';
import { CustomerAddress } from '@/lib/actions/auth';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isEditingPersonal, setIsEditingPersonal] = React.useState(false);
  const [isEditingContact, setIsEditingContact] = React.useState(false);
  const [isAddingAddress, setIsAddingAddress] = React.useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);
  const [addressToDelete, setAddressToDelete] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = React.useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [addresses, setAddresses] = React.useState<CustomerAddress[]>(
    user?.addresses || []
  );

  const [selectedAddressId, setSelectedAddressId] = React.useState<string>(
    addresses[0]?.id || ''
  );

  const [newAddress, setNewAddress] = React.useState({
    label: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
  });

  // Update form when user data changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setAddresses(user.addresses || []);
      if (user.addresses?.length && !selectedAddressId) {
        setSelectedAddressId(user.addresses[0].id || '');
      }
    }
  }, [user, selectedAddressId]);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  const handleSavePersonal = async () => {
    setIsSaving(true);
    try {
      const result = await updateUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      
      if (result.success) {
        toast.success('Personal information updated!');
        setIsEditingPersonal(false);
        refreshUser();
      } else {
        toast.error(result.error || 'Failed to update');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContact = async () => {
    setIsSaving(true);
    try {
      const result = await updateUserProfile({
        phone: formData.phone,
      });
      
      if (result.success) {
        toast.success('Contact information updated!');
        setIsEditingContact(false);
        refreshUser();
      } else {
        toast.error(result.error || 'Failed to update');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.label || !newAddress.street) {
      toast.error('Please fill in at least the label and street address');
      return;
    }
    
    setIsSaving(true);
    try {
      const result = await addUserAddress({
        label: newAddress.label,
        street: newAddress.street,
        city: newAddress.city,
        state: newAddress.state,
        zip: newAddress.zip,
        country: newAddress.country,
      });
      
      if (result.success && result.address) {
        setAddresses([...addresses, result.address]);
        setSelectedAddressId(result.address.id || '');
        setIsAddingAddress(false);
        setNewAddress({
          label: '',
          street: '',
          city: '',
          state: '',
          zip: '',
          country: 'United States',
        });
        toast.success('Address added successfully!');
        refreshUser();
      } else {
        toast.error(result.error || 'Failed to add address');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAddress = async (id: string) => {
    if (addresses.length <= 1) {
      toast.error('You must have at least one address');
      return;
    }
    
    setIsSaving(true);
    try {
      const result = await removeUserAddress(id);
      
      if (result.success) {
        const newAddresses = addresses.filter(a => a.id !== id);
        setAddresses(newAddresses);
        if (selectedAddressId === id && newAddresses.length > 0) {
          setSelectedAddressId(newAddresses[0].id || '');
        }
        setIsConfirmingDelete(false);
        setAddressToDelete(null);
        toast.success('Address removed');
        refreshUser();
      } else {
        toast.error(result.error || 'Failed to remove address');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setAddressToDelete(id);
    setIsConfirmingDelete(true);
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)',
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large', {
        description: 'Please select an image smaller than 5MB',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const result = await updateUserProfile({ avatar: base64 });
      if (result.success) {
        toast.success('Profile photo updated!');
        refreshUser();
      } else {
        toast.error('Failed to update photo');
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const userInitials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U'
    : 'U';

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information
        </p>
      </motion.div>

      {/* Profile Picture */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="grain shadow-none">
          <CardContent className="pt-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar || ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <button
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handlePhotoClick}
                >
                  <Camera className="h-6 w-6 text-white" />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-muted-foreground">{formData.email}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handlePhotoClick}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="grain shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg">
                  <User className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-xl font-bold">Personal Information</h3>
              </div>
              <Button
                variant={isEditingPersonal ? 'default' : 'outline'}
                disabled={isSaving}
                onClick={() => {
                  if (isEditingPersonal) {
                    handleSavePersonal();
                  } else {
                    setIsEditingPersonal(true);
                  }
                }}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isEditingPersonal ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  'Edit'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  disabled={!isEditingPersonal || isSaving}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  disabled={!isEditingPersonal || isSaving}
                  className="h-11"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="grain shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg">
                  <Mail className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-xl font-bold">Contact Information</h3>
              </div>
              <Button
                variant={isEditingContact ? 'default' : 'outline'}
                disabled={isSaving}
                onClick={() => {
                  if (isEditingContact) {
                    handleSaveContact();
                  } else {
                    setIsEditingContact(true);
                  }
                }}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isEditingContact ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  'Edit'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="h-11 bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={!isEditingContact || isSaving}
                  className="h-11"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Shipping Address */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="grain shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-xl font-bold">Shipping Address</h3>
              </div>
              <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Address</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Address Label (e.g., Home, Office)</Label>
                      <Input
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        placeholder="Home"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Street Address</Label>
                      <Input
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          placeholder="New York"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          placeholder="NY"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>ZIP Code</Label>
                        <Input
                          value={newAddress.zip}
                          onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                          placeholder="10001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input
                          value={newAddress.country}
                          onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                          placeholder="United States"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingAddress(false)}>Cancel</Button>
                    <Button onClick={handleAddAddress} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Address'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {addresses.length > 0 ? (
              <>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select an address" />
                      </SelectTrigger>
                      <SelectContent>
                        {addresses.map((addr) => (
                          <SelectItem key={addr.id} value={addr.id || ''}>
                            {addr.label} - {addr.street}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-11 w-11 shrink-0"
                    onClick={() => selectedAddressId && handleDeleteClick(selectedAddressId)}
                    disabled={addresses.length <= 1 || isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {selectedAddress && (
                  <div className="grid md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Street Address</Label>
                      <p className="font-medium">{selectedAddress.street}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">City</Label>
                      <p className="font-medium">{selectedAddress.city}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">State/Province</Label>
                      <p className="font-medium">{selectedAddress.state}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">ZIP / Postal Code</Label>
                      <p className="font-medium">{selectedAddress.zip}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Country</Label>
                      <p className="font-medium">{selectedAddress.country || 'United States'}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No addresses saved yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsAddingAddress(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Address
                </Button>
              </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Address</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-muted-foreground">
                    Are you sure you want to delete this address? This action cannot be undone.
                  </p>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsConfirmingDelete(false);
                      setAddressToDelete(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    disabled={isSaving}
                    onClick={() => addressToDelete && handleRemoveAddress(addressToDelete)}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="grain border-red-200 shadow-none">
          <CardHeader>
            <h3 className="text-xl font-bold text-red-600">Danger Zone</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-red-50">
              <div>
                <p className="font-semibold text-red-900">Delete Account</p>
                <p className="text-sm text-red-700">
                  Once you delete your account, there is no going back.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() =>
                  toast.error('Account deletion is not available', {
                    description: 'Please contact support for assistance.',
                  })
                }
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
