"use client";

import { useEffect, useState, useTransition } from "react";

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
    captchaAnswer: "",
    website: "",
  });
  const [captchaPrompt, setCaptchaPrompt] = useState<string>("");

  useEffect(() => {
    if (mode !== "signup") return;
    void loadCaptcha();
  }, [mode]);

  async function loadCaptcha() {
    try {
      const response = await fetch("/api/customer/captcha", { cache: "no-store" });
      const body = await response.json();
      if (response.ok) {
        setCaptchaPrompt(body.prompt || "");
        setForm((current) => ({ ...current, captchaAnswer: "" }));
      }
    } catch {
      setCaptchaPrompt("");
    }
  }

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
        if (mode === "signup") {
          void loadCaptcha();
        }
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
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-taupe">Captcha</p>
              <div className="rounded-2xl border border-brand-sand/35 bg-brand-cream px-4 py-3 text-sm text-brand-brown">
                {captchaPrompt || "Loading challenge..."}
              </div>
              <input className="brand-input" placeholder="Enter captcha answer" value={form.captchaAnswer} onChange={(event) => setForm((current) => ({ ...current, captchaAnswer: event.target.value }))} />
              <input
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                placeholder="Website"
                value={form.website}
                onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
              />
            </div>
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
