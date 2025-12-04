import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ScrollToTop } from '@/components/scroll-to-top';
import { ProductSection } from '@/components/product-section';
import { fetchProductById, fetchAllProducts } from '@/lib/actions/products';
import { ProductDetails } from './product-details';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  // Fetch product and all products in parallel
  const [product, allProducts] = await Promise.all([
    fetchProductById(id),
    fetchAllProducts(),
  ]);

  if (!product) {
    notFound();
  }

  // Get related products from same category (excluding current product)
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 8);
  
  // If not enough related products, add some other products
  const moreProducts = relatedProducts.length < 4 
    ? allProducts.filter((p) => p.id !== product.id && !relatedProducts.some(r => r.id === p.id)).slice(0, 8 - relatedProducts.length)
    : [];
  
  const displayProducts = [...relatedProducts, ...moreProducts];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <section className="border-b border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/#products" className="hover:text-foreground transition-colors">
                Products
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">{product.name}</span>
            </nav>
          </div>
        </section>

        {/* Product Details - Client Component */}
        <ProductDetails product={product} />

        {/* Related Products Section */}
        {displayProducts.length > 0 && (
          <section className="border-t border-border/40">
            <ProductSection
              title="You May Also Like"
              subtitle="More from this collection"
              products={displayProducts}
            />
          </section>
        )}
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
