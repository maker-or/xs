"use client";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authClient } from "../../../lib/auth-client";
import {
  Card,
  CardContent,
} from "../../components/ui/card";

const Page = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Send OTP to email
  const handleSendOtp = async () => {
    if (!email) return;
    try {
      setOtpLoading(true);
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      setOtpSent(true);
      setOtpLoading(false);
    } catch (error) {
      setOtpLoading(false);
      alert("Failed to send OTP");
    }
  };

  // Verify OTP and sign in
  const handleVerifyOtp = async () => {
    if (!otp) return;
    try {
      setOtpLoading(true);
      const result = await authClient.signIn.emailOtp({
        email,
        otp,
      });
      if (result.data) {
        router.push("/dashboard/client-only");
      }
      setOtpLoading(false);
    } catch (error) {
      setOtpLoading(false);
      alert("Invalid OTP");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpSent) {
      handleVerifyOtp();
    } else {
      handleSendOtp();
    }
  };

  return (
    <main className="relative flex h-[100svh] w-[100svw] flex-col items-center justify-center">
      {/* Black background */}
      <div className="absolute inset-0 z-0 bg-black" />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 z-10 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />

      {/* Grid lines - vertical and horizontal */}
      <div className="pointer-events-none absolute inset-0 z-15">
        <div className="absolute top-0 left-[25%] h-full w-px bg-white/30" />
        <div className="absolute top-0 left-[75%] h-full w-px bg-white/30" />
        <div className="absolute top-[25%] left-0 h-px w-full bg-white/30" />
        <div className="absolute top-[75%] left-0 h-px w-full bg-white/30" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[25%] left-[25%] h-3 w-3 transform rounded-full bg-white/80" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[25%] left-[75%] h-3 w-3 transform rounded-full bg-white/80" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[75%] left-[25%] h-3 w-3 transform rounded-full bg-white/80" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[75%] left-[75%] h-3 w-3 transform rounded-full bg-white/80" />
      </div>

      {/* Content */}
      <div className="relative z-20 flex w-full max-w-md flex-col items-center justify-center px-8">
        <Card className="w-full border-none backdrop-blur-md text-white">
          <CardContent>
            <form onSubmit={handleFormSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    disabled={otpSent}
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/20"
                  />
                </div>

                {otpSent && (
                  <div className="grid gap-2">
                    <Label htmlFor="otp" className="text-white">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter verification code"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength={8}
                      className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/20"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40"
                  disabled={otpLoading}
                >
                  {otpLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {otpSent ? "Verify Code" : "Send Verification Code"}
                </Button>

                {otpSent && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                    disabled={otpLoading}
                  >
                    Change Email
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Page;
