import { betterAuth,BetterAuthOptions } from "better-auth";
import { convexAdapter } from "@convex-dev/better-auth";
import { emailOTP } from "better-auth/plugins";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuthComponent } from "../convex/auth";
import { GenericCtx } from "../convex/_generated/server";

const createOptions = (ctx: GenericCtx) =>
  ({
    baseURL: "http://localhost:3000",
    trustedOrigins: ["http://localhost:3000", "https://localhost:3000"],
    database: convexAdapter(ctx, betterAuthComponent),
    account: {
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
      },
    },

    socialProviders: {
      google: {
        prompt: "select_account",
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    plugins: [

      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          console.log(`📧 Would send ${type} OTP to ${email}: ${otp}`);

          // TODO: Implement email sending via a separate service or API route
          // For now, just log the OTP for development
          console.log("OTP:", otp);
        },

        otpLength: 8,
        expiresIn: 600,
      }),
    ],
  }) satisfies BetterAuthOptions;



export const createAuth = (ctx: GenericCtx) => {
  const options = createOptions(ctx);
  return betterAuth({
    ...options,
    plugins: [
      ...options.plugins,
      // Pass in options so plugin schema inference flows through. Only required
      // for plugins that customize the user or session schema.
      // See "Some caveats":
      // https://www.better-auth.com/docs/concepts/session-management#customizing-session-response
      convex({ options }),
    ],
  });
};
