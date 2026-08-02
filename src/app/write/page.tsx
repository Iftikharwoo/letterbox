import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { WriteForm } from "./write-form";

export default async function WritePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.username) {
    redirect("/username");
  }

  const { data: unreadCount } = await supabase.rpc("get_unread_count");

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-[20px] font-[family-name:var(--font-letter)] text-panda-white tracking-[.06em]">NEW TRANSMISSION</h1>
            <p className="text-panda-ghost text-[11px] font-[family-name:var(--font-letter)] tracking-[.04em]">
              Compose a message. Delivers instantly.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/chat"
              className="text-[12px] font-[family-name:var(--font-letter)] text-panda-ghost hover:text-panda-white transition-colors tracking-[.04em]"
            >
              COMMS
            </Link>
            <Link
              href="/inbox"
              className="text-[12px] font-[family-name:var(--font-letter)] text-bamboo hover:text-bamboo-light whitespace-nowrap flex items-center gap-1.5 transition-colors tracking-[.04em]"
            >
              INBOX
              {!!unreadCount && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-panda-white px-1.5 text-[11px] text-panda-black font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>
        <WriteForm />
      </div>
    </main>
  );
}
