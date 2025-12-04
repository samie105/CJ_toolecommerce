'use client';

import { motion } from 'framer-motion';

export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border/50">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/5] bg-muted overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Badge skeleton */}
        <div className="absolute top-3 left-3">
          <div className="w-12 h-5 bg-muted-foreground/10 rounded-full" />
        </div>
        
        {/* Favorite button skeleton */}
        <div className="absolute top-3 right-3">
          <div className="w-9 h-9 bg-muted-foreground/10 rounded-full" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="w-16 h-3 bg-muted-foreground/10 rounded" />
        
        {/* Title */}
        <div className="w-3/4 h-4 bg-muted-foreground/10 rounded" />
        
        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-muted-foreground/10 rounded" />
          ))}
          <div className="w-8 h-3 bg-muted-foreground/10 rounded ml-1" />
        </div>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <div className="w-16 h-5 bg-muted-foreground/10 rounded" />
          <div className="w-12 h-4 bg-muted-foreground/10 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ProductSectionSkeleton({ count = 5 }: { count?: number }) {
  return (
    <section className="py-10 sm:py-14 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="flex items-end justify-between mb-6">
          <div className="space-y-2">
            <div className="w-20 h-3 bg-muted-foreground/10 rounded" />
            <div className="w-40 h-6 bg-muted-foreground/10 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-9 h-9 bg-muted-foreground/10 rounded-full" />
              <div className="w-9 h-9 bg-muted-foreground/10 rounded-full" />
            </div>
            <div className="w-16 h-4 bg-muted-foreground/10 rounded" />
          </div>
        </div>

        {/* Products Skeleton */}
        <div className="flex gap-4 overflow-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {[...Array(count)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[260px] sm:w-[280px]">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
