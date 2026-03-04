"use client";

export default function ProgressBar({ step }) {
    return (
        <div className="progress-bar" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
            {[1, 2, 3].map((s) => (
                <div
                    key={s}
                    className={`progress-bar__segment ${s < step
                        ? "progress-bar__segment--complete"
                        : s === step
                            ? "progress-bar__segment--active"
                            : ""
                        }`}
                />
            ))}
            <span className="progress-bar__step-label">
                {step}/3
            </span>
        </div>
    );
}
