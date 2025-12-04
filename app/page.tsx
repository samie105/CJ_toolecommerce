import { Suspense } from 'react';
import { Navbar } from '@/components/navbar';
import { HeroSection } from '@/components/hero-section';
import { ProductSection } from '@/components/product-section';
import { SearchSection } from '@/components/search-section';
import { Footer } from '@/components/footer';
import { ScrollToTop } from '@/components/scroll-to-top';
import { ProductSectionSkeleton } from '@/components/product-card-skeleton';
import { fetchAllProducts, fetchCategories } from '@/lib/actions/products';

// Server component to fetch and display search section with categories
async function SearchSectionWithData() {
  const [products, categories] = await Promise.all([
    fetchAllProducts(),
    fetchCategories()
  ]);
  
  return <SearchSection products={products} categories={categories} />;
}

// Server component to fetch and display featured products
async function FeaturedProductsSection() {
  const allProducts = await fetchAllProducts();
  const featured = allProducts.filter((p) => p.isFeatured).slice(0, 8);
  
  // If no featured products, get first 8
  const products = featured.length > 0 ? featured : allProducts.slice(0, 8);
  
  return (
    <ProductSection
      title="Featured Products"
      subtitle="Best Sellers"
      products={products}
    />
  );
}

// Server component for new arrivals
async function NewArrivalsSection() {
  const allProducts = await fetchAllProducts();
  const newProducts = allProducts.filter((p) => p.isNew).slice(0, 8);
  
  // If no new products, get products 4-12
  const products = newProducts.length > 0 ? newProducts : allProducts.slice(4, 12);
  
  return (
    <ProductSection
      title="New Arrivals"
      subtitle="Just In"
      products={products}
    />
  );
}

// Server component for category products
async function CategorySection({ 
  category, 
  title, 
  subtitle 
}: { 
  category: string; 
  title: string; 
  subtitle: string; 
}) {
  const allProducts = await fetchAllProducts();
  const categoryProducts = allProducts.filter((p) => 
    p.category.toLowerCase().includes(category.toLowerCase())
  ).slice(0, 8);
  
  // If no products in this category, show some other products
  const products = categoryProducts.length > 0 ? categoryProducts : allProducts.slice(0, 6);
  
  return (
    <ProductSection
      title={title}
      subtitle={subtitle}
      products={products}
    />
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div id="home">
          <HeroSection />
        </div>
        <Suspense fallback={<div className="py-16" />}>
          <SearchSectionWithData />
        </Suspense>
        <div id="featured">
          <Suspense fallback={<ProductSectionSkeleton count={5} />}>
            <FeaturedProductsSection />
          </Suspense>
        </div>
        <div id="new-arrivals">
          <Suspense fallback={<ProductSectionSkeleton count={5} />}>
            <NewArrivalsSection />
          </Suspense>
        </div>
        <div id="workshop">
          <Suspense fallback={<ProductSectionSkeleton count={5} />}>
            <CategorySection 
              category="workshop" 
              title="Workshop Essentials"
              subtitle="Set Up a World-Class Shop"
            />
          </Suspense>
        </div>
        <div id="safety">
          <Suspense fallback={<ProductSectionSkeleton count={5} />}>
            <CategorySection 
              category="safety" 
              title="Safety & Protection"
              subtitle="Engineered for Everyday Protection"
            />
          </Suspense>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
