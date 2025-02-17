'use client';

import React from 'react';
import Image from 'next/image';
import showcaseData from '@/app/data/showcase.json';

const Showcase = () => {
  return (
    <section className="w-full py-16 px-5">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center mb-12">
          Who Benefits from Story Snatcher?
        </h2>

        {showcaseData.map((item) => (
          <div
            key={item.id}
            className="flex flex-col md:flex-row items-center gap-6 mb-12 p-6
                       bg-gradient-to-tr from-blue-50 to-white rounded-xl shadow-md
                       hover:shadow-xl transition-shadow duration-300"
          >           
            <div className="w-full md:w-1/2 flex justify-center">
              <Image
                src={item.image}
                alt={item.title}
                width={500}
                height={500}
                className="rounded-xl"
                unoptimized
              />
            </div>

            <div className="w-full md:w-1/2 mt-4 md:mt-0">
              <h3 className="text-2xl font-bold text-gray-800">
                {item.title}
              </h3>
              <p className="mt-4 text-gray-700">
                {item.paragraph}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Showcase;
