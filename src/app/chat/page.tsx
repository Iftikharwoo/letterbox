import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NewChatInput } from "./new-chat-input";

type Conversation = {
  conversation_id: string;
  other_username: string;
  other_id: string;
  last_message: string | null;
  last_message_at: string | null;
};

export default async function ChatListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.username) redirect("/username");

  const { data: conversations } = await supabase.rpc("get_conversations");
  const convos = (conversations as Conversation[]) ?? [];

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-[family-name:var(--font-letter)] text-panda-white tracking-[.06em]">COMMS</h1>
          <Link
            href="/write"
            className="text-[12px] font-[family-name:var(--font-letter)] text-bamboo hover:text-bamboo-light transition-colors tracking-[.04em]"
          >
            TRANSMISSIONS
          </Link>
        </div>

        <NewChatInput />

        {convos.length === 0 ? (
          <p className="font-[family-name:var(--font-letter)] text-panda-ghost text-[13px] text-center py-8 tracking-[.04em]">
            No channels open. Start one above.
          </p>
        ) : (
          <ul className="space-y-2">
            {convos.map((conv) => (
              <li key={conv.conversation_id}>
                <Link
                  href={`/chat/${conv.other_username}`}
                  className="flex items-center gap-3.5 bg-panda-dark border border-line-strong rounded-xl p-4 hover:border-panda-ghost/40 transition-all"
                >
                  <div className="h-9 w-9 rounded-full bg-panda-patch border border-line-strong flex items-center justify-center text-[14px] font-serif text-panda-soft shrink-0">
                    {conv.other_username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-[family-name:var(--font-ui)] text-panda-white font-semibold text-[14px]">
                      @{conv.other_username}
                    </p>
                    {conv.last_message && (
                      <p className="text-[12px] font-[family-name:var(--font-ui)] text-panda-ghost truncate">
                        {conv.last_message}
                      </p>
                    )}
                  </div>
                  {conv.last_message_at && (
                    <span className="text-[11px] font-[family-name:var(--font-letter)] text-panda-ghost shrink-0">
                      {new Date(conv.last_message_at).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
