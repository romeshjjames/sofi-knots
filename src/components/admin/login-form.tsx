"use client";

import { useState, useTransition } from "react";

type LoginFormProps = {
  next?: string;
  error?: string;
};

export function LoginForm({ next = "/admin", error }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(
    error === "no-role"
      ? "Your account is signed in but does not have an admin role yet."
      : error === "forbidden"
        ? "Your account does not have permission to access that admin area."
        : null,
  );
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(null);

        startTransition(async () => {
          const response = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              password,
              next,
            }),
          });

          const body = await response.json();
          if (!response.ok) {
            setMessage(body.error || "Login failed.");
            return;
          }

          window.location.href = body.redirectTo || "/admin";
        });
      }}
    >
      <div>
        <h1 className="font-serif text-4xl text-brand-brown">Admin Login</h1>
      </div>
      <input className="brand-input" type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <input className="brand-input" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      <button type="submit" className="brand-btn-primary w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign In"}
      </button>
      {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
    </form>
  );
}
