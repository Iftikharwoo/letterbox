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
      <p className="text-[10px] uppercase tracking-[.2em] font-[family-name:var(--font-letter)] text-bamboo font-semibold mb-3">
        REGISTRATION
      </p>
      <h1 className="text-[28px] font-[family-name:var(--font-letter)] text-panda-white leading-tight mb-2 tracking-[.04em]">
        Register your callsign.
      </h1>
      <p className="text-[13px] text-panda-muted font-[family-name:var(--font-letter)] mb-8 tracking-[.02em]">
        Your identifier in the system.
      </p>
      <UsernameForm />
    </main>
  );
}
