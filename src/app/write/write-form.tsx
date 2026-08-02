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
  const [unlockDate, setUnlockDate] = useState(todayIso());
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
      unlock_date: unlockDate,
      is_anonymous: recipient === "username" ? anonymous : false,
    });

    setSubmitting(false);

    if (insertError) {
      setError("Something went wrong. Try again.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center space-y-4 py-12">
        <p className="text-lg font-serif">Sealed.</p>
        <p className="text-neutral-500 text-sm">
          It&apos;ll be delivered on {unlockDate}.
        </p>
        <button
          onClick={() => {
            setSent(false);
            setContent("");
            setUsername("");
            setAnonymous(false);
          }}
          className="text-sm underline text-neutral-600"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => setRecipient("self")}
          className={`rounded-full px-4 py-2 border transition ${
            recipient === "self"
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 text-neutral-600"
          }`}
        >
          My future self
        </button>
        <button
          type="button"
          onClick={() => setRecipient("username")}
          className={`rounded-full px-4 py-2 border transition ${
            recipient === "username"
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 text-neutral-600"
          }`}
        >
          Someone by username
        </button>
      </div>

      {recipient === "username" && (
        <div className="space-y-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="their username"
            className="w-full rounded-full border border-neutral-300 px-5 py-3 text-center text-sm focus:outline-none focus:border-neutral-500"
          />
          <label className="flex items-center justify-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            Send anonymously
          </label>
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Dear..."
        rows={10}
        className="w-full rounded-2xl border border-neutral-300 px-5 py-4 text-sm leading-relaxed focus:outline-none focus:border-neutral-500 resize-none"
      />

      <div className="flex flex-col items-center gap-2">
        <label htmlFor="unlock-date" className="text-sm text-neutral-500">
          Unlock date
        </label>
        <input
          id="unlock-date"
          type="date"
          min={todayIso()}
          value={unlockDate}
          onChange={(e) => setUnlockDate(e.target.value)}
          className="rounded-full border border-neutral-300 px-5 py-3 text-sm focus:outline-none focus:border-neutral-500"
        />
      </div>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-neutral-900 text-white px-6 py-3 text-sm font-medium disabled:opacity-40 hover:bg-neutral-800 transition"
      >
        {submitting ? "Sealing…" : "Seal letter"}
      </button>
    </form>
  );
}
