'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './reusable';
import steps from '../data/steps.json';

const Guide = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isMobile, setIsMobile] = useState(false);
  const [showStaticImage, setShowStaticImage] = useState(true);

  // Detect if the user is on mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handles click-based interactions for mobile
  const handleInteraction = (stepId: number) => {
    if (isMobile) {
      setActiveStep((prev) => (prev === stepId ? 1 : stepId));
    }
  };

  // Hover to switch steps, maintaining the last hovered step as active
  const handleHover = (stepId: number) => {
    if (!isMobile) setActiveStep(stepId);
  };

  // Handle GIF hover
  const handleGifHover = () => {
    setShowStaticImage(false);
    // Reset the GIF after 5 seconds (or the length of your GIF)
    setTimeout(() => setShowStaticImage(true), 5000);
  };

  return (
    <section className="w-full py-10 px-10">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Step-by-Step Guide to Generating Content</h2>
        <p className="text-gray-600 mt-2 mx-4 md:mx-0">Follow these steps to generate your content with ease.</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* GIF container */}
        <div
          className="w-full flex justify-center items-center md:w-1/2 relative cursor-pointer"
          onMouseEnter={handleGifHover}
        >
          {showStaticImage ? (
            <>
              <Image
                src="/demo-animation-placeholder.png"
                alt="Guide Placeholder"
                width={500}
                height={500}
                className="rounded-xl"
                unoptimized
              />
              <div className="absolute top-2/3 left-1/2 transform -translate-x-1/2">
                <Button variant='outline' className="px-4 py-2 text-sm rounded-lg bg-gray-200">
                  {isMobile? 'Click to play' : 'Hover to play'}
                </Button>
              </div>
            </>
          ) : (
            <Image
              src="/demo-animation.gif"
              alt="Guide Demo"
              width={500}
              height={500}
              className="rounded-xl"
              unoptimized
            />
          )}
        </div>

        <div className="w-full md:w-1/2 flex flex-col">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`mb-3 rounded-2xl transition-all cursor-pointer ${
                activeStep === step.id ? 'bg-gradient-to-br from-blue-100 to-white p-4 shadow-sm' : ''
              }`}
              onMouseEnter={() => handleHover(step.id)}
              onClick={() => handleInteraction(step.id)}
            >
              <div className="flex items-center md:items-start gap-4">
                <span
                  className={`text-3xl font-extrabold ${
                    activeStep === step.id ? 'text-blue-600 scale-125' : 'text-gray-500 px-5 md:px-0'
                  } transition-all`}
                >
                  {step.id}
                </span>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  {activeStep === step.id && (
                    <p className="text-gray-700 my-2">{step.description}</p>
                  )}
                </div>
              </div>

              {step.id === 1 && activeStep === 1 && (
                <div className="mt-4">
                  <Button variant="default">
                    <Link href="/generate">Generate</Link>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Guide;
