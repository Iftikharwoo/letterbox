"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export function ChatRoom({
  conversationId,
  initialMessages,
  myId,
  otherUsername,
}: {
  conversationId: string;
  initialMessages: Message[];
  myId: string;
  otherUsername: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  // Scroll to bottom on load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setSending(true);
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: myId,
      content: text,
    });
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
        {messages.length === 0 && (
          <p className="text-center font-[family-name:var(--font-letter)] text-panda-ghost text-[13px] py-12 tracking-[.06em]">
            CHANNEL OPEN · @{otherUsername}
          </p>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === myId;
          const prev = messages[i - 1];
          const sameSenderAsPrev = prev && prev.sender_id === msg.sender_id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} ${sameSenderAsPrev ? "mt-0.5" : "mt-3"}`}
            >
              <div className={`max-w-[75%] group ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                <div
                  className={`px-4 py-2.5 text-[14px] font-[family-name:var(--font-ui)] leading-relaxed break-words whitespace-pre-wrap ${
                    isMe
                      ? "bg-panda-white text-panda-black rounded-2xl rounded-br-sm"
                      : "bg-panda-dark border border-line-strong text-panda-cream rounded-2xl rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] font-[family-name:var(--font-letter)] text-panda-ghost mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                  {formatTime(msg.created_at)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={send}
        className="flex items-end gap-3 px-4 pb-8 pt-3 border-t border-line"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="SEND MESSAGE..."
          rows={1}
          className="flex-1 bg-panda-dark border border-line-strong rounded-2xl px-4 py-3 text-[14px] font-[family-name:var(--font-ui)] text-panda-white placeholder:text-panda-ghost focus:outline-none resize-none leading-relaxed"
          style={{ maxHeight: "120px" }}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="h-10 w-10 rounded-full bg-panda-white text-panda-black flex items-center justify-center disabled:opacity-40 hover:-translate-y-px transition-all shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 8L2.5 2.5L5.5 8L2.5 13.5L13.5 8Z" fill="currentColor" />
          </svg>
        </button>
      </form>
    </div>
  );
}
