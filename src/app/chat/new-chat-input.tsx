"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewChatInput() {
  const [input, setInput] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const username = input.trim().toLowerCase().replace(/^@/, "");
    if (!username) return;
    router.push(`/chat/${username}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="flex-1 flex items-center gap-1 bg-panda-dark border border-line-strong rounded-full px-4 py-2.5">
        <span className="text-panda-ghost text-[13px] font-[family-name:var(--font-letter)] select-none">@</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="callsign"
          className="flex-1 bg-transparent text-[13px] font-[family-name:var(--font-letter)] text-panda-white placeholder:text-panda-ghost focus:outline-none min-w-0"
        />
      </div>
      <button
        type="submit"
        disabled={!input.trim()}
        className="rounded-full bg-panda-white text-panda-black px-4 py-2.5 text-[13px] font-[family-name:var(--font-ui)] font-semibold disabled:opacity-40 hover:-translate-y-px transition-all"
      >
        OPEN
      </button>
    </form>
  );
}
