'use client';

import { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ClientLogo {
  id: string;
  name: string;
  logo: string;
}

const clientLogos: ClientLogo[] = [
  {
    id: '1',
    name: 'Construction Solutions Ltd',
    logo: 'https://via.placeholder.com/200x80/f3f4f6/6b7280?text=Construction+Solutions',
  },
  {
    id: '2',
    name: 'Manufacturing Excellence UK',
    logo: 'https://via.placeholder.com/200x80/f3f4f6/6b7280?text=Manufacturing+UK',
  },
  {
    id: '3',
    name: 'Global Logistics Group',
    logo: 'https://via.placeholder.com/200x80/f3f4f6/6b7280?text=Global+Logistics',
  },
  {
    id: '4',
    name: 'Energy Solutions plc',
    logo: 'https://via.placeholder.com/200x80/f3f4f6/6b7280?text=Energy+Solutions',
  },
  {
    id: '5',
    name: 'Retail Management Services',
    logo: 'https://via.placeholder.com/200x80/f3f4f6/6b7280?text=Retail+Services',
  },
  {
    id: '6',
    name: 'Healthcare Trust',
    logo: 'https://via.placeholder.com/200x80/f3f4f6/6b7280?text=Healthcare+Trust',
  },
  {
    id: '7',
    name: 'Transport Group',
    logo: 'https://via.placeholder.com/200x80/f3f4f6/6b7280?text=Transport+Group',
  },
  {
    id: '8',
    name: 'Technology Services Ltd',
    logo: 'https://via.placeholder.com/200x80/f3f4f6/6b7280?text=Tech+Services',
  },
];

export function TrustedBySection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);

    return () => clearInterval(autoplay);
  }, [emblaApi]);

  return (
    <section className="py-16 lg:py-20 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Trusted by Leading Organizations
          </h2>
          <p className="text-gray-600">
            Delivering excellence in health, safety, and environmental training
          </p>
        </motion.div>

        {/* Logo Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-8 lg:gap-12">
            {/* Duplicate logos for seamless loop */}
            {[...clientLogos, ...clientLogos].map((client, index) => (
              <div
                key={`${client.id}-${index}`}
                className="flex-[0_0_200px] min-w-0"
              >
                <motion.div
                  className="flex items-center justify-center h-20 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.6 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (index % clientLogos.length) * 0.05 }}
                >
                  <Image
                    src={client.logo}
                    alt={client.name}
                    width={200}
                    height={80}
                    className="object-contain"
                  />
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>500+ Organizations Served</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>UK Nationwide Coverage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Industry-Leading Expertise</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
