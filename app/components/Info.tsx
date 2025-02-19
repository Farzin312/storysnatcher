'use client';

import React, { useState } from 'react';
import infoData from '@/app/data/info.json';
import {
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
} from 'react-icons/fi';

interface FAQItem {
  question: string;
  answer: string;
}

interface InfoDataItem {
  section: string;
  points?: string[];
  faqs?: FAQItem[];
}

const Info = () => {
  const data = infoData as InfoDataItem[];
  const whyUs = data.find((item) => item.section === 'Why Us');
  const faq = data.find((item) => item.section === 'FAQ');

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="w-full bg-gradient-to-b from-blue-50 to-white pb-12 pt-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Main Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Essential AI Insights & Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto text-sm md:text-base mt-2">
            Enhance your content creation with these robust features, and see if we’ve answered your queries below.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* LEFT COLUMN: WHY US */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold text-teal-700">
              Essential AI-Powered Benefits
            </h3>
            {whyUs?.points?.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-gradient-to-r from-white via-teal-50 to-white
                           rounded-md shadow-sm hover:shadow-md transition-all border border-teal-100"
              >
                <FiCheckCircle className="text-teal-600 text-lg mt-1" />
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN: FAQ */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold text-teal-700">
              Answers to Your Questions
            </h3>
            {faq?.faqs?.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-md shadow-sm hover:shadow-md transition-all border border-gray-200"
                >
                  <button
                    className={`flex justify-between items-center w-full p-3 text-left text-sm md:text-base font-medium
                                ${isOpen ? 'bg-teal-50' : 'hover:bg-teal-50'} transition-all text-gray-900`}
                    onClick={() => toggleFAQ(idx)}
                  >
                    <span>{item.question}</span>
                    {isOpen ? (
                      <FiChevronUp className="text-teal-600" />
                    ) : (
                      <FiChevronDown className="text-teal-600" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-2 text-xs md:text-sm text-gray-700 border-t border-gray-200">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Info;
