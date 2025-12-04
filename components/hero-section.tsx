'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    tag: 'New Collection',
    title: 'Professional',
    titleAccent: 'Grade Tools',
    description: 'Built for the craftsmen who demand excellence.',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1600&q=80',
    cta: 'Shop Now',
    link: '#featured',
    stats: [
      { value: '50K+', label: 'Products' },
      { value: '4.9', label: 'Rating' },
      { value: '24/7', label: 'Support' },
    ],
  },
  {
    id: 2,
    tag: 'Just Arrived',
    title: 'Workshop',
    titleAccent: 'Essentials',
    description: 'Precision instruments for modern professionals.',
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1600&q=80',
    cta: 'Explore',
    link: '#new-arrivals',
    stats: [
      { value: '100+', label: 'Brands' },
      { value: 'Free', label: 'Shipping' },
      { value: '30 Day', label: 'Returns' },
    ],
  },
  {
    id: 3,
    tag: 'Safety First',
    title: 'Protection',
    titleAccent: '& Gear',
    description: 'Premium protective equipment for every environment.',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1600&q=80',
    cta: 'View Collection',
    link: '#safety',
    stats: [
      { value: 'OSHA', label: 'Certified' },
      { value: '5 Year', label: 'Warranty' },
      { value: 'Pro', label: 'Grade' },
    ],
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(true);

  React.useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const slide = slides[currentSlide];

  return (
    <section className="relative min-h-[100svh] bg-foreground overflow-hidden">
      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      </AnimatePresence>

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      {/* Main Content */}
      <div className="relative z-10 min-h-[100svh] flex flex-col">
        {/* Top Bar */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-white/60">
                {slide.tag}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs text-white/40">
              <span className="font-mono">{String(currentSlide + 1).padStart(2, '0')}</span>
              <span>/</span>
              <span className="font-mono">{String(slides.length).padStart(2, '0')}</span>
            </div>
          </motion.div>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Left: Text Content */}
              <div className="order-2 lg:order-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.9] tracking-tight">
                      {slide.title}
                      <br />
                      <span className="text-primary">{slide.titleAccent}</span>
                    </h1>
                    
                    <p className="mt-6 text-lg sm:text-xl text-white/60 max-w-md leading-relaxed">
                      {slide.description}
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                      <Link
                        href={slide.link}
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all duration-300"
                      >
                        {slide.cta}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      
                      <Link
                        href="#featured"
                        className="group inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                      >
                        <span className="text-sm font-medium">Explore All</span>
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right: Stats */}
              <div className="order-1 lg:order-2 flex lg:justify-end">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="flex gap-8 sm:gap-12 lg:gap-16"
                  >
                    {slide.stats.map((stat, index) => (
                      <div key={index} className="text-center lg:text-left">
                        <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                          {stat.value}
                        </div>
                        <div className="mt-1 text-xs sm:text-sm text-white/40 uppercase tracking-wider">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
          <div className="flex items-end justify-between">
            {/* Slide Navigation */}
            <div className="flex items-center gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="group relative"
                >
                  <div className={`h-1 rounded-full transition-all duration-500 ${
                    index === currentSlide 
                      ? 'w-12 sm:w-16 bg-primary' 
                      : 'w-6 sm:w-8 bg-white/20 group-hover:bg-white/40'
                  }`} />
                </button>
              ))}
            </div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="hidden sm:flex flex-col items-center gap-2"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-px h-8 bg-white/20"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
