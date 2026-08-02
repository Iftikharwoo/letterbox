"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
  if (letter.is_self) return "SELF-ARCHIVE";
  if (letter.is_anonymous) return "UNIDENTIFIED SOURCE";
  return letter.sender_username
    ? `FROM @${letter.sender_username}`
    : "UNKNOWN SENDER";
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(iso: string) {
  const target = new Date(iso + "T00:00:00").getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((target - now) / 86400000));
}

export function LetterList({ letters: initialLetters }: { letters: InboxLetter[] }) {
  const [letters, setLetters] = useState(initialLetters);
  const [openLetter, setOpenLetter] = useState<InboxLetter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sealedToast, setSealedToast] = useState<{ id: string; text: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!sealedToast) return;
    const timeout = setTimeout(() => setSealedToast(null), 2400);
    return () => clearTimeout(timeout);
  }, [sealedToast]);

  async function handleOpen(letter: InboxLetter) {
    if (letter.status === "sealed") {
      setSealedToast({
        id: letter.id,
        text: `This opens on ${formatDate(letter.unlock_date)}.`,
      });
      return;
    }

    setError(null);
    setOpenLetter(letter);

    if (letter.status !== "unlocked") return;

    const { error: updateError } = await supabase
      .from("letters")
      .update({ status: "opened", opened_at: new Date().toISOString() })
      .eq("id", letter.id);

    if (updateError) {
      setError("Couldn't mark as opened, but here's your letter anyway.");
      return;
    }

    const openedAt = new Date().toISOString();
    setLetters((prev) =>
      prev.map((l) =>
        l.id === letter.id ? { ...l, status: "opened", opened_at: openedAt } : l
      )
    );
    setOpenLetter((prev) =>
      prev && prev.id === letter.id ? { ...prev, status: "opened", opened_at: openedAt } : prev
    );
  }

  if (letters.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <Image
          src="/assets/empty-state.png"
          alt="Empty inbox"
          width={140}
          height={100}
          className="opacity-40 invert"
        />
        <p className="font-[family-name:var(--font-letter)] text-panda-muted text-[14px] tracking-[.06em]">
          NO TRANSMISSIONS.
        </p>
        <p className="text-[11px] font-[family-name:var(--font-letter)] text-panda-ghost tracking-[.04em]">
          Compose one to start.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {letters.map((letter) => (
          <LetterRow
            key={letter.id}
            letter={letter}
            toast={sealedToast?.id === letter.id ? sealedToast.text : null}
            onOpen={() => handleOpen(letter)}
          />
        ))}
      </ul>
      {openLetter && (
        <LetterFlashcard
          letter={openLetter}
          error={error}
          onClose={() => {
            setOpenLetter(null);
            setError(null);
          }}
        />
      )}
    </>
  );
}

function LetterRow({
  letter,
  toast,
  onOpen,
}: {
  letter: InboxLetter;
  toast: string | null;
  onOpen: () => void;
}) {
  if (letter.status === "sealed") {
    const days = daysUntil(letter.unlock_date);
    return (
      <li
        onClick={onOpen}
        className="bg-panda-dark border border-line-strong rounded-xl p-4 flex items-center gap-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] cursor-pointer transition-all hover:border-panda-ghost/30"
      >
        <div className="shrink-0 h-8 w-8 rounded-full bg-panda-patch flex items-center justify-center">
          <Image
            src="/assets/wax-seal.png"
            alt="Sealed"
            width={22}
            height={22}
            className="opacity-60"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-[17px] text-panda-white truncate">
            {senderLabel(letter)}
          </p>
          <p className="font-[family-name:var(--font-letter)] text-[11px] text-panda-ghost">
            UNLOCKS {formatDate(letter.unlock_date)} · {days} day
            {days !== 1 ? "s" : ""} remaining
          </p>
          {toast && (
            <p className="font-serif italic text-[12px] text-amber mt-1">
              {toast}
            </p>
          )}
        </div>
        <span className="text-[9px] uppercase tracking-widest font-[family-name:var(--font-ui)] font-bold text-amber whitespace-nowrap">
          ENCRYPTED
        </span>
      </li>
    );
  }

  const isReady = letter.status === "unlocked";
  const isOpened = letter.status === "opened";

  return (
    <li
      onClick={onOpen}
      className={`bg-panda-dark rounded-xl p-4 flex items-center gap-3.5 transition-all cursor-pointer ${
        isReady
          ? "border border-bamboo/40 shadow-[0_6px_24px_rgba(93,138,104,0.15)] hover:border-bamboo/60"
          : "border border-line-strong shadow-[0_4px_20px_rgba(0,0,0,0.3)] opacity-60 hover:opacity-80"
      }`}
    >
      <div className="shrink-0">
        {isOpened ? (
          <div className="h-8 w-8 rounded-full bg-panda-patch flex items-center justify-center">
            <Image
              src="/assets/wax-seal-broken.png"
              alt="Opened"
              width={22}
              height={22}
              className="opacity-50"
            />
          </div>
        ) : letter.is_anonymous ? (
          <div className="h-8 w-8 rounded-full bg-anon/20 flex items-center justify-center text-[14px] font-serif text-anon">
            ?
          </div>
        ) : (
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-panda-patch flex items-center justify-center">
              <Image
                src="/assets/wax-seal.png"
                alt="Ready"
                width={22}
                height={22}
              />
            </div>
            {isReady && (
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-bamboo shadow-[0_0_8px_rgba(93,138,104,0.6)]" />
            )}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="font-serif text-[17px] text-panda-white truncate">
            {senderLabel(letter)}
          </p>
          <span
            className={`text-[9px] uppercase tracking-widest font-[family-name:var(--font-ui)] font-bold whitespace-nowrap ${
              isReady ? "text-bamboo" : "text-panda-ghost"
            }`}
          >
            {isReady
              ? "DECRYPTED"
              : `OPENED ${
                  letter.opened_at ? formatDate(letter.opened_at.slice(0, 10)) : ""
                }`}
          </span>
        </div>
        <p className="font-[family-name:var(--font-letter)] text-[11px] text-panda-ghost tracking-[.06em]">
          OPEN SIGNAL
        </p>
      </div>
    </li>
  );
}

function LetterFlashcard({
  letter,
  error,
  onClose,
}: {
  letter: InboxLetter;
  error: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-panda-black/80 backdrop-blur-sm animate-[backdrop-in_0.2s_ease-out]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[80vh] overflow-y-auto bg-panda-dark border border-line-strong rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-[flashcard-in_0.28s_cubic-bezier(0.16,1,0.3,1)]"
      >
        <div className="sticky top-0 bg-panda-dark border-b border-line flex items-start justify-between gap-4 p-5">
          <div className="min-w-0">
            <p className="font-serif text-[19px] text-panda-white truncate">
              {senderLabel(letter)}
            </p>
            <p className="font-[family-name:var(--font-letter)] text-[11px] text-panda-ghost mt-0.5">
              {letter.opened_at
                ? `Opened ${formatDate(letter.opened_at.slice(0, 10))}`
                : `Unlocked ${formatDate(letter.unlock_date)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-panda-ghost hover:text-panda-white hover:bg-panda-patch transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          <p className="text-[15px] font-[family-name:var(--font-letter)] leading-[1.9] text-panda-cream whitespace-pre-wrap break-words">
            {letter.content}
          </p>
          {error && (
            <p className="text-[12px] font-[family-name:var(--font-ui)] text-nose mt-4">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
