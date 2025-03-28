'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './reusable';
import featuredData from '../data/featured.json';

const FeaturedServices = () => {
  return (
    <section className="w-full py-12 bg-white">
      <div className="max-w-6xl mx-auto text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Our Featured Services</h2>
        <p className="text-gray-600 mt-2 mx-10 md:mx-0">
          Discover how our AI‑powered tools can save you time and enhance your productivity.
        </p>
      </div>

      <div className="grid grid-cols-1 mx-12 md:mx-10 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {featuredData.map((service) => (
          <div
            key={service.id}
            className="flex flex-col justify-between items-center p-6 rounded-lg  hover:shadow-xl transition h-full min-h-[400px]"
          >
            {/* CONTENT */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative w-32 h-32">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover rounded-md"
                  unoptimized
                />
              </div>
              <h3 className="text-xl font-semibold">{service.title}</h3>
              <p className="text-gray-600 max-w-xs line-clamp-3">
                {service.description}
              </p>
            </div>

            {/* BUTTON */}
            <Button variant="default" className="mt-6 w-3/4">
              <Link href={service.url}>Explore {service.title}</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedServices;
