import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../src/server/db";
import { emailOTP } from "better-auth/plugins";
import { Resend } from "resend";
import { schema } from "../src/server/db/schema";

// Initialize Resend instance
const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg",schema }), // Use "pg" for PostgreSQL.
  plugins: [
    emailOTP({
      // Important: This function sends the OTP using Resend
      async sendVerificationOTP({ email, otp, type }) {
        console.log("the mail will be sent to :",email)
        await resend.emails.send({
          from: "harshith10295032@gmail.com", // Use your verified sender
          to: email,
          subject: "Your Verification Code",
          html: `<p>Your verification code is: <b>${otp}</b></p>`,
        });
      },
      otpLength: 8,
      expiresIn: 600, // 10 minutes
    }),
  ],
});
