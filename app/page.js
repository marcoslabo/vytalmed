"use client";
import { useState } from "react";
import Image from "next/image";
import StepCategory from "@/components/StepCategory";
import StepContact from "@/components/StepContact";
import StepConfirmation from "@/components/StepConfirmation";
import ProgressBar from "@/components/ProgressBar";

export default function Home() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);

  function handleCategorySelect(cat) {
    setCategory(cat);
    setStep(2);
  }

  function handleContactSubmit() {
    setStep(3);
  }

  function handleReset() {
    setStep(1);
    setCategory(null);
  }

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="header">
        <Image
          src="/vytalmed-logo.png"
          alt="VytalMed"
          width={140}
          height={36}
          className="header__logo"
          priority
        />
      </header>

      {/* Progress */}
      <ProgressBar step={step} total={3} />

      {/* Steps */}
      {step === 1 && <StepCategory onSelect={handleCategorySelect} />}
      {step === 2 && (
        <StepContact
          category={category}
          onSubmit={handleContactSubmit}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && <StepConfirmation onReset={handleReset} />}

      {/* Footer */}
      <footer className="footer">
        <p className="footer__text">© 2026 VytalMed · HIMSS 2026</p>
      </footer>
    </div>
  );
}
