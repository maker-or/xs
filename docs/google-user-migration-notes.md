# Google User Auth Migration to Better Auth

This document describes changes made to migrate `google_user` flows from Clerk to Better Auth while keeping the product deployable and focused on `/learning` access.

## Summary
- Replaced Clerk client/auth in learning surfaces with Better Auth (`useSession`) and wired Convex to Better Auth provider.
- Allowed `/learning` routes to bypass Clerk middleware and special-route gating so Better Auth controls access.
- Onboarding now assumes `google_user` and redirects to `/learning` using Better Auth session.

## Files changed
- `src/components/ConvexClientProvider.tsx`: Switched from `ConvexProviderWithClerk` to `ConvexBetterAuthProvider` using `authClient`.
- `src/app/layout.tsx`: Removed `ClerkProvider`, render tree no longer gated by `SignedIn/SignedOut`. Kept `RoleRedirect` and `SpecialRoutes` with Better Auth.
- `src/middleware.ts`: Marked `/learning(.*)` as public for Clerk so Better Auth can handle it.
- `src/components/ui/RoleRedirect.tsx`: Now uses Better Auth `useSession` and assumes `google_user` for current phase; checks access via `canAccessRoute`.
- `src/components/AiHome.tsx`: Replaced Clerk `useAuth` with Better Auth `useSession` for gating chat/learn actions.
- `src/app/learning/library/page.tsx`: Removed Clerk gating; rely on server-side Convex auth and Better Auth.
- `src/components/ui/Course.tsx`: Replaced Clerk `useAuth` with Better Auth `useSession`; redirect unauthenticated users to `/select`.
- `src/app/onboarding/page.tsx`: Removed Clerk usage; uses Better Auth session and treats the current user as `google_user` to redirect to `/learning`.
- `src/components/ui/SpecialRoutes.tsx`: Added `/learning` to the special routes.

## Behavioral changes
- Google sign-in via Better Auth continues to work from `src/app/select/page.tsx`. After sign-in, users go to `/onboarding`, which immediately redirects `google_user` to `/learning`.
- `/learning` pages and Convex queries/mutations authenticate via Better Auth session; unauthenticated requests are rejected server-side.
- Non-learning areas may still reference Clerk; they are out-of-scope for this phase and may be disabled for `google_user` by `RoleRedirect`.

## Environment variables
- Ensure Better Auth is configured:
  - `BETTER_AUTH_URL` or `NEXT_PUBLIC_BETTER_AUTH_URL`
  - Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - Email OTP (if used): `GMAIL_USER`, `GMAIL_APP_PASSWORD`
  - Convex: `NEXT_PUBLIC_CONVEX_URL`

## Testing checklist
- Sign in with Google on `/select` using Better Auth; should land on `/onboarding` then `/learning`.
- Create a course from the home UI and open stages; Convex should succeed.
- Visit `/learning/library`; queries load.
- Attempt to access non-learning routes; access should be denied or redirected.

## Next steps (recommended)
- Migrate API routes off Clerk auth to Better Auth.
- Remove Clerk dependencies and UI components.
- Unify role detection with Better Auth claims and drop Clerk-specific metadata usage.
