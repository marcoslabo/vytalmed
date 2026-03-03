"use client";

const CATEGORIES = [
    { id: "fax-intake", icon: "🖨️", label: "Fax / Intake" },
    { id: "scheduling", icon: "📅", label: "Scheduling" },
    { id: "staffing-surge", icon: "👥", label: "Staffing / Surge" },
    { id: "case-routing", icon: "🔀", label: "Case Routing" },
    { id: "site-onboarding", icon: "🏥", label: "Site Onboarding" },
    { id: "reporting", icon: "📊", label: "Reporting" },
    { id: "contracting", icon: "📝", label: "Contracting" },
    { id: "other", icon: "➕", label: "Other" },
];

export default function StepCategory({ onSelect }) {
    return (
        <div className="step-content" key="step-category">
            <div className="step-header">
                <p className="step-header__eyebrow">Quick Question</p>
                <h1 className="step-header__title">
                    What&rsquo;s the most expensive workflow in healthcare?
                </h1>
                <p className="step-header__subtitle">Tap your pick — takes 5 seconds</p>
            </div>

            <div className="category-grid">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        id={`category-${cat.id}`}
                        className="category-card"
                        onClick={() => onSelect(cat)}
                        type="button"
                    >
                        <span className="category-card__icon">{cat.icon}</span>
                        <span className="category-card__label">{cat.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
