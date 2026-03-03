"use client";

import { useState } from "react";

export default function StepContact({ category, onSubmit, onBack }) {
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [note, setNote] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const e = {};
        if (!firstName.trim()) e.firstName = "First name is required";
        if (!email.trim()) {
            e.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            e.email = "Enter a valid work email";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: category.label,
                    firstName: firstName.trim(),
                    email: email.trim().toLowerCase(),
                    note: note.trim() || null,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Submission failed");
            }

            onSubmit();
        } catch (err) {
            setErrors({ submit: err.message });
            setSubmitting(false);
        }
    };

    return (
        <div className="step-content" key="step-contact">
            <div className="step-header">
                <p className="step-header__eyebrow">Almost Done</p>
                <h1 className="step-header__title">Enter to win AirPods 🎧</h1>
                <p className="step-header__subtitle">
                    Just your name &amp; email — 15 seconds
                </p>
            </div>

            <div className="selected-badge">
                <span className="selected-badge__icon">{category.icon}</span>
                {category.label}
                <span
                    className="selected-badge__change"
                    onClick={onBack}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && onBack()}
                >
                    Change
                </span>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label htmlFor="firstName" className="form-group__label">
                        First Name
                    </label>
                    <input
                        id="firstName"
                        type="text"
                        className="form-group__input"
                        placeholder="e.g. Sarah"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        autoComplete="given-name"
                        autoCapitalize="words"
                    />
                    {errors.firstName && (
                        <p className="form-group__error">{errors.firstName}</p>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="email" className="form-group__label">
                        Work Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        className="form-group__input"
                        placeholder="sarah@hospital.org"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        inputMode="email"
                    />
                    {errors.email && (
                        <p className="form-group__error">{errors.email}</p>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="note" className="form-group__label">
                        What&rsquo;s frustrating about it?{" "}
                        <span className="form-group__label--optional">(optional)</span>
                    </label>
                    <textarea
                        id="note"
                        className="form-group__textarea"
                        placeholder="e.g. We still fax referrals and lose 30% of them…"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        maxLength={280}
                    />
                </div>

                {errors.submit && (
                    <p className="form-group__error" style={{ marginBottom: 12 }}>
                        {errors.submit}
                    </p>
                )}

                <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={submitting}
                    id="submit-btn"
                >
                    {submitting ? (
                        <>
                            <span className="btn__spinner" />
                            Submitting…
                        </>
                    ) : (
                        "Submit & Enter Raffle 🎰"
                    )}
                </button>
            </form>
        </div>
    );
}
