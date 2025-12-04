'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Michael Rodriguez',
    role: 'Professional Contractor',
    company: 'Rodriguez Construction',
    content: 'ToolCraft has been my go-to supplier for over 5 years. The quality of their tools is unmatched, and the customer service is exceptional. Every tool I\'ve purchased has exceeded my expectations.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'Master Carpenter',
    company: 'Chen Woodworks',
    content: 'As a craftsperson, I demand precision and reliability from my tools. ToolCraft delivers on both fronts. Their products have helped me elevate my craft and deliver exceptional results to my clients.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  },
  {
    id: 3,
    name: 'James Peterson',
    role: 'Industrial Mechanic',
    company: 'Peterson Industrial Services',
    content: 'I\'ve been in this industry for 20 years, and ToolCraft tools are the best investment I\'ve made. They\'re durable, efficient, and designed with professionals in mind. Highly recommended!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  },
  {
    id: 4,
    name: 'Emily Watson',
    role: 'DIY Enthusiast & Renovator',
    company: 'Watson Home Renovations',
    content: 'I started my home renovation journey with ToolCraft tools and haven\'t looked back. The quality is professional-grade, yet the tools are user-friendly enough for someone learning the trade.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
  },
  {
    id: 5,
    name: 'David Kumar',
    role: 'Factory Manager',
    company: 'Kumar Manufacturing Co.',
    content: 'We outfitted our entire workshop with ToolCraft equipment. The investment has paid off tremendously in terms of productivity and reduced maintenance costs. Their tools just work, day in and day out.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
  },
];

export function TestimonialSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-foreground/2 grain">
      <div className="container mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center space-y-4"
        >
          <span className="inline-block text-sm font-medium uppercase tracking-wider text-primary">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what professionals and enthusiasts have to say about ToolCraft.
          </p>
          <div className="mx-auto h-1 w-24 bg-primary rounded-full" />
        </motion.div>

        {/* Testimonials carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={testimonial.id}
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="h-full"
                  >
                    <Card className="h-full border-border/50 bg-white hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden">
                      <CardContent className="p-4 sm:p-6 md:p-8 flex flex-col h-full">
                        {/* Quote icon */}
                        <div className="mb-4 sm:mb-6">
                          <Quote className="h-8 w-8 sm:h-10 sm:w-10 text-primary/20 fill-primary/20" />
                        </div>

                        {/* Testimonial content */}
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6 flex-1">
                          &quot;{testimonial.content}&quot;
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-4 sm:mb-6">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 sm:h-5 sm:w-5 text-primary fill-primary"
                            />
                          ))}
                        </div>

                        {/* Author info */}
                        <div className="flex items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-border/50">
                          <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden bg-secondary shrink-0">
                            <Image
                              src={testimonial.image}
                              alt={testimonial.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <p className="text-sm sm:text-base font-semibold text-foreground">
                              {testimonial.name}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {testimonial.role}
                            </p>
                            <p className="text-xs text-muted-foreground/80">
                              {testimonial.company}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Controls - Right aligned for all screens */}
            <div className="flex justify-end gap-2 mt-8">
              <CarouselPrevious className="static translate-x-0 border-2 border-foreground/10 bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300" />
              <CarouselNext className="static translate-x-0 border-2 border-foreground/10 bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300" />
            </div>
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
