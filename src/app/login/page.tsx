"use client";

import { LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const response = await fetch("/api/login", {
      method: "POST"
    });

    if (response.ok) {
      window.location.assign("/");
      return;
    }

    setIsSubmitting(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <form className="w-full max-w-md rounded border border-gray-200 bg-white p-8 shadow-sm" onSubmit={handleSubmit}>
        <div className="flex h-12 w-12 items-center justify-center rounded bg-emerald-100 text-emerald-700">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-gray-950">Sign In</h1>
        <p className="mt-2 text-sm text-gray-500">Access your Mini CRM workspace.</p>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-gray-700">
            Email Address
            <input
              className="h-11 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              defaultValue="amelia@zylker.example"
              name="email"
              required
              type="email"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-gray-700">
            Password
            <input
              className="h-11 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              defaultValue="password"
              name="password"
              required
              type="password"
            />
          </label>
        </div>

        <button
          className="mt-6 h-11 w-full rounded-full bg-emerald-500 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </main>
  );
}
