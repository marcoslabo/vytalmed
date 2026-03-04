import { createClient } from "@supabase/supabase-js";

const VALID_CATEGORIES = [
    "Fax / Intake",
    "Scheduling",
    "Staffing / Surge",
    "Case Routing",
    "Site Onboarding",
    "Reporting",
    "Contracting",
    "Other",
];

// Simple in-memory rate limiting (per-IP, 5 submissions per hour)
const rateLimit = new Map();
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_MAX = 5;

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = rateLimit.get(ip);

    if (!entry || now - entry.start > RATE_WINDOW) {
        rateLimit.set(ip, { start: now, count: 1 });
        return true;
    }

    if (entry.count >= RATE_MAX) return false;
    entry.count++;
    return true;
}

// --- Brevo Integration ---

const BREVO_LIST_ID = 21; // VytalMed expo leads list

async function syncToBrevo({ firstName, email, category, note }) {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        console.log("⚠️ BREVO_API_KEY not configured — skipping Brevo sync");
        return;
    }

    try {
        // 1. Create/update contact in Brevo with attributes
        const contactRes = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
                "api-key": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                attributes: {
                    FIRSTNAME: firstName,
                    SOURCE: "expo-lead",
                    CRM_PROBLEM: category,
                    EVENT_TAG: "HIMSS",
                },
                listIds: [BREVO_LIST_ID],
                updateEnabled: true, // Update if contact already exists
            }),
        });

        const contactText = await contactRes.text();
        if (!contactRes.ok && contactRes.status !== 204) {
            console.error("Brevo contact sync error:", contactText);
        } else {
            console.log("✅ Contact synced to Brevo:", email);
        }

        // 2. Send instant notification email to the team
        await sendNotificationEmail({ firstName, email, category, note, apiKey });

        // 3. Send confirmation email to the attendee
        await sendConfirmationEmail({ firstName, email, category, apiKey });

    } catch (err) {
        // Don't let Brevo errors block the submission
        console.error("Brevo sync failed:", err.message);
    }
}

