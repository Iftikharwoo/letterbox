"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif">Letterbox</h1>
        <p className="text-neutral-500">
          Write a letter. Seal it. Let time deliver it.
        </p>
      </div>
      <button
        onClick={signInWithGoogle}
        className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium hover:bg-neutral-50 transition"
      >
        Continue with Google
      </button>
    </main>
  );
}
