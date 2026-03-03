"use client";

export default function ProgressBar({ currentStep }) {
    return (
        <div className="progress-bar" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={3}>
            {[1, 2, 3].map((step) => (
                <div
                    key={step}
                    className={`progress-bar__segment ${step < currentStep
                            ? "progress-bar__segment--complete"
                            : step === currentStep
                                ? "progress-bar__segment--active"
                                : ""
                        }`}
                />
            ))}
            <span className="progress-bar__step-label">
                {currentStep}/3
            </span>
        </div>
    );
}
