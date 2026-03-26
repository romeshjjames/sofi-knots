import { NextResponse } from "next/server";
import { createContactMessage } from "@/lib/contact-messages";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Please complete all contact form fields." }, { status: 400 });
    }

    await createContactMessage({ name, email, subject, message });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit contact message." },
      { status: 500 },
    );
  }
}
