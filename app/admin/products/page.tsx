'use client';

import * as React from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import type { Product as DbProduct } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Loader2,
  ImageIcon,
  Filter,
  Upload,
  X,
  GripVertical,
  FolderOpen,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadToCloudinary } from './actions';

// Types
interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  productCount?: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  images?: string[];
  categoryId: string;
  category?: string; // For display purposes
  stock?: number;
  rating?: number;
  reviews?: number;
  in_stock?: boolean;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  stock: number;
}

interface CategoryFormData {
  name: string;
  description: string;
  image: string;
}

export default function ProductsPage() {
  // Data state
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = React.useState('all');
  const [activeTab, setActiveTab] = React.useState('products');

  // Product Dialog states
  const [isAddProductOpen, setIsAddProductOpen] = React.useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = React.useState(false);
  const [isDeleteProductOpen, setIsDeleteProductOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);

  // Category Dialog states
  const [isAddCategoryOpen, setIsAddCategoryOpen] = React.useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = React.useState(false);
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);

  const [isSaving, setIsSaving] = React.useState(false);

  // Product form state
  const [productForm, setProductForm] = React.useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    images: [],
    categoryId: '',
    stock: 0,
  });

  // Category form state
  const [categoryForm, setCategoryForm] = React.useState<CategoryFormData>({
    name: '',
    description: '',
    image: '',
  });

  // Image upload state
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const productFileInputRef = React.useRef<HTMLInputElement>(null);
  const categoryFileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch data on mount
  React.useEffect(() => {
    fetchData();
  }, []);

  // Filter products
  React.useEffect(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategoryFilter !== 'all') {
      filtered = filtered.filter((p) => p.categoryId === selectedCategoryFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategoryFilter]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ecommerce_cj_users')
        .select('products, categories')
        .eq('email', 'store@aresdiamondtools.org')
        .single();

      if (error) throw error;

      const userData = data as { products?: Product[]; categories?: Category[] } | null;
      const fetchedCategories = userData?.categories || [];
      const fetchedProducts = userData?.products || [];

      // Add category name to products for display
      const productsWithCategory = fetchedProducts.map((p) => {
        const cat = fetchedCategories.find((c) => c.id === p.categoryId);
        return { ...p, category: cat?.name || p.category || 'Uncategorized' };
      });

      setCategories(fetchedCategories);
      setProducts(productsWithCategory);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }

  async function saveData(updatedProducts?: Product[], updatedCategories?: Category[]) {
    try {
      const updatePayload: Record<string, unknown> = {};
      if (updatedProducts !== undefined) {
        updatePayload.products = updatedProducts as unknown as DbProduct[];
      }
      if (updatedCategories !== undefined) {
        updatePayload.categories = updatedCategories;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('ecommerce_cj_users')
        .update(updatePayload)
        .eq('email', 'store@aresdiamondtools.org');

      if (error) throw error;

      if (updatedProducts) setProducts(updatedProducts);
      if (updatedCategories) setCategories(updatedCategories);

      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save changes');
      return false;
    }
  }

  // ============ CATEGORY HANDLERS ============
  function openAddCategory() {
    setCategoryForm({ name: '', description: '', image: '' });
    setIsAddCategoryOpen(true);
  }

  function openEditCategory(category: Category) {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
    });
    setIsEditCategoryOpen(true);
  }

  function openDeleteCategory(category: Category) {
    setSelectedCategory(category);
    setIsDeleteCategoryOpen(true);
  }

  async function handleSaveNewCategory() {
    if (!categoryForm.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setIsSaving(true);
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim(),
      image: categoryForm.image,
      productCount: 0,
    };

    const success = await saveData(undefined, [...categories, newCategory]);
    if (success) {
      toast.success('Category created successfully');
      setIsAddCategoryOpen(false);
    }
    setIsSaving(false);
  }

  async function handleSaveEditedCategory() {
    if (!selectedCategory || !categoryForm.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setIsSaving(true);
    const updatedCategories = categories.map((c) =>
      c.id === selectedCategory.id
        ? { ...c, name: categoryForm.name.trim(), description: categoryForm.description.trim(), image: categoryForm.image }
        : c
    );

    // Also update category name in products
    const updatedProducts = products.map((p) =>
      p.categoryId === selectedCategory.id ? { ...p, category: categoryForm.name.trim() } : p
    );

    const success = await saveData(updatedProducts, updatedCategories);
    if (success) {
      toast.success('Category updated successfully');
      setIsEditCategoryOpen(false);
    }
    setIsSaving(false);
  }

  async function handleDeleteCategory() {
    if (!selectedCategory) return;

    // Check if category has products
    const productsInCategory = products.filter((p) => p.categoryId === selectedCategory.id);
    if (productsInCategory.length > 0) {
      toast.error(`Cannot delete category with ${productsInCategory.length} product(s). Move or delete products first.`);
      setIsDeleteCategoryOpen(false);
      return;
    }

    setIsSaving(true);
    const updatedCategories = categories.filter((c) => c.id !== selectedCategory.id);

    const success = await saveData(undefined, updatedCategories);
    if (success) {
      toast.success('Category deleted successfully');
      setIsDeleteCategoryOpen(false);
    }
    setIsSaving(false);
  }

  // ============ PRODUCT HANDLERS ============
  function openAddProduct() {
    setProductForm({
      name: '',
      description: '',
      price: 0,
      images: [],
      categoryId: categories[0]?.id || '',
      stock: 0,
    });
    setIsAddProductOpen(true);
  }

  function openEditProduct(product: Product) {
    setSelectedProduct(product);
    const allImages = product.images?.length
      ? product.images
      : product.image
      ? [product.image]
      : [];

    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      images: allImages,
      categoryId: product.categoryId || '',
      stock: product.stock || 0,
    });
    setIsEditProductOpen(true);
  }

  function openDeleteProduct(product: Product) {
    setSelectedProduct(product);
    setIsDeleteProductOpen(true);
  }

  // Helper function to convert file to base64
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  async function handleFileUpload(files: FileList | null, type: 'product' | 'category') {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    const totalFiles = files.length;
    let uploadedCount = 0;
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Convert file to base64 for server action
        const base64Data = await fileToBase64(file);
        
        const result = await uploadToCloudinary(base64Data);

        if (result.success && result.url) {
          newUrls.push(result.url);
        } else {
          toast.error(`Failed to upload ${file.name}: ${result.error}`);
        }

        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
      }

      if (newUrls.length > 0) {
        if (type === 'product') {
          setProductForm((prev) => ({
            ...prev,
            images: [...prev.images, ...newUrls],
          }));
        } else {
          setCategoryForm((prev) => ({
            ...prev,
            image: newUrls[0],
          }));
        }
        toast.success(`${newUrls.length} image(s) uploaded`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  function removeProductImage(index: number) {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  function setPrimaryImage(index: number) {
    if (index === 0) return;
    setProductForm((prev) => {
      const newImages = [...prev.images];
      const [moved] = newImages.splice(index, 1);
      newImages.unshift(moved);
      return { ...prev, images: newImages };
    });
    toast.success('Primary image updated');
  }

  async function handleSaveNewProduct() {
    if (!productForm.name || !productForm.categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (productForm.images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    setIsSaving(true);
    const category = categories.find((c) => c.id === productForm.categoryId);
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: productForm.name,
      description: productForm.description,
      price: productForm.price,
      image: productForm.images[0],
      images: productForm.images,
      categoryId: productForm.categoryId,
      category: category?.name || 'Uncategorized',
      stock: productForm.stock,
      in_stock: productForm.stock > 0,
    };

    const success = await saveData([...products, newProduct], undefined);
    if (success) {
      toast.success('Product added successfully');
      setIsAddProductOpen(false);
    }
    setIsSaving(false);
  }

  async function handleSaveEditedProduct() {
    if (!selectedProduct || !productForm.name || !productForm.categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (productForm.images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    setIsSaving(true);
    const category = categories.find((c) => c.id === productForm.categoryId);
    const updatedProducts = products.map((p) =>
      p.id === selectedProduct.id
        ? {
            ...p,
            name: productForm.name,
            description: productForm.description,
            price: productForm.price,
            image: productForm.images[0],
            images: productForm.images,
            categoryId: productForm.categoryId,
            category: category?.name || 'Uncategorized',
            stock: productForm.stock,
            in_stock: productForm.stock > 0,
          }
        : p
    );

    const success = await saveData(updatedProducts, undefined);
    if (success) {
      toast.success('Product updated successfully');
      setIsEditProductOpen(false);
    }
    setIsSaving(false);
  }

  async function handleDeleteProduct() {
    if (!selectedProduct) return;

    setIsSaving(true);
    const updatedProducts = products.filter((p) => p.id !== selectedProduct.id);

    const success = await saveData(updatedProducts, undefined);
    if (success) {
      toast.success('Product deleted successfully');
      setIsDeleteProductOpen(false);
    }
    setIsSaving(false);
  }

  // ============ INLINE FORM ELEMENTS ============

  const productFormElement = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="productName">Product Name *</Label>
        <Input
          id="productName"
          placeholder="Enter product name"
          value={productForm.name}
          onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="productDesc">Description</Label>
        <textarea
          id="productDesc"
          placeholder="Enter product description"
          value={productForm.description}
          onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
          className="w-full h-20 rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="productPrice">Price ($) *</Label>
          <Input
            id="productPrice"
            type="number"
            step="0.01"
            min="0"
            value={productForm.price || ''}
            onChange={(e) => setProductForm((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="productStock">Stock *</Label>
          <Input
            id="productStock"
            type="number"
            min="0"
            value={productForm.stock || ''}
            onChange={(e) => setProductForm((prev) => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Category *</Label>
        <Select
          value={productForm.categoryId}
          onValueChange={(value) => setProductForm((prev) => ({ ...prev, categoryId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No categories. Create one first.
              </div>
            ) : (
              categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Images *</Label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isUploading ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
        >
          <input
            ref={productFileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileUpload(e.target.files, 'product')}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="space-y-2 py-2">
              <Loader2 className="h-6 w-6 mx-auto text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
            </div>
          ) : (
            <div className="space-y-1 py-2">
              <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Click or drag to upload</p>
            </div>
          )}
        </div>

        {productForm.images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {productForm.images.map((url, index) => (
              <div
                key={url + index}
                className={`relative group aspect-square rounded-lg border overflow-hidden ${
                  index === 0 ? 'ring-2 ring-primary' : ''
                }`}
              >
                <Image src={url} alt="" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className="p-1 bg-white rounded hover:bg-gray-100"
                    >
                      <GripVertical className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeProductImage(index)}
                    className="p-1 bg-white rounded hover:bg-red-50"
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </button>
                </div>
                {index === 0 && (
                  <span className="absolute top-0.5 left-0.5 bg-primary text-[8px] text-white px-1 rounded">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const categoryFormElement = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="categoryName">Category Name *</Label>
        <Input
          id="categoryName"
          placeholder="Enter category name"
          value={categoryForm.name}
          onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryDesc">Description</Label>
        <textarea
          id="categoryDesc"
          placeholder="Enter category description"
          value={categoryForm.description}
          onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
          className="w-full h-20 rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <Label>Category Image</Label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isUploading ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
        >
          <input
            ref={categoryFileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files, 'category')}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="space-y-2 py-2">
              <Loader2 className="h-6 w-6 mx-auto text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
            </div>
          ) : (
            <div className="space-y-1 py-2">
              <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Click or drag to upload</p>
            </div>
          )}
        </div>

        {categoryForm.image && (
          <div className="relative w-20 h-20 rounded-lg border overflow-hidden mt-2">
            <Image src={categoryForm.image} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => setCategoryForm((prev) => ({ ...prev, image: '' }))}
              className="absolute top-1 right-1 p-0.5 bg-white rounded-full hover:bg-red-50"
            >
              <X className="h-3 w-3 text-red-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Count products per category
  const categoriesWithCount = categories.map((cat) => ({
    ...cat,
    productCount: products.filter((p) => p.categoryId === cat.id).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Products & Categories</h1>
        <p className="text-muted-foreground mt-1">Manage your product catalog and categories</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Categories ({categories.length})
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={openAddProduct} disabled={categories.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {categories.length === 0 && (
            <div className="bg-muted/50 border border-dashed rounded-lg p-6 text-center">
              <Tag className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Create a category first before adding products</p>
              <Button variant="outline" className="mt-3" onClick={() => setActiveTab('categories')}>
                Go to Categories
              </Button>
            </div>
          )}

          {categories.length > 0 && (
            <div className="bg-background rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm hidden md:table-cell">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm hidden sm:table-cell">Stock</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center">
                        <Package className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">No products found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg border overflow-hidden bg-muted shrink-0">
                              {product.image ? (
                                <Image src={product.image} alt="" width={40} height={40} className="object-cover w-full h-full" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate text-sm">{product.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[150px]">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-sm">${product.price.toFixed(2)}</span>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <Badge
                            variant={(product.stock ?? 0) > 10 ? 'default' : (product.stock ?? 0) > 0 ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {(product.stock ?? 0) > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditProduct(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => openDeleteProduct(product)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={openAddCategory}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoriesWithCount.length === 0 ? (
              <div className="col-span-full bg-muted/50 border border-dashed rounded-lg p-8 text-center">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No categories yet. Create your first category.</p>
              </div>
            ) : (
              categoriesWithCount.map((category) => (
                <div key={category.id} className="bg-background rounded-lg border p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-lg border overflow-hidden bg-muted shrink-0">
                      {category.image ? (
                        <Image src={category.image} alt="" width={56} height={56} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FolderOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{category.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{category.description || 'No description'}</p>
                      <p className="text-xs text-primary mt-1">{category.productCount} product(s)</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-1 mt-3 pt-3 border-t">
                    <Button variant="ghost" size="sm" onClick={() => openEditCategory(category)}>
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => openDeleteCategory(category)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Fill in the details to add a new product.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            {productFormElement}
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveNewProduct} disabled={isSaving || isUploading}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            {productFormElement}
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditProductOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEditedProduct} disabled={isSaving || isUploading}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={isDeleteProductOpen} onOpenChange={setIsDeleteProductOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{selectedProduct?.name}&rdquo;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteProductOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteProduct} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new product category.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            {categoryFormElement}
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveNewCategory} disabled={isSaving || isUploading}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category details.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            {categoryFormElement}
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditCategoryOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEditedCategory} disabled={isSaving || isUploading}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteCategoryOpen} onOpenChange={setIsDeleteCategoryOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{selectedCategory?.name}&rdquo;? Categories with products cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteCategoryOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCategory} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
