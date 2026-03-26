"use client";

import { useState } from "react";

const initialState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function ContactInquiryForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage(null);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = await response.json();

    if (!response.ok) {
      setStatus("error");
      setMessage(body.error || "Unable to send your message right now.");
      return;
    }

    setStatus("success");
    setMessage("Message sent successfully. We'll get back to you soon.");
    setForm(initialState);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="brand-label mb-3 block text-[11px]">Name</span>
          <input
            className="brand-input h-12"
            placeholder="Your name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </label>
        <label className="block">
          <span className="brand-label mb-3 block text-[11px]">Email</span>
          <input
            className="brand-input h-12"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>
      </div>

      <label className="block">
        <span className="brand-label mb-3 block text-[11px]">Subject</span>
        <input
          className="brand-input h-12"
          placeholder="How can we help?"
          value={form.subject}
          onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
          required
        />
      </label>

      <label className="block">
        <span className="brand-label mb-3 block text-[11px]">Message</span>
        <textarea
          className="brand-input min-h-[180px]"
          placeholder="Tell us about your order, question, or request."
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          required
        />
      </label>

      <button
        type="submit"
        disabled={status === "saving"}
        className="brand-btn-primary min-w-[170px] justify-center px-8 py-3 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "saving" ? "Sending..." : "Send Message"}
      </button>

      {message ? (
        <p className={`text-sm ${status === "error" ? "text-rose-600" : "text-emerald-700"}`}>{message}</p>
      ) : null}
    </form>
  );
}
