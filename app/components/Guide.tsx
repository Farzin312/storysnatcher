'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './reusable';
import steps from '../data/steps.json';

const Guide = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <section className="w-full py-10 px-10">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Step-by-Step Guide to Generating Content</h2>
        <p className="text-gray-600 mt-2 mx-4 md:mx-0">Follow these steps to generate your content with ease.</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-full justify-center items-center md:w-1/2">
            <Image
              src="/images/demo-animation.gif"
              alt="Guide Demo"
              width={700}
              height={500}
            />
        </div>

        <div className="w-full md:w-1/2 flex flex-col">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`mb-3 rounded-2xl transition-all cursor-pointer ${
                activeStep === step.id ? 'bg-blue-50 shadow-lg p-4' : ''
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
