import React from 'react';
import priceData from '@/app/data/price.json';
import { Button } from './reusable';

const Price = () => {
  const getCardStyle = () => 'bg-white border-gray-200 hover:bg-gray-800';

  const getButtonColor = (planName: string) => {
    switch (planName) {
      case 'Gold':
        return 'bg-yellow-500 hover:bg-yellow-700';
      case 'Diamond':
        return 'bg-purple-600 hover:bg-purple-800';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <section className="w-full py-16 px-5 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
          Pricing Plans Built for Everyone
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          From casual content creators to professional teams, find the plan that meets your needs.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center md:flex-row gap-8">
        {priceData.map((plan) => (
          <div
            key={plan.id}
            className={`group flex-1 rounded-xl shadow-lg p-6 flex flex-col max-w-[300px] md:max-w-[375px] md:min-h-[700px] justify-between border-2 hover:shadow-2xl transition-all duration-500 ${getCardStyle()}`}
          >
            <div>
              <h3 className="text-3xl font-bold mb-3 group-hover:text-white text-gray-900">{plan.name}</h3>
              <p className={`text-2xl font-semibold group-hover:text-white ${plan.name === 'Diamond' ? 'text-purple-900' : plan.name === 'Gold' ? 'text-yellow-700' : 'text-blue-700'}`}>{plan.price}</p>
              <p className="mt-3 group-hover:text-white text-gray-800">{plan.description}</p>
            </div>

            <ul className="mt-4 space-y-3 group-hover:text-white text-gray-900">
              {plan.perks.map((perk, idx) => (
                <li key={idx} className="flex items-start">
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 w-2/3 mx-auto">
              <Button variant="default" className={`w-full py-3 text-white ${getButtonColor(plan.name)}`}>Choose {plan.name}</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Price;
