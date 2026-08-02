import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LetterList, type InboxLetter } from "./letter-list";

export default async function InboxPage() {
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

  const { data: letters } = await supabase.rpc("get_inbox");

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif">Your inbox</h1>
          <Link href="/write" className="text-sm underline text-neutral-600">
            Write a letter
          </Link>
        </div>
        <LetterList letters={(letters as InboxLetter[]) ?? []} />
      </div>
    </main>
  );
}
