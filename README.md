# MY PORTFOLIO

One of my best works. Designed to track behaviour, improve over time and attract clients.

## Theme Management

All colors are configured in `globals.css`, and reused using classes. Ensures consistency across both themes.

## Structure

Optimized for responsiveness. When a user lands on the site they will see the `IntroSection` fully on their screen. Then if they choose to scroll down they see social proof, and a "still not convinced" link.

## Admin Stuff

At `/secret-dashboard`, protected through google auth. Auth and refresh tokens are managed by `supabase/ssr` implicitly as cookies. From database side the sessions and tokens are managed internally as well. This makes it all simpler.

`lib/supabase/middleware.ts` handles token refreshing and redirects to secret-dashboard.

For adding new admins, open the `admins` table in the db and manually add the email from there, thats it.
