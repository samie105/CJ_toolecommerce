'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, LayoutDashboard, LogOut, Search, Package, Loader2 } from 'lucide-react';
import { CartSheet } from '@/components/cart-sheet';
import { useAuth } from '@/components/auth-context';
import { toast } from 'sonner';

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('home');
  const [orderSearchQuery, setOrderSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [showOrderSearch, setShowOrderSearch] = React.useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  
  const isHomePage = pathname === '/';

  const handleOrderSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderSearchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Navigate to order tracking/checkout page with order ID
      router.push(`/order/${orderSearchQuery.trim()}`);
      setOrderSearchQuery('');
      setShowOrderSearch(false);
    } catch {
      toast.error('Order not found');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50);
  });

  const navItems = React.useMemo(() => [
    { label: 'Home', href: '#home', id: 'home' },
    { label: 'Featured', href: '#featured', id: 'featured' },
    { label: 'New Arrivals', href: '#new-arrivals', id: 'new-arrivals' },
    { label: 'Workshop', href: '#workshop', id: 'workshop' },
    { label: 'Safety', href: '#safety', id: 'safety' },
  ], []);

  React.useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const sections = navItems.map(item => item.id);
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage, navItems]);

  const navigateToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (!isHomePage) {
      router.push(`/${href}`);
    } else {
      if (id === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById(id);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  React.useEffect(() => {
    if (isHomePage && window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [isHomePage]);

  const shouldHaveBackground = !isHomePage || isScrolled;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        shouldHaveBackground
          ? 'bg-background/95 backdrop-blur-lg border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className={`text-lg sm:text-xl font-semibold tracking-tight ${
              shouldHaveBackground ? 'text-foreground' : 'text-white'
            }`}>
              ToolCraft
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = isHomePage && activeSection === item.id;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => navigateToSection(e, item.href, item.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? shouldHaveBackground
                        ? 'text-primary bg-primary/10'
                        : 'text-white bg-white/15'
                      : shouldHaveBackground
                      ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Order Search */}
            <div className="relative hidden sm:block">
              {showOrderSearch ? (
                <motion.form 
                  initial={{ opacity: 0, width: 0, scale: 0.8 }}
                  animate={{ opacity: 1, width: 'auto', scale: 1 }}
                  exit={{ opacity: 0, width: 0, scale: 0.8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  onSubmit={handleOrderSearch} 
                  className="flex items-center gap-2 origin-right"
                >
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    <Input
                      placeholder="Enter Order ID..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-40 h-9 text-sm"
                      autoFocus
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15, duration: 0.2 }}
                    className="flex items-center gap-1"
                  >
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSearching}
                      className="h-9"
                    >
                      {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOrderSearch(false)}
                      className="h-9"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </motion.form>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowOrderSearch(true)}
                  className={`h-9 w-9 ${
                    shouldHaveBackground
                      ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Package className="h-4 w-4" />
                </Button>
              )}
            </div>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full h-9 w-9 ${
                      shouldHaveBackground
                        ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/history" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full h-9 px-4 ${
                      shouldHaveBackground
                        ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Log in
                  </Button>
                </Link>

                <Link href="/signup" className="hidden sm:block">
                  <Button
                    size="sm"
                    className="rounded-full h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Sign up
                  </Button>
                </Link>
              </>
            )}

            <CartSheet triggerClassName={shouldHaveBackground ? 'text-foreground hover:text-primary' : 'text-white hover:text-white'} />

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={`lg:hidden h-9 w-9 ${
                shouldHaveBackground 
                  ? 'text-foreground hover:text-primary hover:bg-muted' 
                  : 'text-white hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          height: isMobileMenuOpen ? 'auto' : 0,
          opacity: isMobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden lg:hidden bg-background border-t border-border"
      >
        <div className="container mx-auto px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = isHomePage && activeSection === item.id;
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => navigateToSection(e, item.href, item.id)}
                className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </a>
            );
          })}
          {/* Order Search Mobile */}
          <form onSubmit={handleOrderSearch} className="flex items-center gap-2 pt-2">
            <Input
              placeholder="Search Order ID..."
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              className="flex-1 h-11 rounded-xl"
            />
            <Button type="submit" disabled={isSearching} className="h-11 rounded-xl">
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>
          
          <div className="pt-4 mt-2 border-t border-border flex gap-2">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-11 rounded-xl">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="h-11 rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-11 rounded-xl">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}
