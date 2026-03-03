"use client";

import { useState } from "react";
import Image from "next/image";
import ProgressBar from "@/components/ProgressBar";
import StepCategory from "@/components/StepCategory";
import StepContact from "@/components/StepContact";
import StepConfirmation from "@/components/StepConfirmation";

export default function Home() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setStep(2);
  };

  const handleSubmit = () => {
    setStep(3);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setStep(1);
  };

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="header">
        <Image
          src="/vytalmed-logo.png"
          alt="VytalMed"
          width={140}
          height={40}
          className="header__logo"
          priority
        />
      </header>

      {/* Progress */}
      <ProgressBar currentStep={step} />

      {/* Steps */}
      {step === 1 && <StepCategory onSelect={handleCategorySelect} />}
      {step === 2 && (
        <StepContact
          category={selectedCategory}
          onSubmit={handleSubmit}
          onBack={handleBack}
        />
      )}
      {step === 3 && <StepConfirmation onReset={handleReset} />}

      {/* Footer */}
      <footer className="footer">
        <p className="footer__text">
          © {new Date().getFullYear()} VytalMed · HIMSS 2025
        </p>
      </footer>
    </div>
  );
}
