'use client';
import React from 'react';

interface GeneratingOverlayProps {
  text: string;
}

const GeneratingOverlay: React.FC<GeneratingOverlayProps> = ({ text }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      <p className="mt-4 text-lg font-semibold text-blue-600">{text}</p>
    </div>
  );
};

export default GeneratingOverlay;
