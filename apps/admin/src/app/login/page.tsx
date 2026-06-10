"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@jhb/shared/supabase/client";

export default function AdminLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const redirect = params.get("redirect") || "/";
    router.push(redirect);
    router.refresh();
  };

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
      <form
        onSubmit={onSubmit}
        className="glass-strong glow-border w-full max-w-sm rounded-3xl p-8"
      >
        <div className="mb-6 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary font-display text-sm font-bold text-white">
            JH
          </span>
          <div>
            <p className="font-display text-lg font-bold leading-none">
              JHB <span className="grad-text">Admin</span>
            </p>
            <p className="text-xs text-muted">Super Admin Dashboard</p>
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted">
          Enter your credentials to manage the site.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-ink/10 bg-ink/[0.03] px-4 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-ink/10 bg-ink/[0.03] px-4 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary mt-6 w-full disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In →"}
        </button>
      </form>
    </main>
  );
}
