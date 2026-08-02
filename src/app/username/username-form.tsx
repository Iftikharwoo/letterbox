"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function UsernameForm() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalized = username.trim().toLowerCase();
    if (!USERNAME_PATTERN.test(normalized)) {
      setError(
        "3-20 characters, lowercase letters, numbers, and underscores only."
      );
      return;
    }

    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ username: normalized })
      .eq("id", user.id);

    setSubmitting(false);

    if (updateError) {
      if (updateError.code === "23505") {
        setError("That username is taken.");
      } else {
        setError("Something went wrong. Try again.");
      }
      return;
    }

    router.push("/write");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 w-full max-w-xs">
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
        autoFocus
        className="w-full rounded-full border border-neutral-300 px-5 py-3 text-center text-sm focus:outline-none focus:border-neutral-500"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting || username.trim().length === 0}
        className="rounded-full bg-neutral-900 text-white px-6 py-3 text-sm font-medium disabled:opacity-40 hover:bg-neutral-800 transition"
      >
        {submitting ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
