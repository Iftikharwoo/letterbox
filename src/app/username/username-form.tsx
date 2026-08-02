"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function UsernameForm() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const normalized = username.trim().toLowerCase();
  const valid = USERNAME_PATTERN.test(normalized);

  useEffect(() => {
    if (!valid) {
      setAvailable(null);
      return;
    }
    setChecking(true);
    const timeout = setTimeout(async () => {
      const { data } = await supabase.rpc("resolve_username", {
        lookup_username: normalized,
      });
      setAvailable(!data);
      setChecking(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [normalized, valid]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!valid) {
      setError("3-20 characters, lowercase letters, numbers, and underscores only.");
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
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <div>
        <div className="flex items-center border-b border-panda-ghost/40 pb-2">
          <span className="text-[20px] font-[family-name:var(--font-letter)] text-panda-ghost select-none">
            @
          </span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            autoFocus
            className="flex-1 bg-transparent text-[20px] font-[family-name:var(--font-letter)] text-panda-white placeholder:text-panda-ghost focus:outline-none focus:shadow-none ml-0.5"
          />
        </div>
        {valid && !checking && available !== null && (
          <p className={`mt-2 text-[13px] font-[family-name:var(--font-ui)] flex items-center gap-1.5 ${
            available ? "text-bamboo" : "text-nose"
          }`}>
            <span className={`inline-block h-2 w-2 rounded-full ${
              available ? "bg-bamboo" : "bg-nose"
            }`} />
            {available ? "yours if you want it" : "taken — try another"}
          </p>
        )}
        {error && (
          <p className="mt-2 text-[13px] font-[family-name:var(--font-ui)] text-nose">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={submitting || !valid || available === false}
        className="rounded-full bg-panda-white hover:bg-panda-cream text-panda-black hover:-translate-y-px transition-all px-6 py-3 text-[13px] font-[family-name:var(--font-ui)] font-semibold tracking-wide disabled:opacity-40"
      >
        {submitting ? "Saving…" : "Keep it"}
      </button>
    </form>
  );
}
