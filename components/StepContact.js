"use client";
import { useState } from "react";
import Image from "next/image";

const CATEGORY_ICONS = {
    "Fax / Intake": "/icons/fax-intake.png",
    "Scheduling": "/icons/scheduling.png",
    "Staffing / Surge": "/icons/staffing.png",
    "Case Routing": "/icons/case-routing.png",
    "Site Onboarding": "/icons/site-onboarding.png",
    "Reporting": "/icons/reporting.png",
    "Contracting": "/icons/contracting.png",
    "Other": "/icons/other.png",
};

export default function StepContact({ category, onSubmit, onBack }) {
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [note, setNote] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");

    function validate() {
        const errs = {};
        if (!firstName.trim()) errs.firstName = "Name is required";
        if (!email.trim()) errs.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            errs.email = "Enter a valid email";
        return errs;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setErrors({});
        setSubmitting(true);
        setApiError("");

        try {
            const res = await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category, firstName, email, note }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Something went wrong");
            onSubmit();
        } catch (err) {
            setApiError(err.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    const iconSrc = CATEGORY_ICONS[category] || "/icons/other.png";

    return (
        <div className="step-content">
            <div className="step-header">
                <h2 className="step-header__title">
                    Almost there.
                </h2>
                <p className="step-header__subtitle">
                    15 seconds — then you&apos;re entered to win.
                </p>
            </div>

            <div className="selected-badge">
                <Image
                    src={iconSrc}
                    alt={category}
                    width={18}
                    height={18}
                    className="selected-badge__icon"
                />
                <span>{category}</span>
                <button className="selected-badge__change" onClick={onBack} type="button">
                    Change
                </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label className="form-group__label" htmlFor="firstName">
                        First Name
                    </label>
                    <input
                        id="firstName"
                        className="form-group__input"
                        type="text"
                        placeholder="Your first name"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    {errors.firstName && (
                        <p className="form-group__error">{errors.firstName}</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-group__label" htmlFor="email">
                        Work Email
                    </label>
                    <input
                        id="email"
                        className="form-group__input"
                        type="email"
                        placeholder="you@hospital.org"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && (
                        <p className="form-group__error">{errors.email}</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-group__label" htmlFor="note">
                        What&apos;s frustrating about it?{" "}
                        <span className="form-group__label--optional">(optional)</span>
                    </label>
                    <textarea
                        id="note"
                        className="form-group__textarea"
                        placeholder="e.g. We still fax referrals and lose 30% of them..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                {apiError && <p className="form-group__error">{apiError}</p>}

                <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={submitting}
                >
                    {submitting ? (
                        <span className="btn__spinner" />
                    ) : (
                        "Count me in"
                    )}
                </button>
            </form>
        </div>
    );
}
