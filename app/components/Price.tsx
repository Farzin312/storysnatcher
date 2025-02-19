'use client';

import React from 'react';
import priceData from '@/app/data/price.json';
import { Button } from './reusable';

const Price = () => {
  const getIcon = (text: string) => {
    if (text.toLowerCase().includes('no')) {
      return <span className="mr-2 text-red-500">✗</span>;
    }
    if (text.toLowerCase().includes('limited') || text.match(/\b\d+\b/)) {
      return <span className="mr-2 text-orange-500">🔶</span>;
    }
    return <span className="mr-2 text-green-600">✓</span>;
  };

  const getCardStyle = (planName: string) => {
    switch (planName) {
      case 'Free':
        return 'bg-blue-50 border-blue-200';
      case 'Gold':
        return 'bg-gradient-to-tr from-yellow-200 via-yellow-100 to-yellow-200 border-yellow-300 animate-goldGlow';
      case 'Diamond':
        return 'bg-gradient-to-br from-indigo-300 via-indigo-200 to-indigo-300 border-indigo-400 animate-diamondGlow';
      default:
        return 'bg-white';
    }
  };

  const getButtonColor = (planName: string) => {
    switch (planName) {
      case 'Free':
        return '';
      case 'Gold':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Diamond':
        return 'bg-purple-600 hover:bg-purple-700';
      default:
        return '';
    }
  };

  return (
    <section className="w-full py-16 px-5 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            Pricing Plans Built for Everyone
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            From casual content creators to professional teams, find the plan that meets your needs.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 px-6 md:px-0">
          {priceData.map((plan) => (
            <div
              key={plan.id}
              className={`flex-1 rounded-xl shadow-lg p-6 flex flex-col justify-between border-2
                          hover:scale-105 hover:shadow-xl transition-all duration-500 ${getCardStyle(plan.name)}`}
            >
              {/* Plan Title & Price */}
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                <p
                  className={`text-2xl font-semibold ${
                    plan.name === 'Diamond'
                      ? 'text-purple-900'
                      : plan.name === 'Gold'
                      ? 'text-yellow-700'
                      : 'text-blue-700'
                  }`}
                >
                  {plan.price}
                </p>
                <p className="mt-3 text-gray-800">{plan.description}</p>
              </div>

              {/* Perks List */}
              <ul className="mt-4 space-y-3 text-gray-900">
                {plan.perks.map((perk, idx) => (
                  <li key={idx} className="flex items-start">
                    {getIcon(perk)}
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="mt-6 w-2/3 mx-auto">
                <Button
                  variant="default"
                  className={`w-full py-3 text-center text-white ${getButtonColor(plan.name)}`}
                >
                  Choose {plan.name}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes goldGlow {
          0% {
            box-shadow: 0 0 10px rgba(253, 230, 138, 0.4);
          }
          50% {
            box-shadow: 0 0 25px rgba(253, 230, 138, 0.7);
          }
          100% {
            box-shadow: 0 0 10px rgba(253, 230, 138, 0.4);
          }
        }

        .animate-goldGlow {
          animation: goldGlow 5s ease-in-out infinite;
        }

        @keyframes diamondGlow {
          0% {
            box-shadow: 0 0 15px rgba(167, 139, 250, 0.4);
          }
          50% {
            box-shadow: 0 0 35px rgba(167, 139, 250, 0.7);
          }
          100% {
            box-shadow: 0 0 15px rgba(167, 139, 250, 0.4);
          }
        }

        .animate-diamondGlow {
          animation: diamondGlow 5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Price;
