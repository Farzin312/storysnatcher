import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './reusable';
import featuredData from '../data/featured.json';

const FeaturedServices = () => {
  return (
    <article className="relative w-full overflow-hidden py-6 mt-10">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Our Featured Services</h2>
        <p className="text-gray-600 mt-2 mx-6 md:mx-0">Discover how our AI-powered tools can save you time and enhance your productivity.</p>
      </div>

      <div className="flex items-center animate-marquee">
        {featuredData.concat(featuredData).map((service, index) => (
          <div
            key={index}
            className="flex flex-col justify-center items-center flex-shrink-0 w-[300px] min-h-[400px] mx-4 p-4 text-center border border-gray-200 rounded-lg hover:shadow-xl transition"
          >
            <Image
              src={service.image}
              alt={service.title}
              width={150}
              height={150}
              className="rounded-md object-cover"
              unoptimized
            />
            <h3 className="text-xl font-bold mt-4">{service.title}</h3>
            <p className="text-gray-600 mt-2">{service.description}</p>
            <Button className="mt-4" variant="default">
              <Link href={service.url}>
                Explore {service.title}
              </Link>
            </Button>    
          </div>
        ))}
      </div>
    </article>
  );
};

export default FeaturedServices;
