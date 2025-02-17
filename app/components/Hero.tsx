import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './reusable';

function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-100 to-white flex flex-col justify-center items-center px-5 md:flex-row py-20 md:justify-between md:px-16">
      <div className="flex flex-col justify-center items-center text-center md:items-start md:text-left max-w-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Save Time & Boost Content Creation with AI-Powered Video Summaries
        </h1>
        <p className="mt-8 text-lg text-gray-700">
          Story Snatcher helps you generate accurate video summaries, voiceovers, and downloadable transcripts in seconds. Create engaging content effortlessly with the power of AI.
        </p>
        <Button variant='default' className='mt-14 py-6 mb-10 text-md rounded-3xl hover:scale-105 transition-transform duration-300 lg:mb-0'>
          <Link href='/generate'>
          Generate Now
          </Link>
          </Button>
      </div>

      <div className="flex justify-center items-center flex-row md:mr-10">
        <Image
          src="laptop.jpg"
          alt="AI Video Summarization in Action"
          width={400}
          height={450}
          className="rounded-2xl shadow-md"
          unoptimized
        />
      </div>
    </section>
  );
}

export default Hero;
