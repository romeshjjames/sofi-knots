"use client";

import { useState, useTransition } from "react";

type CustomerLoginPanelProps = {
  next?: string;
};

export function CustomerLoginPanel({ next = "/account" }: CustomerLoginPanelProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });

  function submit() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(mode === "login" ? "/api/customer/login" : "/api/customer/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          next,
        }),
      });
      const body = await response.json();

      if (!response.ok) {
        setMessage(body.error || "Unable to continue.");
        return;
      }

      if (body.redirectTo) {
        window.location.href = body.redirectTo;
        return;
      }

      setMessage(body.message || "Done.");
    });
  }

  return (
    <div className="mx-auto max-w-lg rounded-[28px] border border-brand-sand/35 bg-white p-8 shadow-[0_24px_80px_rgba(70,52,36,0.08)]">
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === "login" ? "bg-brand-brown text-white" : "bg-brand-cream text-brand-warm"}`}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === "signup" ? "bg-brand-brown text-white" : "bg-brand-cream text-brand-warm"}`}
          onClick={() => setMode("signup")}
        >
          Create account
        </button>
      </div>

      <div className="space-y-4">
        {mode === "signup" ? (
          <>
            <input className="brand-input" placeholder="Full name" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
            <input className="brand-input" placeholder="Phone number" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          </>
        ) : null}
        <input className="brand-input" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
        <input className="brand-input" type="password" placeholder="Password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
        <button type="button" className="brand-btn-primary w-full" disabled={isPending} onClick={submit}>
          {isPending ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
        </button>
        {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
      </div>
    </div>
  );
}
