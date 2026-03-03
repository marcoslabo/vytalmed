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

        // Check Supabase config
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            // In dev without Supabase, log and return success
            console.log("📝 Lead captured (no Supabase configured):", {
                category,
                firstName: firstName.trim(),
                email: email.trim().toLowerCase(),
                note: note?.trim() || null,
            });
            return Response.json({ success: true, mode: "dev" });
        }

        // Insert into Supabase
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error } = await supabase.from("expo_leads").insert({
            first_name: firstName.trim(),
            email: email.trim().toLowerCase(),
            category,
            note: note?.trim() || null,
        });

        if (error) {
            console.error("Supabase insert error:", error);
            return Response.json(
                { error: "Something went wrong. Please try again." },
                { status: 500 }
            );
        }

        return Response.json({ success: true });
    } catch (err) {
        console.error("API error:", err);
        return Response.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
