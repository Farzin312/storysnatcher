'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './reusable';

function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-100 to-white flex flex-col justify-center items-center px-5 md:flex-row py-20 md:justify-between md:px-16">
      
      {/* Left Side - Text Content */}
      <div className="flex flex-col justify-center items-center text-center md:items-start md:text-left max-w-md md:max-w-xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-snug">
          The Ultimate AI Study Assistant
        </h1>

        <p className="mt-4 text-lg text-gray-700">
          Transcribe YouTube videos, generate summaries, flashcards, and quizzes — then get instant AI‑driven feedback on your quiz performance so you know exactly what to review next.
        </p>

        <div className="mt-6 space-y-3 text-gray-800 text-md">
          <h2 className="text-xl font-semibold">Built for Smarter Learning</h2>
          <p><strong>📄 Transcribe & Summarize:</strong> Turn any lecture, meeting, or video into concise, searchable notes.</p>
          <p><strong>🧠 Master Concepts:</strong> Create AI‑generated flashcards and quizzes — plus personalized feedback on strengths and areas to improve.</p>
          <p><strong>⏱️ Save Time:</strong> Skip manual note-taking and focus on learning, not formatting.</p>
        </div>

        <Button variant="default" className="mt-8 py-5 text-md rounded-3xl hover:scale-105 transition-transform duration-300 lg:mb-0">
          <Link href="/generate">
            Start Studying Smarter
          </Link>
        </Button>
      </div>

      {/* Right Side - Hero Image */}
      <div className="flex justify-center items-center flex-row md:mr-10 mt-10 md:mt-0">
        <Image
          src="/laptop.jpg"
          alt="AI-powered transcription, quiz generation, and feedback interface on laptop"
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