async function sendNotificationEmail({ firstName, email, category, note, apiKey }) {
    try {
        const noteText = note ? `<p><strong>Note:</strong> ${note}</p>` : "";
        const timestamp = new Date().toLocaleString("en-US", {
            timeZone: "America/Chicago",
            dateStyle: "medium",
            timeStyle: "short",
        });

        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sender: { name: "VytalMed Expo", email: "noreply@vytalmed.co" },
                to: [{ email: "mlacayo@estacionvital.com", name: "Marcos" }],
                subject: `🎯 New Expo Lead: ${firstName} — ${category}`,
                htmlContent: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
                        <div style="background: linear-gradient(135deg, #3B9B6E, #2D8259); border-radius: 12px; padding: 20px; color: white; margin-bottom: 20px;">
                            <h2 style="margin: 0 0 4px;">New HIMSS Lead 🎧</h2>
                            <p style="margin: 0; opacity: 0.9; font-size: 14px;">${timestamp}</p>
                        </div>
                        <div style="background: #f8fafb; border-radius: 12px; padding: 20px; border: 1px solid #e2e7eb;">
                            <p style="margin: 0 0 12px;"><strong>Name:</strong> ${firstName}</p>
                            <p style="margin: 0 0 12px;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                            <p style="margin: 0 0 12px;"><strong>Pain Point:</strong> ${category}</p>
                            ${noteText}
                        </div>
                        <p style="color: #9ba5ae; font-size: 12px; text-align: center; margin-top: 16px;">VytalMed HIMSS Expo Booth</p>
                    </div>
                `,
            }),
        });

        if (res.ok) {
            console.log("📧 Notification email sent for:", email);
        } else {
            const errText = await res.text();
            console.error("Notification email error:", errText);
        }
    } catch (err) {
        console.error("Notification email failed:", err.message);
    }
}

async function sendConfirmationEmail({ firstName, email, category, apiKey }) {
    try {
        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sender: { name: "VytalMed", email: "noreply@vytalmed.co" },
                to: [{ email, name: firstName }],
                subject: `🎉 You're in, ${firstName}! AirPods raffle entry confirmed`,
                htmlContent: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; background: #F0F7F4;">
                        <!-- Confetti Header -->
                        <div style="background: linear-gradient(135deg, #3B9B6E, #1B3A5C); border-radius: 0 0 24px 24px; padding: 40px 24px 32px; text-align: center; color: white;">
                            <div style="font-size: 48px; margin-bottom: 8px;">🎉🎧🎉</div>
                            <h1 style="margin: 0 0 8px; font-size: 26px; font-weight: 800;">You're in, ${firstName}!</h1>
                            <p style="margin: 0; opacity: 0.9; font-size: 15px;">Your AirPods raffle entry is confirmed</p>
                        </div>

                        <div style="padding: 24px;">
                            <!-- What you selected -->
                            <div style="background: white; border-radius: 14px; padding: 20px; margin-bottom: 16px; border: 1px solid #E2E7EB;">
                                <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #3B9B6E; font-weight: 600;">Your pick</p>
                                <p style="margin: 0; font-size: 18px; font-weight: 700; color: #1B3A5C;">${category}</p>
                            </div>

                            <!-- What's next -->
                            <div style="background: white; border-radius: 14px; padding: 20px; border: 1px solid #E2E7EB;">
                                <p style="margin: 0 0 16px; font-size: 15px; font-weight: 700; color: #1B3A5C;">Here's what's coming your way:</p>

                                <div style="display: flex; align-items: flex-start; margin-bottom: 14px;">
                                    <span style="font-size: 24px; margin-right: 12px; flex-shrink: 0;">🎰</span>
                                    <div>
                                        <p style="margin: 0; font-weight: 600; color: #1B3A5C; font-size: 14px;">AirPods Raffle</p>
                                        <p style="margin: 2px 0 0; color: #6B7785; font-size: 13px;">Winner announced at the end of HIMSS</p>
                                    </div>
                                </div>

                                <div style="display: flex; align-items: flex-start; margin-bottom: 14px;">
                                    <span style="font-size: 24px; margin-right: 12px; flex-shrink: 0;">📊</span>
                                    <div>
                                        <p style="margin: 0; font-weight: 600; color: #1B3A5C; font-size: 14px;">Post-HIMSS Workflow Insights</p>
                                        <p style="margin: 2px 0 0; color: #6B7785; font-size: 13px;">We'll share what the industry said is healthcare's most expensive workflow</p>
                                    </div>
                                </div>

                                <div style="display: flex; align-items: flex-start;">
                                    <span style="font-size: 24px; margin-right: 12px; flex-shrink: 0;">🎁</span>
                                    <div>
                                        <p style="margin: 0; font-weight: 600; color: #1B3A5C; font-size: 14px;">Booth Swag</p>
                                        <p style="margin: 2px 0 0; color: #6B7785; font-size: 13px;">Don't forget to grab yours before you leave!</p>
                                    </div>
                                </div>
                            </div>

                            <!-- CTA -->
                            <div style="text-align: center; margin-top: 24px;">
                                <a href="https://vytalmed.co" style="display: inline-block; background: linear-gradient(135deg, #3B9B6E, #2D8259); color: white; padding: 14px 32px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 15px;">Learn More About VytalMed</a>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="text-align: center; padding: 16px 24px 32px;">
                            <p style="margin: 0; font-size: 12px; color: #9BA5AE;">VytalMed · HIMSS 2025</p>
                            <p style="margin: 4px 0 0; font-size: 11px; color: #CCD3D9;">You're receiving this because you entered the VytalMed booth survey.</p>
                        </div>
                    </div>
                `,
            }),
        });

        if (res.ok) {
            console.log("🎉 Confirmation email sent to:", email);
        } else {
            const errText = await res.text();
            console.error("Confirmation email error:", errText);
        }
    } catch (err) {
        console.error("Confirmation email failed:", err.message);
    }
}

// --- Main Handler ---

export async function POST(request) {
    try {
        // Rate limit check
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            "unknown";
        if (!checkRateLimit(ip)) {
            return Response.json(
                { error: "Too many submissions. Please try again later." },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { category, firstName, email, note } = body;

        // Validate required fields
        if (!firstName?.trim()) {
            return Response.json(
                { error: "First name is required." },
                { status: 400 }
            );
        }

        if (!email?.trim()) {
            return Response.json({ error: "Email is required." }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return Response.json(
                { error: "Please enter a valid email." },
                { status: 400 }
            );
        }

        // Validate category
        if (!VALID_CATEGORIES.includes(category)) {
            return Response.json(
                { error: "Please select a valid category." },
                { status: 400 }
            );
        }

        const cleanData = {
            firstName: firstName.trim(),
            email: email.trim().toLowerCase(),
            category,
            note: note?.trim() || null,
        };

        // Check Supabase config
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            // In dev without Supabase, log and return success
            console.log("📝 Lead captured (no Supabase configured):", cleanData);
        } else {
            // Insert into Supabase
            const supabase = createClient(supabaseUrl, supabaseKey);

            const { error } = await supabase.from("expo_leads").insert({
                first_name: cleanData.firstName,
                email: cleanData.email,
                category: cleanData.category,
                note: cleanData.note,
            });

            if (error) {
                console.error("Supabase insert error:", error);
                return Response.json(
                    { error: "Something went wrong. Please try again." },
                    { status: 500 }
                );
            }
        }

        // Sync to Brevo (non-blocking — don't let it fail the submission)
        syncToBrevo(cleanData).catch((err) =>
            console.error("Background Brevo sync error:", err)
        );

        return Response.json({ success: true });
    } catch (err) {
        console.error("API error:", err);
        return Response.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
