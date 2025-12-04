'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Star,
  Heart,
  Share2,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Award,
  Package,
} from 'lucide-react';
import { motion } from 'framer-motion';
import * as React from 'react';
import { Product } from '@/lib/products-data';
import { useCart } from '@/components/cart-context';
import { toast } from 'sonner';

interface ProductDetailsProps {
  product: Product;
}

// Icon mapping for dynamic rendering
const iconMap: Record<string, React.ElementType> = {
  Zap,
  ShieldCheck,
  Award,
  Package,
};

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = React.useState(0);
  const { addItem, items } = useCart();

  const isInCart = items.some((item) => item.id === product.id);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
    toast.success('Added to cart!', {
      description: `${product.name} has been added to your cart.`,
    });
  };

  const discountPercentage = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <>
      {/* Main product section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
          {/* Left: Image gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {/* Main image */}
            <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="relative aspect-square w-full bg-muted/20">
                  <Image
                    src={product.images?.[selectedImage] || product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
                    className="object-cover"
                    priority
                  />
                  {product.badge && (
                    <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
                      {product.badge}
                    </Badge>
                  )}
                  {discountPercentage > 0 && (
                    <Badge className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 text-xs font-semibold">
                      -{discountPercentage}% OFF
                    </Badge>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Badge variant="destructive" className="text-sm px-4 py-2">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === idx
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border/40 hover:border-border'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Product details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                    {product.category}
                  </p>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-tight">
                    {product.name}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating!)
                            ? 'text-primary fill-primary'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating} ({product.reviewCount || 0} reviews)
                  </span>
                </div>
              )}

              {/* SKU & Stock */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {product.sku && <span>SKU: {product.sku}</span>}
                {product.inStock !== false ? (
                  <span className="flex items-center gap-1.5 text-green-600 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    In Stock
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </div>
            </div>

            <Separator />

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </p>
                {product.originalPrice && (
                  <div className="flex items-center gap-2">
                    <p className="text-lg text-muted-foreground line-through">
                      ${product.originalPrice.toFixed(2)}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                    </Badge>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Tax included. Shipping calculated at checkout.
              </p>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-3">
              <p className="text-base leading-relaxed text-muted-foreground">
                {product.description}
              </p>
              {product.longDescription && (
                <p className="text-sm leading-relaxed text-muted-foreground/80">
                  {product.longDescription}
                </p>
              )}
            </div>

            {/* Add to cart */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full text-base font-semibold py-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={product.inStock === false || isInCart}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.inStock === false ? 'Out of Stock' : isInCart ? 'Added to Cart' : 'Add to Cart'}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Free shipping on orders over $100 • Secure checkout
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Detailed specifications and features sections */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Key Features */}
          {product.features && product.features.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8 space-y-6">
                  <h2 className="text-2xl font-semibold tracking-tight">Key Features</h2>
                  <div className="space-y-6">
                    {product.features.map((feature, idx) => {
                      const IconComponent = iconMap[feature.icon] || Zap;
                      return (
                        <div key={idx} className="flex gap-4">
                          <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold text-base">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Technical Specifications */}
          {product.specs && product.specs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8 space-y-6">
                  <h2 className="text-2xl font-semibold tracking-tight">Technical Specifications</h2>
                  <ul className="space-y-3">
                    {product.specs.map((spec, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground leading-relaxed">{spec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* What's Included */}
        {product.included && product.included.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">What&apos;s Included</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {product.included.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </section>
    </>
  );
}
