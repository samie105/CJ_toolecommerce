'use server';

import { createServerClient } from '@/lib/supabase';
import { Product, allProducts, getFeaturedProducts, getNewArrivals } from '@/lib/products-data';

interface DatabaseProduct {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image: string;
  images?: string[];
  category: string;
  badge?: string;
  rating?: number;
  review_count?: number;
  in_stock?: boolean;
  sku?: string;
  description?: string;
  is_featured?: boolean;
  is_new?: boolean;
}

interface UserWithProducts {
  id: string;
  products: DatabaseProduct[] | null;
}

// Transform database product to frontend Product type
function transformProduct(dbProduct: DatabaseProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    price: dbProduct.price,
    originalPrice: dbProduct.original_price,
    image: dbProduct.image,
    images: dbProduct.images,
    category: dbProduct.category,
    badge: dbProduct.badge,
    rating: dbProduct.rating,
    reviewCount: dbProduct.review_count,
    inStock: dbProduct.in_stock ?? true,
    sku: dbProduct.sku,
    description: dbProduct.description,
    isFeatured: dbProduct.is_featured,
    isNew: dbProduct.is_new,
  };
}

// Fetch all products from the database
export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const supabase = createServerClient();
    
    const { data: users, error } = await supabase
      .from('ecommerce_cj_users')
      .select('id, products');

    if (error) {
      console.error('Error fetching products:', error);
      // Fallback to static data
      return allProducts;
    }

    const allDbProducts: Product[] = [];
    (users as unknown as UserWithProducts[])?.forEach((user) => {
      if (user.products && Array.isArray(user.products)) {
        user.products.forEach((product) => {
          allDbProducts.push(transformProduct(product));
        });
      }
    });

    // If no products in database, return static data
    if (allDbProducts.length === 0) {
      return allProducts;
    }

    return allDbProducts;
  } catch (err) {
    console.error('Error in fetchAllProducts:', err);
    // Fallback to static data on error
    return allProducts;
  }
}

// Fetch featured products
export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const products = await fetchAllProducts();
    const featured = products.filter((p) => p.isFeatured);
    
    // If no featured products in database, use static data
    if (featured.length === 0) {
      return getFeaturedProducts();
    }
    
    return featured;
  } catch (err) {
    console.error('Error in fetchFeaturedProducts:', err);
    return getFeaturedProducts();
  }
}

// Fetch new arrivals
export async function fetchNewArrivals(): Promise<Product[]> {
  try {
    const products = await fetchAllProducts();
    const newProducts = products.filter((p) => p.isNew);
    
    // If no new products in database, use static data
    if (newProducts.length === 0) {
      return getNewArrivals();
    }
    
    return newProducts;
  } catch (err) {
    console.error('Error in fetchNewArrivals:', err);
    return getNewArrivals();
  }
}

// Fetch products by category
export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  try {
    const products = await fetchAllProducts();
    return products.filter((p) => p.category === category);
  } catch (err) {
    console.error('Error in fetchProductsByCategory:', err);
    return allProducts.filter((p) => p.category === category);
  }
}

// Fetch a single product by ID
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const products = await fetchAllProducts();
    return products.find((p) => p.id === id) || null;
  } catch (err) {
    console.error('Error in fetchProductById:', err);
    return allProducts.find((p) => p.id === id) || null;
  }
}

// Category type
export interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
  productCount?: number;
}

interface UserWithCategories {
  id: string;
  categories: Category[] | null;
}

// Fetch all categories from the database
export async function fetchCategories(): Promise<Category[]> {
  try {
    const supabase = createServerClient();
    
    const { data: users, error } = await supabase
      .from('ecommerce_cj_users')
      .select('id, categories');

    if (error) {
      console.error('Error fetching categories:', error);
      // Return unique categories from products as fallback
      const products = await fetchAllProducts();
      const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
      return uniqueCategories.map((name, idx) => ({ id: `cat-${idx}`, name }));
    }

    const allCategories: Category[] = [];
    (users as unknown as UserWithCategories[])?.forEach((user) => {
      if (user.categories && Array.isArray(user.categories)) {
        user.categories.forEach((category) => {
          // Avoid duplicates
          if (!allCategories.some(c => c.id === category.id)) {
            allCategories.push(category);
          }
        });
      }
    });

    // If no categories in database, extract from products
    if (allCategories.length === 0) {
      const products = await fetchAllProducts();
      const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
      return uniqueCategories.map((name, idx) => ({ id: `cat-${idx}`, name }));
    }

    return allCategories;
  } catch (err) {
    console.error('Error in fetchCategories:', err);
    return [];
  }
}
