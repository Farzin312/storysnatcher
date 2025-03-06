import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './reusable';

function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-100 to-white flex flex-col justify-center items-center px-5 md:flex-row py-20 md:justify-between md:px-16">
      
      {/* Left Side */}
      <div className="flex flex-col justify-center items-center text-center md:items-start md:text-left max-w-md md:max-w-lg">
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-snug">
          AI-Powered  
          <br />
          Learning Tools  
          <br />
          for Smarter Studying
        </h1>

        <p className="mt-6 text-lg text-gray-700">
          Convert lectures, meetings, and videos into transcripts, summaries,  
          flashcards, and quizzes—built for efficiency and retention.
        </p>

        <div className="mt-6 space-y-3 text-gray-800 text-md">
          <h2 className="text-lg font-semibold">💡 Why Use This?</h2>
          <p><strong>Stay Organized:</strong> Get structured summaries & notes instantly.</p>
          <p><strong>Study Smarter:</strong> AI-generated flashcards & quizzes optimize learning.</p>
          <p><strong>Save Time:</strong> Focus on learning, not note-taking.</p>
        </div>

        <Button variant='default' className='mt-8 py-5 text-md rounded-3xl hover:scale-105 transition-transform duration-300 lg:mb-0'>
          <Link href='/generate'>
            Get Started
          </Link>
        </Button>
      </div>

      {/* Right Side */}
      <div className="flex justify-center items-center flex-row md:mr-10 mt-10 md:mt-0">
        <Image
          src="laptop.jpg"
          alt="AI Learning and Study Tool"
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
