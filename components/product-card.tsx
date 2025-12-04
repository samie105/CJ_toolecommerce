'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Plus, Star, Check } from 'lucide-react';
import { Product } from '@/lib/products-data';
import { useCart } from '@/components/cart-context';
import { useFavorites } from '@/components/favorites-context';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

const AUTH_STORAGE_KEY = 'toolcraft-auth';

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);
  const [isAdded, setIsAdded] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const { addItem } = useCart();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  
  const productIsFavorite = isFavorite(product.id);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem(AUTH_STORAGE_KEY);
      setIsAuthenticated(!!auth);
      
      // Check if mobile
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
    
    setIsAdded(true);
    toast.success('Added to cart', {
      description: product.name,
    });
    
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    
    if (productIsFavorite) {
      removeFavorite(product.id);
      toast.success('Removed from favorites');
    } else {
      addFavorite(product.id);
      toast.success('Added to favorites');
    }
  };

  const discountPercentage = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  // Show add to cart on mobile always, or on hover for desktop
  const showAddToCart = isMobile || isHovered;

  return (
    <>
      <Link href={`/products/${product.id}`}>
        <motion.div
          className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-border transition-colors"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image Container */}
          <div className="relative aspect-[4/5] bg-muted overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 260px, 280px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Badges - Glassmorphic */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {discountPercentage > 0 && (
                <span className="px-2.5 py-1 text-xs font-medium bg-white/20 backdrop-blur-md text-white rounded-full border border-white/30">
                  -{discountPercentage}%
                </span>
              )}
              {product.badge && (
                <span className="px-2.5 py-1 text-xs font-medium bg-white/20 backdrop-blur-md text-white rounded-full border border-white/30">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Favorite Button - Glassmorphic */}
            <button
              onClick={handleFavoriteClick}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md border ${
                productIsFavorite
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
              }`}
            >
              <Heart 
                className="w-4 h-4" 
                fill={productIsFavorite ? 'currentColor' : 'none'} 
              />
            </button>

            {/* Bottom Gradient for Text Readability */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

            {/* Product Info Overlay on Image */}
            <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ 
                  opacity: showAddToCart ? 0 : 1,
                  y: showAddToCart ? 10 : 0
                }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider mb-0.5">
                  {product.category}
                </p>
                <h3 className="font-medium text-white text-sm leading-tight line-clamp-1 mb-1">
                  {product.name}
                </h3>
                <p className="text-white font-semibold text-sm">
                  ${product.price.toFixed(2)}
                </p>
              </motion.div>
            </div>

            {/* Quick Add Button - Glassmorphic - Above the overlay */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: showAddToCart ? 1 : 0, 
                y: showAddToCart ? 0 : 10 
              }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-4 left-3 right-3 pointer-events-auto"
            >
              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-md border ${
                  isAdded
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30 active:bg-white/40'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add to cart
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* Product Info Below Image */}
          <div className="p-4">
            <p className="text-[11px] text-primary font-medium uppercase tracking-wider mb-1">
              {product.category}
            </p>
            <h3 className="font-medium text-foreground text-sm leading-tight mb-2 line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(product.rating!) 
                          ? 'text-primary fill-primary' 
                          : 'text-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount || 0})
                </span>
              </div>
            )}
            
            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-foreground">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Sign in to save favorites</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create an account or sign in to save your favorite items and access them anywhere.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button asChild className="h-11 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/login" onClick={() => setShowLoginDialog(false)}>
                Sign in
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-11">
              <Link href="/signup" onClick={() => setShowLoginDialog(false)}>
                Create account
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
