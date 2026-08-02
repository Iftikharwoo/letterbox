"use client";

import Image from "next/image";
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
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 text-center">
      {/* Panda ears */}
      <div className="relative">
        <div className="absolute -top-6 -left-8 w-10 h-10 rounded-full bg-panda-white" />
        <div className="absolute -top-6 -right-8 w-10 h-10 rounded-full bg-panda-white" />
        <div className="absolute -top-5 -left-7 w-7 h-7 rounded-full bg-panda-dark" />
        <div className="absolute -top-5 -right-7 w-7 h-7 rounded-full bg-panda-dark" />
        <Image
          src="/assets/wax-seal.png"
          alt="Letterbox"
          width={88}
          height={88}
          className="relative z-10 drop-shadow-[0_0_30px_rgba(232,160,160,0.3)] rounded-full"
          priority
        />
      </div>

      <div className="space-y-3">
        <h1 className="text-[30px] font-serif italic text-panda-white tracking-tight">
          Letterbox
        </h1>
        <p className="font-serif italic text-panda-muted text-[15px] leading-relaxed">
          Some things are worth
          <br />
          waiting for.
        </p>
      </div>

      <button
        onClick={signInWithGoogle}
        className="flex items-center gap-3 rounded-full bg-panda-white border border-transparent px-7 py-3.5 text-[13px] font-[family-name:var(--font-ui)] font-semibold text-panda-black hover:bg-panda-cream hover:-translate-y-px transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.08 24.08 0 0 0 0 21.56l7.98-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Continue with Google
      </button>

      {/* Panda paw prints decoration */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-8 opacity-[0.06]">
        <PawPrint />
        <PawPrint className="rotate-12 translate-y-2" />
        <PawPrint className="-rotate-6" />
      </div>
    </main>
  );
}

function PawPrint({ className = "" }: { className?: string }) {
  return (
    <svg width="32" height="36" viewBox="0 0 32 36" className={className} fill="currentColor">
      <ellipse cx="16" cy="26" rx="9" ry="10" />
      <circle cx="7" cy="10" r="5" />
      <circle cx="25" cy="10" r="5" />
      <circle cx="4" cy="20" r="4" />
      <circle cx="28" cy="20" r="4" />
    </svg>
  );
}
