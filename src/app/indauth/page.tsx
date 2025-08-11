'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { authClient } from '../../../lib/auth-client';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '../../components/ui/input-otp';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';



const Indauth = () => {
  const router = useRouter();



  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'validating' | 'sending' | 'verifying'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateDomain = async (emailToValidate: string) => {
    const res = await fetch('/api/auth/validate_domain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailToValidate }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    if (!data?.isValid) {
      throw new Error(data?.message || "Your college doesn't have access to sphereai,continue with google");
    }
  };

  const handleSendOtp = async () => {
    if (!email) return;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      setPhase('validating');
      await validateDomain(email);

      setPhase('sending');
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      });

      setOtpSent(true);
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Failed to validate domain or send verification code. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setPhase('idle');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      setPhase('verifying');
      const result = await authClient.signIn.emailOtp({
        email,
        otp,
      });

      if (result?.data) {
        router.push('/onboarding?type=college');
        return;
      }

      setErrorMessage('Invalid verification code. Please try again.');
    } catch {
      setErrorMessage('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
      setPhase('idle');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpSent) {
      void handleVerifyOtp();
    } else {
      void handleSendOtp();
    }
  };

  return (
    <main className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#0c0c0c] text-white">
      {/* Noise background */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />

      {/* Decorative grid lines and circles */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {/* Vertical lines */}
        <div className="absolute top-0 left-[20%] h-full w-px bg-gradient-to-b from-white/30 via-white/10 to-white/30" />
        <div className="absolute top-0 left-[80%] h-full w-px bg-gradient-to-b from-white/30 via-white/10 to-white/30" />
        {/* Horizontal lines */}
        <div className="absolute top-[15%] left-[20%] h-px w-[60%] bg-gradient-to-r from-white/30 via-white/10 to-white/30" />
        <div className="absolute top-[85%] left-[20%] h-px w-[60%] bg-gradient-to-r from-white/30 via-white/10 to-white/30" />
        {/* Corner circles */}
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[15%] left-[20%] h-3 w-3 rounded-full bg-white/60 shadow-lg" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[15%] left-[80%] h-3 w-3 rounded-full bg-white/60 shadow-lg" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[85%] left-[20%] h-3 w-3 rounded-full bg-white/60 shadow-lg" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[85%] left-[80%] h-3 w-3 rounded-full bg-white/60 shadow-lg" />
      </div>

      {/* Main content */}
      <div className="relative z-30 flex w-full max-w-md flex-col items-center justify-center px-6">
        <h1 className="mb-6 text-center font-light text-[2em]">
          Enter your <span className="font-serif italic">college mail</span>
        </h1>

        <Card className="w-full border-none bg-white/5 backdrop-blur-md">
          <CardContent className="pt-6">
            <form onSubmit={handleFormSubmit} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-white/90">
                  College email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="college@mail.edu"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  disabled={otpSent || isLoading}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/20"
                />
              </div>

              {otpSent && (
                <div className="grid gap-2">
                  <Label htmlFor="otp" className="text-white/90">
                    Verification Code
                  </Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={8}
                      pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                      className="text-white"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={0}
                          className="border-white/20 bg-white/10 text-white focus:border-white/40 focus:bg-white/20"
                        />
                        <InputOTPSlot
                          index={1}
                          className="border-white/20 bg-white/10 text-white focus:border-white/40 focus:bg-white/20"
                        />
                        <InputOTPSlot
                          index={2}
                          className="border-white/20 bg-white/10 text-white focus:border-white/40 focus:bg-white/20"
                        />
                        <InputOTPSlot
                          index={3}
                          className="border-white/20 bg-white/10 text-white focus:border-white/40 focus:bg-white/20"
                        />
                        <InputOTPSlot
                          index={4}
                          className="border-white/20 bg-white/10 text-white focus:border-white/40 focus:bg-white/20"
                        />
                        <InputOTPSlot
                          index={5}
                          className="border-white/20 bg-white/10 text-white focus:border-white/40 focus:bg-white/20"
                        />
                        <InputOTPSlot
                          index={6}
                          className="border-white/20 bg-white/10 text-white focus:border-white/40 focus:bg-white/20"
                        />
                        <InputOTPSlot
                          index={7}
                          className="border-white/20 bg-white/10 text-white focus:border-white/40 focus:bg-white/20"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {otpSent
                  ? phase === 'verifying'
                    ? 'Verifying...'
                    : 'Verify Code'
                  : phase === 'validating'
                    ? 'Validating domain...'
                    : phase === 'sending'
                      ? 'Sending Code...'
                      : 'Send Verification Code'}
              </Button>

              {otpSent && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setErrorMessage(null);
                  }}
                  disabled={isLoading}
                >
                  Change Email
                </Button>
              )}

              {errorMessage && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
                  <p className="text-sm text-red-400">{errorMessage}</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Indauth;
