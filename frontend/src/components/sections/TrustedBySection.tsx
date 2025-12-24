'use client';

import { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface PartnerLogo {
  id: string;
  name: string;
  logo: string;
  width: number;
  height: number;
}

const partnerLogos: PartnerLogo[] = [
  {
    id: 'iosh',
    name: 'IOSH - Institution of Occupational Safety and Health',
    logo: '/accreditations/iosh.png',
    width: 80,
    height: 80,
  },
  {
    id: 'qualsafe',
    name: 'Qualsafe Awards',
    logo: '/accreditations/qualsafe.png',
    width: 80,
    height: 80,
  },
  {
    id: 'oshcr',
    name: 'OSHCR - Occupational Safety and Health Consultants Register',
    logo: '/accreditations/oshcr.png',
    width: 80,
    height: 80,
  },
  {
    id: 'ifsm',
    name: 'IFSM - Institute of Fire Safety Managers',
    logo: '/accreditations/ifsm.png',
    width: 80,
    height: 80,
  },
  {
    id: 'lra',
    name: 'LRA - Legionella Risk Assessment',
    logo: '/accreditations/lra.png',
    width: 80,
    height: 80,
  },
  {
    id: 'fit2fit',
    name: 'Fit2Fit - Face Fit Testing Accreditation',
    logo: '/accreditations/fit2fit.png',
    width: 80,
    height: 80,
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
            Accredited by Industry Leaders
          </h2>
          <p className="text-gray-600">
            Our courses and services are recognised by the UK&apos;s leading health and safety bodies
          </p>
        </motion.div>

        {/* Logo Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-8 lg:gap-12">
            {/* Duplicate logos for seamless loop */}
            {[...partnerLogos, ...partnerLogos].map((partner, index) => (
              <div
                key={`${partner.id}-${index}`}
                className="flex-[0_0_160px] min-w-0"
              >
                <motion.div
                  className="flex items-center justify-center h-24 bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all duration-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (index % partnerLogos.length) * 0.05 }}
                >
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={partner.width}
                    height={partner.height}
                    className="object-contain max-h-16 w-auto"
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
