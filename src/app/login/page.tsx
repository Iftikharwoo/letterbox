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
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 text-center">
      {/* Terminal icon */}
      <div className="relative">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <rect x="1" y="1" width="70" height="70" rx="3" stroke="#00d4ff" strokeWidth="1.5" strokeOpacity="0.5" />
          <rect x="1" y="1" width="70" height="10" rx="3" fill="#00d4ff" fillOpacity="0.06" />
          <circle cx="12" cy="6" r="2" fill="#ff4a6f" fillOpacity="0.7" />
          <circle cx="21" cy="6" r="2" fill="#ffad00" fillOpacity="0.7" />
          <circle cx="30" cy="6" r="2" fill="#00ff9f" fillOpacity="0.7" />
          <path d="M14 30L24 36L14 42" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="28" y="42" width="30" height="2" rx="1" fill="#00d4ff" fillOpacity="0.35" />
          <rect x="28" y="35" width="18" height="2" rx="1" fill="#00d4ff" fillOpacity="0.6" />
          <rect x="47" y="35" width="3" height="8" rx="0.5" fill="#00d4ff" fillOpacity="0.9">
            <animate attributeName="opacity" values="0.9;0;0.9" dur="1.1s" repeatCount="indefinite" />
          </rect>
          <rect x="28" y="50" width="22" height="2" rx="1" fill="#00d4ff" fillOpacity="0.2" />
        </svg>
        <div
          className="absolute inset-0"
          style={{ boxShadow: "0 0 40px rgba(0,212,255,0.12), 0 0 80px rgba(0,212,255,0.05)" }}
        />
      </div>

      <div className="space-y-3">
        <h1 className="text-[28px] font-[family-name:var(--font-letter)] text-panda-white tracking-[.12em]">
          LETTERBOX
        </h1>
        <p className="font-[family-name:var(--font-letter)] text-panda-muted text-[12px] tracking-[.08em] leading-loose">
          secure transmission system
          <br />
          <span className="text-bamboo">v2.4.1</span> · online
        </p>
      </div>

      <button
        onClick={signInWithGoogle}
        className="flex items-center gap-3 bg-panda-dark border border-line-strong hover:border-panda-white/40 hover:shadow-[0_0_24px_rgba(0,212,255,0.12)] px-7 py-3.5 text-[12px] font-[family-name:var(--font-letter)] font-semibold text-panda-cream hover:-translate-y-px transition-all"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.08 24.08 0 0 0 0 21.56l7.98-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        AUTHENTICATE VIA GOOGLE
      </button>

      {/* HUD corners */}
      <div className="fixed bottom-8 left-8 font-[family-name:var(--font-letter)] text-[10px] text-panda-ghost/60 text-left leading-relaxed pointer-events-none select-none">
        <div>SYS · READY</div>
        <div>CONN · SECURE</div>
        <div>PROTO · v2</div>
      </div>
      <div className="fixed bottom-8 right-8 font-[family-name:var(--font-letter)] text-[10px] text-panda-ghost/60 text-right leading-relaxed pointer-events-none select-none">
        <div>LAT 25.2°N</div>
        <div>LON 55.3°E</div>
        <div>TZ GST+4</div>
      </div>

      {/* Corner brackets */}
      <svg className="fixed top-6 left-6 opacity-20 pointer-events-none" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M0 10V0H10" stroke="#00d4ff" strokeWidth="1.5" />
      </svg>
      <svg className="fixed top-6 right-6 opacity-20 pointer-events-none" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M24 10V0H14" stroke="#00d4ff" strokeWidth="1.5" />
      </svg>
      <svg className="fixed bottom-6 left-6 opacity-20 pointer-events-none" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M0 14V24H10" stroke="#00d4ff" strokeWidth="1.5" />
      </svg>
      <svg className="fixed bottom-6 right-6 opacity-20 pointer-events-none" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M24 14V24H14" stroke="#00d4ff" strokeWidth="1.5" />
      </svg>
    </main>
  );
}
