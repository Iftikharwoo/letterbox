import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    // First sign-in: create the profile row. email comes from the verified
    // Google identity, never from client input.
    await supabase.from("users").insert({
      id: user.id,
      email: user.email,
    });
  }

  const needsUsername = !profile?.username;
  return NextResponse.redirect(
    `${origin}${needsUsername ? "/username" : "/write"}`
  );
}
