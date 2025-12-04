'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { useFavorites } from '@/components/favorites-context';
import { getProductsByIds } from '@/lib/actions/user';
import { Product } from '@/lib/products-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [favoriteProducts, setFavoriteProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (favorites.length === 0) {
          setFavoriteProducts([]);
          setIsLoading(false);
          return;
        }
        const products = await getProductsByIds(favorites);
        setFavoriteProducts(products);
      } catch (error) {
        console.error('Failed to fetch favorite products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [favorites]);

  const totalValue = React.useMemo(
    () => favoriteProducts.reduce((sum, product) => sum + product.price, 0),
    [favoriteProducts]
  );
  
  const uniqueCategories = React.useMemo(
    () => Array.from(new Set(favoriteProducts.map((product) => product.category))).sort(),
    [favoriteProducts]
  );
  
  const [activeCategory, setActiveCategory] = React.useState<string>('All');

  const visibleProducts = React.useMemo(() => {
    if (activeCategory === 'All') return favoriteProducts;
    return favoriteProducts.filter((product) => product.category === activeCategory);
  }, [activeCategory, favoriteProducts]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-muted rounded-2xl animate-pulse"></div>
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
        <h1 className="text-3xl font-semibold text-foreground">Favorites</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your saved items ({favoriteProducts.length})
        </p>
      </motion.div>

      {/* Stats & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card/80 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Saved Items</p>
            <p className="text-3xl font-semibold text-foreground mt-2">{favoriteProducts.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Curated wishlist</p>
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3 text-primary">
            <Heart className="h-6 w-6" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-border bg-card/80 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Estimated Value</p>
            <p className="text-3xl font-semibold text-foreground mt-2">
              {totalValue > 0 ? `$${totalValue.toFixed(2)}` : '$0.00'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Based on current pricing</p>
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Need inspiration?</p>
              <p className="text-xs text-muted-foreground">Explore fresh arrivals curated for pros.</p>
            </div>
            <Badge variant="secondary" className="bg-white text-primary">
              New drops
            </Badge>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/">
                Browse Catalog
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/dashboard/history">
                View Order History
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Category Filters */}
      {favoriteProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="flex flex-wrap gap-2"
        >
          {['All', ...uniqueCategories].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                activeCategory === category
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>
      )}

      {/* Products Grid */}
      {visibleProducts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-16 rounded-2xl border border-border bg-card"
        >
          <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No favorites yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Save the tools you love for faster access when you&apos;re ready to buy. Your list will appear here.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Button asChild>
              <Link href="/">
                Discover Products
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/history">
                Revisit your orders
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
