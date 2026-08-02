import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LetterList, type InboxLetter } from "./letter-list";
import { PeopleSidebar } from "./people-sidebar";
import { NotificationsToggle } from "@/components/notifications-toggle";

type Contact = {
  contact_id: string;
  username: string;
  letters_from_them: number;
};

export default async function InboxPage() {
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

  const [{ data: letters }, { data: contacts }] = await Promise.all([
    supabase.rpc("get_inbox"),
    supabase.rpc("get_contacts"),
  ]);

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[20px] font-[family-name:var(--font-letter)] text-panda-white tracking-[.06em]">INCOMING</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/chat"
              className="text-[12px] font-[family-name:var(--font-letter)] text-panda-ghost hover:text-panda-white transition-colors tracking-[.04em]"
            >
              COMMS
            </Link>
            <Link
              href="/write"
              className="text-[12px] font-[family-name:var(--font-letter)] text-bamboo hover:text-bamboo-light transition-colors tracking-[.04em]"
            >
              COMPOSE
            </Link>
          </div>
        </div>

        {/* Two-column layout: letters left, people right */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Letters column */}
          <div className="w-full lg:flex-1 space-y-6">
            <div className="flex justify-center">
              <NotificationsToggle />
            </div>
            <LetterList letters={(letters as InboxLetter[]) ?? []} />
          </div>

          {/* People sidebar */}
          <div className="w-full lg:w-56 shrink-0">
            <PeopleSidebar initial={(contacts as Contact[]) ?? []} />
          </div>
        </div>
      </div>
    </main>
  );
}
