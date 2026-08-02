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
            <h1 className="text-[24px] font-serif text-panda-white">Write a letter</h1>
            <p className="text-panda-ghost text-[12px] font-[family-name:var(--font-ui)]">
              Take your time. It&apos;ll keep until the date you choose.
            </p>
          </div>
          <Link
            href="/inbox"
            className="text-[13px] font-[family-name:var(--font-ui)] text-bamboo hover:text-bamboo-light whitespace-nowrap flex items-center gap-1.5 transition-colors"
          >
            Your letters
            {!!unreadCount && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-panda-white px-1.5 text-[11px] text-panda-black font-bold">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>
        <WriteForm />
      </div>
    </main>
  );
}
