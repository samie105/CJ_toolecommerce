'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Truck, HeadphonesIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
  {
    icon: Zap,
    title: 'Premium Quality',
    description: 'Professional-grade tools engineered for precision and durability.',
  },
  {
    icon: Shield,
    title: 'Warranty Protection',
    description: 'Comprehensive warranty coverage on all products for your peace of mind.',
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    description: 'Free expedited shipping on orders over $100. Get your tools fast.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Expert Support',
    description: '24/7 customer service from experienced tool specialists.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-border/50 grain">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Card className="h-full p-6 border-none shadow-none bg-transparent hover:bg-foreground/2 transition-colors duration-300">
                  <div className="flex flex-col items-center text-center space-y-3">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <h3 className="text-base font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
