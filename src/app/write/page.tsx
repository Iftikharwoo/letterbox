import { redirect } from "next/navigation";
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

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16">
      <div className="w-full max-w-lg space-y-8">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-serif">Write a letter</h1>
          <p className="text-neutral-500 text-sm">
            Take your time. It&apos;ll keep until the date you choose.
          </p>
        </div>
        <WriteForm />
      </div>
    </main>
  );
}
