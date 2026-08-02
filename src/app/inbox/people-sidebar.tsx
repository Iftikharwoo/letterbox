"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Contact = {
  contact_id: string;
  username: string;
  letters_from_them: number;
};

export function PeopleSidebar({ initial }: { initial: Contact[] }) {
  const [contacts, setContacts] = useState(initial);
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function addContact(e: React.FormEvent) {
    e.preventDefault();
    const username = input.trim().toLowerCase().replace(/^@/, "");
    if (!username) return;
    setAdding(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc("add_contact", {
      lookup_username: username,
    });

    setAdding(false);

    if (rpcError || !data) {
      setError("No one found with that username.");
      return;
    }

    setInput("");
    const { data: fresh } = await supabase.rpc("get_contacts");
    if (fresh) setContacts(fresh as Contact[]);
  }

  async function removeContact(contactId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("contacts")
      .delete()
      .eq("user_id", user.id)
      .eq("contact_id", contactId);

    setContacts((prev) => prev.filter((c) => c.contact_id !== contactId));
  }

  return (
    <div className="bg-panda-dark border border-line-strong rounded-xl p-4 space-y-4">
      <p className="text-[10px] uppercase tracking-[.16em] font-[family-name:var(--font-ui)] text-panda-ghost font-semibold">
        People
      </p>

      {/* Add form */}
      <form onSubmit={addContact} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-1 border-b border-panda-ghost/30 pb-1.5">
          <span className="text-panda-ghost text-[13px] font-[family-name:var(--font-letter)] select-none">
            @
          </span>
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder="username"
            className="flex-1 bg-transparent text-[13px] font-[family-name:var(--font-letter)] text-panda-white placeholder:text-panda-ghost focus:outline-none min-w-0"
          />
        </div>
        <button
          type="submit"
          disabled={adding || !input.trim()}
          className="text-[11px] font-[family-name:var(--font-ui)] font-semibold text-bamboo hover:text-bamboo-light disabled:opacity-40 transition-colors shrink-0"
        >
          {adding ? "…" : "Add"}
        </button>
      </form>

      {error && (
        <p className="text-[12px] font-[family-name:var(--font-ui)] text-nose -mt-2">
          {error}
        </p>
      )}

      {/* Contact list */}
      {contacts.length === 0 ? (
        <p className="font-serif italic text-panda-ghost text-[13px]">
          Add someone to keep track.
        </p>
      ) : (
        <ul className="space-y-3">
          {contacts.map((contact) => (
            <li
              key={contact.contact_id}
              className="flex items-center gap-2.5 group"
            >
              {/* Avatar initial */}
              <div className="h-7 w-7 rounded-full bg-panda-patch border border-line-strong flex items-center justify-center text-[12px] font-serif text-panda-soft shrink-0">
                {contact.username[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-[family-name:var(--font-ui)] text-panda-white truncate leading-tight">
                  @{contact.username}
                </p>
                <p className="text-[10px] font-[family-name:var(--font-letter)] text-panda-ghost leading-tight">
                  {contact.letters_from_them === 0
                    ? "no letters yet"
                    : contact.letters_from_them === 1
                    ? "1 letter"
                    : `${contact.letters_from_them} letters`}
                </p>
              </div>

              {/* Actions — show on hover */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-all shrink-0">
                <Link
                  href={`/chat/${contact.username}`}
                  aria-label="Message"
                  className="text-panda-ghost hover:text-bamboo transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M10 1H2C1.45 1 1 1.45 1 2V8C1 8.55 1.45 9 2 9H4L6 11L8 9H10C10.55 9 11 8.55 11 8V2C11 1.45 10.55 1 10 1Z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <button
                  onClick={() => removeContact(contact.contact_id)}
                  aria-label="Remove"
                  className="text-panda-ghost hover:text-nose transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M1 1L9 9M9 1L1 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
