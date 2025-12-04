'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Product } from '@/lib/products-data';
import Image from 'next/image';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
}

interface SearchSectionProps {
  categories?: Category[];
  products?: Product[];
}

export function SearchSection({ categories = [], products = [] }: SearchSectionProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [priceRange, setPriceRange] = React.useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([]);
  const [showResults, setShowResults] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  // Get unique category names from the categories prop
  const categoryNames = React.useMemo(() => {
    if (categories.length > 0) {
      return categories.map(c => c.name);
    }
    // Fallback to extracting from products
    return Array.from(new Set(products.map(p => p.category)));
  }, [categories, products]);

  const priceRanges = React.useMemo(() => [
    { label: 'Under $100', min: 0, max: 100 },
    { label: '$100 - $200', min: 100, max: 200 },
    { label: '$200 - $300', min: 200, max: 300 },
    { label: 'Over $300', min: 300, max: Infinity },
  ], []);

  React.useEffect(() => {
    if (!searchQuery && selectedCategories.length === 0 && priceRange.length === 0) {
      setFilteredProducts([]);
      setShowResults(false);
      return;
    }

    let results = products;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query)
      );
    }

    if (selectedCategories.length > 0) {
      results = results.filter(product => 
        selectedCategories.includes(product.category)
      );
    }

    if (priceRange.length > 0) {
      results = results.filter(product => {
        return priceRange.some(range => {
          const priceRangeObj = priceRanges.find(pr => pr.label === range);
          if (!priceRangeObj) return false;
          return product.price >= priceRangeObj.min && product.price < priceRangeObj.max;
        });
      });
    }

    setFilteredProducts(results);
    setShowResults(true);
  }, [searchQuery, selectedCategories, priceRange, priceRanges, products]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowFilters(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const togglePriceRange = (range: string) => {
    setPriceRange(prev =>
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };

  const clearAll = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRange([]);
    setShowResults(false);
    setShowFilters(false);
  };

  const hasActiveFilters = selectedCategories.length > 0 || priceRange.length > 0;
  const totalFilters = selectedCategories.length + priceRange.length;

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-2">
            Find your tools
          </h2>
          <p className="text-muted-foreground text-sm">
            Search our collection of professional-grade equipment
          </p>
        </motion.div>

        <div ref={searchRef} className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center border border-border rounded-full bg-card transition-all duration-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
              <div className="pl-5">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery || hasActiveFilters) {
                    setShowResults(true);
                  }
                }}
                className="flex-1 border-0 bg-transparent h-12 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              
              <div className="flex items-center gap-2 pr-3">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    showFilters || hasActiveFilters
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {totalFilters > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      showFilters || hasActiveFilters ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'
                    }`}>
                      {totalFilters}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="p-5 bg-card rounded-2xl border border-border">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                          Category
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {categoryNames.map((category) => (
                            <button
                              key={category}
                              onClick={() => toggleCategory(category)}
                              className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${
                                selectedCategories.includes(category)
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-background text-foreground border-border hover:border-primary/50'
                              }`}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                          Price Range
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {priceRanges.map((range) => (
                            <button
                              key={range.label}
                              onClick={() => togglePriceRange(range.label)}
                              className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${
                                priceRange.includes(range.label)
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-background text-foreground border-border hover:border-primary/50'
                              }`}
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {hasActiveFilters && (
                      <div className="mt-4 pt-4 border-t border-border flex justify-end">
                        <button
                          onClick={clearAll}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Clear all filters
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-3 left-0 right-0 z-50"
              >
                <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden max-h-[480px]">
                  {filteredProducts.length > 0 ? (
                    <>
                      <div className="px-5 py-3 border-b border-border bg-muted/30">
                        <p className="text-sm text-muted-foreground">
                          {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'}
                        </p>
                      </div>
                      <div className="overflow-y-auto max-h-[420px]">
                        {filteredProducts.map((product, index) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            onClick={() => setShowResults(false)}
                          >
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                            >
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={56}
                                  height={56}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground truncate text-sm">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {product.category}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-semibold text-primary">
                                  ${product.price.toFixed(2)}
                                </p>
                                {product.originalPrice && (
                                  <p className="text-xs text-muted-foreground line-through">
                                    ${product.originalPrice.toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                        <Search className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-foreground">No results found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
