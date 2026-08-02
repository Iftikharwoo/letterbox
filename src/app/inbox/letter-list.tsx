"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type InboxLetter = {
  id: string;
  sender_id: string | null;
  sender_username: string | null;
  content: string | null;
  unlock_date: string;
  status: "sealed" | "unlocked" | "opened";
  is_anonymous: boolean;
  is_self: boolean;
  opened_at: string | null;
  created_at: string;
};

function senderLabel(letter: InboxLetter) {
  if (letter.is_self) return "From your past self";
  if (letter.is_anonymous) return "From someone anonymous";
  return letter.sender_username ? `From @${letter.sender_username}` : "From someone";
}

export function LetterList({ letters }: { letters: InboxLetter[] }) {
  if (letters.length === 0) {
    return (
      <p className="text-center text-sm text-neutral-500 py-16">
        Nothing here yet. Letters you write to yourself or that others send
        you will show up here.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {letters.map((letter) => (
        <LetterCard key={letter.id} letter={letter} />
      ))}
    </ul>
  );
}

function LetterCard({ letter }: { letter: InboxLetter }) {
  const [current, setCurrent] = useState(letter);
  const [marking, setMarking] = useState(false);
  const supabase = createClient();

  async function markOpened() {
    if (current.status !== "unlocked" || marking) return;
    setMarking(true);
    const { error } = await supabase
      .from("letters")
      .update({ status: "opened", opened_at: new Date().toISOString() })
      .eq("id", current.id);
    setMarking(false);
    if (!error) {
      setCurrent({ ...current, status: "opened" });
    }
  }

  if (current.status === "sealed") {
    return (
      <li className="rounded-2xl border border-neutral-200 px-5 py-4 text-sm text-neutral-500">
        <div className="flex items-center justify-between">
          <span>{senderLabel(current)}</span>
          <span>Unlocks {current.unlock_date}</span>
        </div>
      </li>
    );
  }

  return (
    <li
      onClick={markOpened}
      className="rounded-2xl border border-neutral-300 px-5 py-4 space-y-3 cursor-pointer"
    >
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{senderLabel(current)}</span>
        <span>{current.status === "opened" ? "Opened" : "Unlocked — tap to read"}</span>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {current.content}
      </p>
    </li>
  );
}
