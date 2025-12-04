export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  sku?: string;
  description?: string;
  longDescription?: string;
  specs?: string[];
  features?: {
    icon: string;
    title: string;
    description: string;
  }[];
  included?: string[];
  isFeatured?: boolean;
  isNew?: boolean;
}

export const allProducts: Product[] = [
  {
    id: '1',
    name: 'Professional Cordless Drill Kit',
    price: 249.99,
    originalPrice: 299.99,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80',
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1200&q=80',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1200&q=80',
    ],
    category: 'Power Tools',
    badge: 'Best Seller',
    rating: 4.8,
    reviewCount: 342,
    inStock: true,
    sku: 'DRL-PRO-2024',
    description:
      'A high-torque cordless drill kit engineered for professional contractors. Includes two long-life lithium-ion batteries, fast charger, and precision bit set.',
    longDescription:
      'Built with aerospace-grade materials and precision engineering, this drill delivers consistent torque across demanding applications. The brushless motor system provides up to 50% longer runtime and increased power efficiency compared to traditional brushed motors. Ideal for both heavy construction and precision assembly work.',
    specs: [
      'Brushless motor with up to 1,800 RPM',
      'Two 5.0Ah lithium-ion batteries included',
      'All-metal 1/2" ratcheting chuck',
      'Integrated LED work light with delay feature',
      '21+1 clutch settings for precision control',
      'Variable speed trigger with electronic brake',
    ],
    features: [
      {
        icon: 'Zap',
        title: 'High Performance',
        description: 'Brushless motor delivers 50% more power and runtime',
      },
      {
        icon: 'ShieldCheck',
        title: 'Professional Durability',
        description: 'All-metal construction for maximum job site reliability',
      },
      {
        icon: 'Award',
        title: 'Industry Leading',
        description: 'Rated #1 by professional contractors 3 years running',
      },
    ],
    included: [
      'Cordless drill/driver',
      'Two 5.0Ah lithium-ion batteries',
      'Fast charger (60 min full charge)',
      '32-piece precision bit set',
      'Heavy-duty carrying case',
      'Belt clip and auxiliary handle',
    ],
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Precision Angle Grinder',
    price: 179.99,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80',
      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1200&q=80',
    ],
    category: 'Power Tools',
    badge: 'Pro Grade',
    rating: 4.6,
    reviewCount: 189,
    inStock: true,
    sku: 'ANG-GRND-PRO',
    description:
      'A compact, powerful angle grinder designed for demanding metal fabrication and cutting applications.',
    longDescription:
      'Engineered for precision metalwork and fabrication, this angle grinder combines a powerful motor with advanced electronics to deliver consistent performance under load. The slim body design reduces operator fatigue during extended use.',
    specs: [
      '9,000 RPM brushless motor',
      'Ergonomic slim body grip',
      'Tool-less guard adjustment',
      'Electronic overload protection',
      'Soft-start technology',
      'Auto-shutoff on overload',
    ],
    features: [
      {
        icon: 'Zap',
        title: 'Consistent Power',
        description: 'Electronic regulation maintains speed under load',
      },
      {
        icon: 'ShieldCheck',
        title: 'Enhanced Safety',
        description: 'Multiple protection systems and kickback brake',
      },
      {
        icon: 'Award',
        title: 'Ergonomic Design',
        description: 'Reduced vibration and optimized grip balance',
      },
    ],
    included: [
      'Angle grinder',
      'Side handle',
      'Guard',
      'Spanner wrench',
      'Carrying case',
    ],
    isFeatured: true,
  },
  {
    id: '3',
    name: 'Heavy Duty Hammer Drill',
    price: 329.99,
    originalPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1200&q=80',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1200&q=80',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80',
    ],
    category: 'Power Tools',
    badge: 'Heavy Duty',
    rating: 4.9,
    reviewCount: 276,
    inStock: true,
    sku: 'HMR-DRL-HD',
    description:
      'Industrial-grade hammer drill for concrete, masonry, and heavy construction applications. Features advanced anti-vibration system.',
    longDescription:
      'This heavy-duty hammer drill is built for the toughest job sites. With a powerful motor and advanced vibration dampening technology, it delivers exceptional performance in concrete, brick, and stone without sacrificing user comfort.',
    specs: [
      'Powerful 12-amp motor with 2,900 RPM',
      'Advanced anti-vibration system reduces fatigue',
      '1-1/8" SDS-Plus chuck system',
      '3 operating modes: drill, hammer drill, chisel',
      'Variable speed with lock-on button',
      'Depth gauge and side handle included',
    ],
    features: [
      {
        icon: 'Zap',
        title: 'Maximum Power',
        description: 'Industry-leading impact energy for fastest drilling',
      },
      {
        icon: 'ShieldCheck',
        title: 'Reduced Vibration',
        description: 'Advanced dampening system protects hands and wrists',
      },
      {
        icon: 'Award',
        title: 'Versatile Performance',
        description: 'Three modes handle any drilling or chiseling task',
      },
    ],
    included: [
      'Hammer drill',
      'Side handle with depth stop',
      '6-piece SDS-Plus bit set',
      'Heavy-duty carrying case',
      'Grease and maintenance kit',
    ],
    isFeatured: true,
  },
  {
    id: '4',
    name: 'Multi-Tool Oscillating Set',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1200&q=80',
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
    ],
    category: 'Power Tools',
    badge: 'Versatile',
    rating: 4.7,
    reviewCount: 158,
    inStock: true,
    sku: 'MLT-OSC-PRO',
    description:
      'Precision oscillating multi-tool with universal accessory system. Perfect for cutting, sanding, scraping, and detail work.',
    longDescription:
      'This versatile oscillating tool handles dozens of applications with precision and control. The universal accessory system accepts blades from all major brands, and the variable speed control provides perfect results on any material.',
    specs: [
      'Variable speed: 8,000-20,000 OPM',
      'Universal accessory mounting system',
      'Tool-free blade change in seconds',
      '3.5-degree oscillation angle',
      'Integrated LED work light',
      'Ergonomic soft-grip handle',
    ],
    features: [
      {
        icon: 'Zap',
        title: 'Ultimate Versatility',
        description: 'One tool for cutting, sanding, scraping, and more',
      },
      {
        icon: 'ShieldCheck',
        title: 'Universal Compatibility',
        description: 'Works with accessories from all major brands',
      },
      {
        icon: 'Award',
        title: 'Precision Control',
        description: 'Variable speed dial for perfect results every time',
      },
    ],
    included: [
      'Oscillating multi-tool',
      '28-piece accessory kit',
      'Wood cutting blades (3)',
      'Metal cutting blades (2)',
      'Sanding pads and sheets',
      'Scraper attachments',
      'Carrying case',
    ],
    isFeatured: true,
  },
  {
    id: '5',
    name: 'Professional Jigsaw',
    price: 159.99,
    originalPrice: 189.99,
    image: 'https://images.unsplash.com/photo-1590587784838-ce8ec8c0b8dd?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1590587784838-ce8ec8c0b8dd?w=1200&q=80',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80',
    ],
    category: 'Power Tools',
    rating: 4.5,
    reviewCount: 124,
    inStock: true,
    sku: 'JGS-PRO-001',
    description:
      'High-precision jigsaw with orbital action for fast, smooth cuts in wood, metal, and plastic. Tool-free blade change system.',
    longDescription:
      'Experience professional-grade cutting performance with this precision jigsaw. Four orbital settings provide optimal cutting speed and finish quality for any material, while the tool-free blade change system keeps you productive.',
    specs: [
      'Variable speed: 500-3,000 SPM',
      '4-stage orbital action settings',
      'Tool-free blade change system',
      'Bevel cuts up to 45 degrees',
      'Dust blower keeps line visible',
      'Anti-splinter insert for clean cuts',
    ],
    features: [
      {
        icon: 'Zap',
        title: 'Fast Cutting',
        description: 'Orbital action cuts up to 40% faster than standard',
      },
      {
        icon: 'ShieldCheck',
        title: 'Precision Results',
        description: 'Variable speed and guide system for accurate cuts',
      },
      {
        icon: 'Award',
        title: 'User Friendly',
        description: 'Tool-free adjustments and blade changes save time',
      },
    ],
    included: [
      'Professional jigsaw',
      '10-piece blade assortment',
      'Anti-splinter insert',
      'Dust extraction adapter',
      'Carrying case',
    ],
    isFeatured: true,
  },
  {
    id: '6',
    name: 'Compact Impact Driver',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1200&q=80',
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
    ],
    category: 'Power Tools',
    badge: 'New Arrival',
    rating: 4.6,
    reviewCount: 89,
    inStock: true,
    sku: 'IMP-DRV-CMP',
    description:
      'Compact yet powerful impact driver with precision mode for delicate fastening. Includes two batteries and fast charger.',
    longDescription:
      'This compact impact driver packs serious power into a lightweight design. The precision mode prevents over-torquing on delicate materials, while the standard mode delivers 1,800 in-lbs of torque for demanding applications.',
    specs: [
      '1,800 in-lbs max torque',
      'Precision mode for delicate work',
      '3-speed transmission: 0-1,100/2,800/3,600 RPM',
      'Two 2.0Ah batteries included',
      'Quick-release 1/4" hex chuck',
      'Integrated work light',
    ],
    features: [
      {
        icon: 'Zap',
        title: 'Compact Power',
        description: 'Lightweight design with professional-level torque',
      },
      {
        icon: 'ShieldCheck',
        title: 'Precision Mode',
        description: 'Prevents over-tightening on sensitive materials',
      },
      {
        icon: 'Award',
        title: 'All-Day Runtime',
        description: 'Two batteries keep you working without interruption',
      },
    ],
    included: [
      'Compact impact driver',
      'Two 2.0Ah batteries',
      'Fast charger (45 min)',
      '10-piece driver bit set',
      'Belt clip',
      'Carrying bag',
    ],
    isNew: true,
  },
  {
    id: '7',
    name: 'Laser Distance Measure',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200&q=80',
    ],
    category: 'Measuring Tools',
    badge: 'New Arrival',
    rating: 4.8,
    reviewCount: 203,
    inStock: true,
    sku: 'LSR-DST-001',
    description:
      'Professional laser distance measurer with 200ft range. Calculate area, volume, and indirect heights with precision.',
    longDescription:
      'Take the guesswork out of measurements with this professional laser tool. Accurate to 1/16 inch over 200 feet, it handles complex calculations instantly and stores up to 20 measurements for easy reference.',
    specs: [
      'Measuring range: up to 200 feet',
      'Accuracy: ±1/16 inch',
      'Area and volume calculations',
      'Indirect height measurement',
      'Stores 20 measurements',
      'Backlit display for low light',
    ],
    features: [
      {
        icon: 'Zap',
        title: 'Instant Accuracy',
        description: 'Precise measurements in seconds, every time',
      },
      {
        icon: 'ShieldCheck',
        title: 'Smart Calculations',
        description: 'Automatic area, volume, and height calculations',
      },
      {
        icon: 'Award',
        title: 'Professional Grade',
        description: 'Trusted by contractors and architects worldwide',
      },
    ],
    included: [
      'Laser distance measure',
      'Protective carry case',
      'AAA batteries (2)',
      'Wrist strap',
      'Quick start guide',
    ],
    isNew: true,
  },
  {
    id: '8',
    name: 'Digital Level Pro',
    price: 119.99,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80',
    ],
    category: 'Measuring Tools',
    badge: 'New Arrival',
    rating: 4.7,
    reviewCount: 167,
    inStock: true,
    sku: 'DIG-LVL-PRO',
    description:
      '24-inch digital level with precision sensors. Displays angles, pitch, and level with 0.1-degree accuracy.',
    longDescription:
      'This professional digital level combines traditional bubble vials with high-precision electronic sensors for the ultimate in leveling accuracy. Perfect for installation, construction, and precision alignment work.',
    specs: [
      '24-inch anodized aluminum frame',
      'Accuracy: ±0.1 degrees',
      'Digital display shows angles and pitch',
      'Audio level alert',
      'Magnetic base with V-groove',
      'Water and dust resistant (IP54)',
    ],
    features: [
      {
        icon: 'Zap',
        title: 'Dual System',
        description: 'Traditional vials plus digital precision',
      },
      {
        icon: 'ShieldCheck',
        title: 'Audio Alert',
        description: 'Beeps when perfectly level or plumb',
      },
      {
        icon: 'Award',
        title: 'Durable Build',
        description: 'Anodized aluminum survives harsh job sites',
      },
    ],
    included: [
      'Digital level',
      'Protective carry bag',
      'AAA batteries (2)',
      'Calibration certificate',
      'User manual',
    ],
    isNew: true,
  },
];

// Helper function to get a product by ID
export function getProductById(id: string): Product | undefined {
  return allProducts.find((product) => product.id === id);
}

// Helper function to get featured products
export function getFeaturedProducts(): Product[] {
  return allProducts.filter((product) => product.isFeatured);
}

// Helper function to get new arrivals
export function getNewArrivals(): Product[] {
  return allProducts.filter((product) => product.isNew);
}

// Helper function to get products by category
export function getProductsByCategory(category: string): Product[] {
  return allProducts.filter((product) => product.category === category);
}
