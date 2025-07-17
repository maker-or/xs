"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSignUp, useSignIn } from "@clerk/nextjs";

export default function AcceptInvitationPage() {
  const params = useSearchParams();
  const ticket = params.get("__clerk_ticket");
  const status = params.get("__clerk_status");
  const router = useRouter();
  const {
    signUp,
    isLoaded: signUpLoaded,
    setActive: setActiveSignUp,
  } = useSignUp();
  const {
    signIn,
    isLoaded: signInLoaded,
    setActive: setActiveSignIn,
  } = useSignIn();

  useEffect(() => {
    const completeSignUp = async () => {
      if (!ticket || !signUpLoaded)
        return console.error(
          "either the ticket or the sign-up process is not loaded",
        );

      try {
        const result = await signUp.create({ strategy: "ticket", ticket });
        await setActiveSignUp({ session: result.createdSessionId });
        router.push("/onboarding");
      } catch (err) {
        console.error("Sign-up via ticket failed:", err);
      }
    };

    const completeSignIn = async () => {
      if (!ticket || !signInLoaded) return;

      try {
        const result = await signIn.create({ strategy: "ticket", ticket });
        await setActiveSignIn({ session: result.createdSessionId });
        router.push("/dashboard");
      } catch (err) {
        console.error("Sign-in via ticket failed:", err);
      }
    };

    if (status === "sign_up") {
      completeSignUp();
    } else if (status === "sign_in") {
      completeSignIn();
    } else {
      console.warn("Invalid or missing __clerk_status");
    }
  }, [ticket, status, signUpLoaded, signInLoaded]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050A06] text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-solid border-blue-500"></div>
        <p>Processing your invitation...</p>
      </div>
    </div>
  );
}
