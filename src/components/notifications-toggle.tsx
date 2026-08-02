"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

type Status = "unsupported" | "checking" | "subscribed" | "unsubscribed";

export function NotificationsToggle() {
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    (async () => {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      const existing = await registration.pushManager.getSubscription();
      setStatus(existing ? "subscribed" : "unsubscribed");
    })();
  }, []);

  async function subscribe() {
    setBusy(true);
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("Missing VAPID public key");

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("users")
        .update({ push_token: JSON.stringify(subscription) })
        .eq("id", user.id);

      setStatus("subscribed");
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      await subscription?.unsubscribe();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("users").update({ push_token: null }).eq("id", user.id);
      }

      setStatus("unsubscribed");
    } finally {
      setBusy(false);
    }
  }

  if (status === "unsupported" || status === "checking") return null;

  return (
    <button
      onClick={status === "subscribed" ? unsubscribe : subscribe}
      disabled={busy}
      className="text-sm underline text-neutral-600 disabled:opacity-40"
    >
      {status === "subscribed" ? "Notifications on" : "Enable notifications"}
    </button>
  );
}
