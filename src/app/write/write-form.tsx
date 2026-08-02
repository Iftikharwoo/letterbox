"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Recipient = "self" | "username";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function WriteForm() {
  const [recipient, setRecipient] = useState<Recipient>("self");
  const [username, setUsername] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (content.trim().length === 0) {
      setError("Write something first.");
      return;
    }
    if (recipient === "username" && username.trim().length === 0) {
      setError("Enter a username.");
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

    let recipientId: string | null = null;

    if (recipient === "username") {
      const { data: resolvedId, error: resolveError } = await supabase.rpc(
        "resolve_username",
        { lookup_username: username.trim().toLowerCase() }
      );

      if (resolveError || !resolvedId) {
        setSubmitting(false);
        setError("No user found with that username.");
        return;
      }
      recipientId = resolvedId as string;
    }

    const { error: insertError } = await supabase.from("letters").insert({
      sender_id: user.id,
      recipient_id: recipientId,
      content: content.trim(),
      unlock_date: todayIso(),
      is_anonymous: recipient === "username" ? anonymous : false,
    });

    setSubmitting(false);

    if (insertError) {
      setError("Didn't send — try again.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center space-y-6 py-16 flex flex-col items-center animate-[fade-up_0.3s_ease-out]">
        <div className="h-12 w-12 flex items-center justify-center border border-bamboo/40 bg-bamboo/10" style={{ boxShadow: "0 0 24px rgba(0,255,159,0.15)" }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 11.5L9 16.5L18 6" stroke="#00ff9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-[family-name:var(--font-letter)] text-panda-white text-[18px] tracking-[.1em]">TRANSMITTED.</p>
        <button
          onClick={() => {
            setSent(false);
            setContent("");
            setUsername("");
            setAnonymous(false);
          }}
          className="text-[12px] font-[family-name:var(--font-letter)] text-bamboo hover:text-bamboo-light transition-colors tracking-[.06em]"
        >
          NEW TRANSMISSION
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Paper card */}
      <div className="bg-panda-dark border border-line-strong rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div
          className="h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.5) 30%, rgba(0,255,159,0.3) 70%, transparent)" }}
        />

        <div className="p-5 space-y-4">
          {/* Recipient row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-[.18em] font-[family-name:var(--font-letter)] text-panda-ghost font-semibold">
              TO
            </span>
            <button
              type="button"
              onClick={() => setRecipient("self")}
              className={`px-3.5 py-1.5 text-[11px] font-[family-name:var(--font-letter)] border tracking-[.06em] transition-all ${
                recipient === "self"
                  ? "border-panda-white bg-panda-white/10 text-panda-white shadow-[0_0_12px_rgba(0,212,255,0.2)]"
                  : "border-line-strong text-panda-muted hover:border-panda-muted"
              }`}
            >
              SELF-ARCHIVE
            </button>
            <button
              type="button"
              onClick={() => setRecipient("username")}
              className={`px-3.5 py-1.5 text-[11px] font-[family-name:var(--font-letter)] border tracking-[.06em] transition-all ${
                recipient === "username"
                  ? "border-panda-white bg-panda-white/10 text-panda-white shadow-[0_0_12px_rgba(0,212,255,0.2)]"
                  : "border-line-strong text-panda-muted hover:border-panda-muted"
              }`}
            >
              TO RECIPIENT
            </button>
          </div>

          {recipient === "username" && (
            <div className="space-y-2">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@callsign"
                className="w-full bg-transparent border-b border-panda-ghost/30 pb-2 text-[15px] font-[family-name:var(--font-letter)] text-panda-white placeholder:text-panda-ghost focus:outline-none focus:shadow-none"
              />
              <label className="flex items-center gap-2 text-[12px] font-[family-name:var(--font-ui)] text-panda-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="accent-bamboo"
                />
                SEND UNIDENTIFIED
              </label>
            </div>
          )}

          {/* Letter textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="BEGIN TRANSMISSION..."
            rows={10}
            className="w-full bg-transparent text-[15px] font-[family-name:var(--font-letter)] text-panda-white leading-[1.9] placeholder:text-panda-ghost focus:outline-none focus:shadow-none resize-none border-none"
          />
        </div>
      </div>

      {error && (
        <p className="text-[13px] font-[family-name:var(--font-ui)] text-nose text-center">
          {error}
        </p>
      )}

      {/* Send button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-panda-white/10 border border-panda-white/50 hover:bg-panda-white/20 hover:border-panda-white hover:shadow-[0_0_20px_rgba(0,212,255,0.2)] text-panda-white font-[family-name:var(--font-letter)] font-semibold text-[13px] tracking-[.1em] py-3.5 disabled:opacity-40 hover:-translate-y-px transition-all"
      >
        {submitting ? "TRANSMITTING..." : "TRANSMIT"}
      </button>
    </form>
  );
}
