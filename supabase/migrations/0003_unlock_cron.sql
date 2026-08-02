-- Daily job that calls the unlock-letters Edge Function, which flips any
-- letter whose unlock_date has arrived from 'sealed' to 'unlocked' and sends
-- the push notification. The function's secret key is stored in Vault
-- (set separately, outside version control) and looked up by name here --
-- never inlined, since this file is committed to a public repo.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'unlock-letters-daily',
  '0 8 * * *', -- 08:00 UTC daily
  $$
  select net.http_post(
    url := 'https://ngcjximcsmbjgrpagixf.supabase.co/functions/v1/unlock-letters',
    headers := jsonb_build_object(
      'apiKey', (select decrypted_secret from vault.decrypted_secrets where name = 'unlock_letters_secret_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
