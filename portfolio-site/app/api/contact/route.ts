import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

    const { success } = rateLimit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, message } = body;

    // Type check
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid input types" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    // Presence check
    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Length check
    if (trimmedName.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Name must be under ${MAX_NAME_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (trimmedEmail.length > MAX_EMAIL_LENGTH) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be under ${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Email format check
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Sanitise user input for HTML email
    const safeName = escapeHtml(trimmedName);
    const safeEmail = escapeHtml(trimmedEmail);
    const safeMessage = escapeHtml(trimmedMessage);

    await resend.emails.send({
      from: "Portfolio Contact <contact@adamjarick.com>",
      to: "adstar3108@gmail.com",
      subject: `New message from ${safeName}`,
      replyTo: trimmedEmail,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">New Portfolio Message</h2>
          <p><strong>From:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="white-space: pre-wrap;">${safeMessage}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
