import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChatRoom } from "./chat-room";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
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

  const { data: conversationId } = await supabase.rpc(
    "get_or_create_conversation",
    { other_username: username }
  );

  if (!conversationId) redirect("/chat");

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(100);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-line shrink-0">
        <Link
          href="/chat"
          className="text-panda-ghost hover:text-panda-white transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M11 4L6 9L11 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <div className="h-8 w-8 rounded-full bg-panda-patch border border-line-strong flex items-center justify-center text-[13px] font-serif text-panda-soft shrink-0">
          {username[0].toUpperCase()}
        </div>
        <p className="font-[family-name:var(--font-ui)] text-panda-white font-semibold text-[15px]">
          @{username}
        </p>
      </div>

      <ChatRoom
        conversationId={conversationId}
        initialMessages={messages ?? []}
        myId={user.id}
        otherUsername={username}
      />
    </div>
  );
}
