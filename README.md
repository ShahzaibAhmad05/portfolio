# MY PORTFOLIO

One of my best works. Designed to track behaviour, improve over time and attract clients.

## Theme Management

All colors are configured in `globals.css`, and reused using classes. Ensures consistency across both themes.

## Structure

Optimized for responsiveness. When a user lands on the site they will see the `IntroSection` fully on their screen. Then if they choose to scroll down they see social proof, and a "still not convinced" link.

## Admin Authentication

At `/secret-dashboard`, protected through google auth. Auth and refresh tokens are managed by `supabase/ssr` implicitly as cookies. From database side the sessions and tokens are managed internally as well. This makes it all simpler.

`lib/supabase/middleware.ts` handles token refreshing and redirects to secret-dashboard.

For adding new admins, open the `admins` table in the db and manually add the email from there, thats it.

## Chats

There's some `<Suspense />` we added which is needed for the `useSearchParams()` to work.

Optional translation: set `chats.language` to a Google language code (e.g. `ur`, `es`). Messages keep typed text in `content` and put the translation in nullable `translated`. Requires `GOOGLE_TRANSLATE_API_KEY` (server-only, Google Cloud Translation API). Empty language = off. Fail-open if translate fails.

Admin-only `chats.nickname` is shown in the dashboard rail, never on the client chat page.

Chat attachments use Cloudflare R2 (S3-compatible). `messages.attachment` stores the private object key; downloads use short-lived signed URLs. Per-chat budget: `chats.current_uploads` / `chats.max_uploads` (bytes). Max 500MB per file. Env:

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```

Bucket should stay private. Add CORS for your site origins (`PUT`, `GET`, `HEAD`).

## Admin Dashboard

Is able to browse all chats and respond to all incoming messages.

## LocalStorage Usage

Storing `chat_id`.

## CSS Global Hints

- `font-sans`: Be Vietnam Pro font
- `font-display`: Bayon font
