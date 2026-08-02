import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import webpush from "npm:web-push@3";

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT")!,
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!
);

function notificationCopy(letter: {
  is_self: boolean;
  is_anonymous: boolean;
  sender_username: string | null;
}) {
  if (letter.is_self) return "Your letter from your past self is ready for you.";
  if (letter.is_anonymous) return "A letter from someone is ready for you.";
  return `A letter from ${letter.sender_username ?? "someone"} is ready for you.`;
}

// Invoked once daily by pg_cron with the project's secret key. Flips any
// letter whose unlock_date has arrived from 'sealed' to 'unlocked', then
// pushes a notification to whoever it's for (recipient, or the author
// themselves for a self-letter). Not meant to be called by end users.
export default {
  fetch: withSupabase({ auth: ["secret"] }, async (_req, ctx) => {
    if (ctx.authMode !== "secret") {
      return new Response("Forbidden", { status: 403 });
    }

    const today = new Date().toISOString().slice(0, 10);

    const { data: due, error: dueError } = await ctx.supabaseAdmin
      .from("letters")
      .select("id, sender_id, recipient_id, is_anonymous")
      .eq("status", "sealed")
      .lte("unlock_date", today);

    if (dueError) {
      return Response.json({ error: dueError.message }, { status: 500 });
    }
    if (!due || due.length === 0) {
      return Response.json({ unlocked: 0, notified: 0 });
    }

    const { error: updateError } = await ctx.supabaseAdmin
      .from("letters")
      .update({ status: "unlocked" })
      .in(
        "id",
        due.map((l) => l.id)
      );

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    let notified = 0;

    for (const letter of due) {
      const isSelf = letter.recipient_id === null;
      const targetUserId = letter.recipient_id ?? letter.sender_id;

      const { data: targetUser } = await ctx.supabaseAdmin
        .from("users")
        .select("push_token")
        .eq("id", targetUserId)
        .maybeSingle();

      if (!targetUser?.push_token) continue;

      let senderUsername: string | null = null;
      if (!isSelf && !letter.is_anonymous) {
        const { data: sender } = await ctx.supabaseAdmin
          .from("users")
          .select("username")
          .eq("id", letter.sender_id)
          .maybeSingle();
        senderUsername = sender?.username
          ? `@${sender.username}`
          : null;
      }

      const body = notificationCopy({
        is_self: isSelf,
        is_anonymous: letter.is_anonymous,
        sender_username: senderUsername,
      });

      try {
        const subscription = JSON.parse(targetUser.push_token);
        await webpush.sendNotification(
          subscription,
          JSON.stringify({ title: "Letterbox", body, url: "/inbox" })
        );
        notified++;
      } catch (err) {
        // 410/404 means the browser subscription is gone -- clear it so we
        // stop trying. Any other error we just log and move on.
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) {
          await ctx.supabaseAdmin
            .from("users")
            .update({ push_token: null })
            .eq("id", targetUserId);
        } else {
          console.error("push failed", targetUserId, err);
        }
      }
    }

    return Response.json({ unlocked: due.length, notified });
  }),
};
