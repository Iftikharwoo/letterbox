import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UsernameForm } from "./username-form";

export default async function UsernamePage() {
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

  if (profile?.username) {
    redirect("/write");
  }

  return (
    <main className="flex min-h-screen flex-col items-start justify-center px-8 max-w-md mx-auto">
      <p className="text-[10px] uppercase tracking-[.16em] font-[family-name:var(--font-ui)] text-bamboo font-semibold mb-3">
        One last thing
      </p>
      <h1 className="text-[28px] font-serif text-panda-white leading-tight mb-2">
        What should people call you?
      </h1>
      <p className="text-[14px] text-panda-muted font-[family-name:var(--font-ui)] mb-8">
        This is how letters find you.
      </p>
      <UsernameForm />
    </main>
  );
}
