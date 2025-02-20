"use client";
import { createContext, useContext, useState } from "react";

interface GenerateContextType {
  step: number;
  data: {
    language: string;
    summaryType: string;
    voice: string;
    videoDescription: string;
    transcript: string;  
    videoSource: string;  
  };
  setStep: (step: number) => void;
  updateData: (key: string, value: string) => void;
}

const GenerateContext = createContext<GenerateContextType | null>(null);

export const GenerateProvider = ({ children }: { children: React.ReactNode }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    language: "English",
    summaryType: "concise",
    voice: "female",     // default to female
    videoDescription: "",
    transcript: "",      // store the transcription
    videoSource: "",     // store the user’s chosen source
  });

  const updateData = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <GenerateContext.Provider value={{ step, data, setStep, updateData }}>
      {children}
    </GenerateContext.Provider>
  );
};

export const useGenerate = () => {
  const context = useContext(GenerateContext);
  if (!context) {
    throw new Error("useGenerate must be used within a GenerateProvider");
  }
  return context;
};
