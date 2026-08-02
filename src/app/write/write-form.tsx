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
        <div className="h-12 w-12 rounded-full bg-bamboo/20 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 11.5L9 16.5L18 6" stroke="#5d8a68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-serif italic text-panda-white text-[20px]">Sent.</p>
        <button
          onClick={() => {
            setSent(false);
            setContent("");
            setUsername("");
            setAnonymous(false);
          }}
          className="text-[13px] font-[family-name:var(--font-ui)] text-bamboo hover:text-bamboo-light transition-colors"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Paper card */}
      <div className="bg-panda-dark border border-line-strong rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div
          className="h-[6px]"
          style={{
            background:
              "repeating-linear-gradient(45deg, #f0f0ec 0 8px, #0e0e0e 8px 16px, #f0f0ec 16px 24px, #0e0e0e 24px 32px)",
          }}
        />

        <div className="p-5 space-y-4">
          {/* Recipient row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-[.16em] font-[family-name:var(--font-ui)] text-panda-ghost font-semibold">
              To
            </span>
            <button
              type="button"
              onClick={() => setRecipient("self")}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-[family-name:var(--font-ui)] border transition-all ${
                recipient === "self"
                  ? "border-panda-white bg-panda-white text-panda-black"
                  : "border-line-strong text-panda-muted hover:border-panda-ghost"
              }`}
            >
              My future self
            </button>
            <button
              type="button"
              onClick={() => setRecipient("username")}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-[family-name:var(--font-ui)] border transition-all ${
                recipient === "username"
                  ? "border-panda-white bg-panda-white text-panda-black"
                  : "border-line-strong text-panda-muted hover:border-panda-ghost"
              }`}
            >
              Someone by username
            </button>
          </div>

          {recipient === "username" && (
            <div className="space-y-2">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className="w-full bg-transparent border-b border-panda-ghost/30 pb-2 text-[15px] font-[family-name:var(--font-letter)] text-panda-white placeholder:text-panda-ghost focus:outline-none focus:shadow-none"
              />
              <label className="flex items-center gap-2 text-[12px] font-[family-name:var(--font-ui)] text-panda-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="accent-bamboo"
                />
                Send anonymously
              </label>
            </div>
          )}

          {/* Letter textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Dear..."
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
        className="w-full rounded-full bg-panda-white hover:bg-panda-cream text-panda-black font-[family-name:var(--font-ui)] font-semibold text-[14px] py-3.5 disabled:opacity-40 hover:-translate-y-px transition-all"
      >
        {submitting ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
