# Admin-assisted password reset (beta)

Email password reset is not available yet. During the free beta, Chris resets passwords manually.

## Rules

1. Only act on a request that comes **from the account’s own email address** (the address on the `users` row).
2. Reply to that account address (do not “reply all” to unknown CCs) so the temporary password only reaches the real owner.
3. Identity is checked only by the sender address; treat spoofed From: headers carefully and prefer confirming via a reply thread to the account inbox.
4. Old sessions stay valid until the JWT expires (up to 7 days). Acceptable for beta.
5. There is no in-app “change password” screen yet — the temporary password remains until email reset ships.

## Steps

1. Generate a strong temporary password (e.g. `openssl rand -base64 18`).
2. From the repo root, hash it (interactive prompt — not a CLI argument):

   ```bash
   node server/scripts/hash-password.mjs
   ```

3. In pgAdmin, on the TableTap database:

   ```sql
   UPDATE users
   SET password_hash = '<paste-hash-here>'
   WHERE email = '<exact-account-email>';
   ```

4. Confirm one row was updated.
5. Email the temporary password to the account address. Ask the tester to sign in and keep the temp password until self-service reset is available.

## After reset

- Old password must return 401 on login.
- New password must work.
- Document the request in your beta feedback list (who, when).
