// app/auth/callback/page.tsx
import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function OAuthCallback() {
  return (
    <AuthenticateWithRedirectCallback
      afterSignUpUrl="/student"   // new users go here next
      afterSignInUrl="/student"   // existing users go here next
      signUpFallbackRedirectUrl="/student"
    />
  );
}
