"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type Recipient = "self" | "username";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addMonths(months: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}


export function WriteForm() {
  const [recipient, setRecipient] = useState<Recipient>("self");
  const [username, setUsername] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [content, setContent] = useState("");
  const [unlockDate, setUnlockDate] = useState(addMonths(1));
  const [openNow, setOpenNow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [animPhase, setAnimPhase] = useState(0);

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
      unlock_date: openNow ? todayIso() : unlockDate,
      is_anonymous: recipient === "username" ? anonymous : false,
    });

    setSubmitting(false);

    if (insertError) {
      setError("That didn't send. The letter is safe — try again.");
      return;
    }

    setSent(true);
    setAnimPhase(1);
    setTimeout(() => setAnimPhase(2), 600);
    setTimeout(() => setAnimPhase(3), 1200);
    setTimeout(() => setAnimPhase(4), 2000);
  }

  if (sent) {
    return (
      <SealedView
        unlockDate={unlockDate}
        animPhase={animPhase}
        onReset={() => {
          setSent(false);
          setAnimPhase(0);
          setContent("");
          setUsername("");
          setAnonymous(false);
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Paper card — panda white on black */}
      <div className="bg-panda-dark border border-line-strong rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {/* Black & white stripe (panda fur pattern) */}
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

      {/* Sealed until section */}
      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-[.16em] font-[family-name:var(--font-ui)] text-panda-ghost font-semibold text-center">
          Sealed until
        </p>
        <div className="flex justify-center items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setOpenNow(true)}
            className={`rounded-full px-4 py-2.5 text-[13px] font-[family-name:var(--font-ui)] border transition-all ${
              openNow
                ? "border-bamboo bg-bamboo/10 text-bamboo"
                : "border-line-strong text-panda-muted hover:border-panda-ghost"
            }`}
          >
            Open right now
          </button>
          <input
            type="date"
            min={todayIso()}
            value={unlockDate}
            onClick={() => setOpenNow(false)}
            onChange={(e) => { setUnlockDate(e.target.value); setOpenNow(false); }}
            className={`bg-panda-dark border rounded-full px-5 py-2.5 text-[13px] font-[family-name:var(--font-letter)] text-panda-white focus:outline-none [color-scheme:dark] transition-all ${
              !openNow ? "border-panda-white" : "border-line-strong"
            }`}
          />
        </div>
        <p className="text-center font-serif italic text-panda-ghost text-[13px]">
          {openNow
            ? "They'll be able to read it straight away."
            : `Opens ${formatDateLabel(unlockDate)} · Neither of you can open it sooner.`}
        </p>
      </div>

      {error && (
        <p className="text-[13px] font-[family-name:var(--font-ui)] text-nose text-center">
          {error}
        </p>
      )}

      {/* Seal button */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="group relative disabled:opacity-40 transition-all"
        >
          {submitting ? (
            <Image
              src="/assets/wax-seal.png"
              alt="Sealing"
              width={78}
              height={78}
              className="animate-[seal-pulse_1.6s_ease-in-out_infinite]"
            />
          ) : (
            <Image
              src="/assets/wax-seal.png"
              alt="Seal this letter"
              width={78}
              height={78}
              className="group-hover:scale-105 transition-transform drop-shadow-[0_0_20px_rgba(232,160,160,0.3)]"
            />
          )}
        </button>
        <span className="text-[10px] uppercase tracking-[.16em] font-[family-name:var(--font-ui)] text-panda-ghost font-semibold">
          {submitting ? "Sealing your letter…" : "Seal this letter"}
        </span>
      </div>
    </form>
  );
}

function SealedView({
  unlockDate,
  animPhase,
  onReset,
}: {
  unlockDate: string;
  animPhase: number;
  onReset: () => void;
}) {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    function calc() {
      const target = new Date(unlockDate + "T08:00:00Z").getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    }
    setCountdown(calc());
    const interval = setInterval(() => setCountdown(calc()), 1000);
    return () => clearInterval(interval);
  }, [unlockDate]);

  return (
    <div className="text-center space-y-8 py-12 flex flex-col items-center">
      <div
        className={`transition-all duration-500 ${
          animPhase >= 1
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        <div className="relative inline-block">
          {animPhase >= 2 && (
            <Image
              src="/assets/stamp-airmail.png"
              alt="Stamp"
              width={48}
              height={48}
              className="absolute -top-2 -right-4 animate-[stamp-drop_0.5s_ease-out_forwards]"
            />
          )}
          {animPhase >= 3 ? (
            <Image
              src="/assets/wax-seal.png"
              alt="Sealed"
              width={80}
              height={80}
              className="animate-[seal-stamp_0.6s_ease-out_forwards] drop-shadow-[0_0_30px_rgba(232,160,160,0.4)]"
            />
          ) : (
            <Image
              src="/assets/wax-seal.png"
              alt="Seal"
              width={80}
              height={80}
              className="opacity-30"
            />
          )}
        </div>
      </div>

      <p
        className={`font-serif italic text-panda-white text-[20px] transition-all duration-500 ${
          animPhase >= 3 ? "opacity-100" : "opacity-0"
        }`}
      >
        Sealed.
      </p>

      {animPhase >= 4 && (
        <div className="animate-[fade-up_0.5s_ease-out_forwards] space-y-2">
          <div className="flex items-baseline justify-center gap-1 font-[family-name:var(--font-letter)] text-[36px] text-panda-white tabular-nums">
            <span>{String(countdown.days).padStart(2, "0")}</span>
            <span className="text-panda-ghost text-[20px]">:</span>
            <span>{String(countdown.hours).padStart(2, "0")}</span>
            <span className="text-panda-ghost text-[20px]">:</span>
            <span>{String(countdown.minutes).padStart(2, "0")}</span>
            <span className="text-panda-ghost text-[20px]">:</span>
            <span className="text-bamboo">
              {String(countdown.seconds).padStart(2, "0")}
            </span>
          </div>
          <div className="flex justify-center gap-6 text-[9px] uppercase tracking-[.16em] font-[family-name:var(--font-ui)] text-panda-ghost">
            <span>Days</span>
            <span>Hours</span>
            <span>Minutes</span>
            <span>Seconds</span>
          </div>
        </div>
      )}

      <p
        className={`text-panda-muted text-[13px] font-[family-name:var(--font-ui)] transition-all duration-500 ${
          animPhase >= 4 ? "opacity-100" : "opacity-0"
        }`}
      >
        It&apos;ll be delivered on {formatDateLabel(unlockDate)}.
      </p>

      <button
        onClick={onReset}
        className={`text-[13px] font-[family-name:var(--font-ui)] text-bamboo hover:text-bamboo-light transition-all duration-500 ${
          animPhase >= 4 ? "opacity-100" : "opacity-0"
        }`}
      >
        Write another
      </button>
    </div>
  );
}
