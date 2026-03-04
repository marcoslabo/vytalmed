"use client";
import Image from "next/image";

const CATEGORIES = [
    { label: "Fax / Intake", icon: "/icons/fax-intake.png", color: "green" },
    { label: "Scheduling", icon: "/icons/scheduling.png", color: "blue" },
    { label: "Staffing / Surge", icon: "/icons/staffing.png", color: "teal" },
    { label: "Case Routing", icon: "/icons/case-routing.png", color: "orange" },
    { label: "Site Onboarding", icon: "/icons/site-onboarding.png", color: "purple" },
    { label: "Reporting", icon: "/icons/reporting.png", color: "navy" },
    { label: "Contracting", icon: "/icons/contracting.png", color: "rose" },
    { label: "Other", icon: "/icons/other.png", color: "gray" },
];

export default function StepCategory({ onSelect }) {
    return (
        <div className="step-content">
            {/* AirPods incentive — first thing they see */}
            <div className="incentive-banner">
                <span className="incentive-banner__icon">🎧</span>
                <p className="incentive-banner__text">
                    Answer one question. <strong>Win AirPods.</strong>
                </p>
            </div>

            <div className="step-header">
                <h2 className="step-header__title">
                    Where is healthcare bleeding the most money?
                </h2>
                <p className="step-header__subtitle">
                    Pick the workflow you think costs the industry the most.
                </p>
            </div>

            <div className="category-grid">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.label}
                        className="category-card"
                        onClick={() => onSelect(cat.label)}
                        type="button"
                    >
                        <div className={`category-card__icon-wrap category-card__icon-wrap--${cat.color}`}>
                            <Image
                                src={cat.icon}
                                alt={cat.label}
                                width={34}
                                height={34}
                                className="category-card__icon"
                            />
                        </div>
                        <span className="category-card__label">{cat.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
