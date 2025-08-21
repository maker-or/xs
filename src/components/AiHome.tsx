'use client';

import { ArrowClockwiseIcon, ArrowUpIcon } from '@phosphor-icons/react';
import { useForm } from '@tanstack/react-form';
import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { api } from '../../convex/_generated/api';
import { Button } from './ui/button';
import ChatCommandPalette from './ui/ChatCommandPalette';
import { useConvexAuth } from "convex/react";

import 'katex/dist/katex.min.css';

import { useRouter } from 'next/navigation';

const zschema = z.object({
  userPrompt: z
    .string()
    .trim()
    .min(2, { message: 'Input cannot be empty or just spaces' }),
});

type FormValues = z.infer<typeof zschema>;

// Enhanced Content Block Component

import { useAuthAction, useAuthMutation } from '~/hooks/useAuthMutation';

const AiHome = () => {
  const navigate = useRouter();
    const { isAuthenticated,isLoading} = useConvexAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [apptype, setapptype] = useState<'chart' | 'learn'>('chart');
  const [showChatPalette, setShowChatPalette] = useState(false);

  const createChat = useAuthMutation(api.chats.createChat);
  const addMessage = useAuthMutation(api.message.addMessage);
  const chat = useAuthAction(api.ai.streamChatCompletion);
  const learn = useAuthAction(api.context.contextgather);
  const runAgent = useAuthAction(api.agent.agent);

  // Form for creating new learning content
  const form = useForm({
    defaultValues: {
      userPrompt: '',
    } as FormValues,
    onSubmit: async ({ value }) => {
      if (isLoading || !isAuthenticated) {
        setError('You must be signed in to start a chat.');
        return;
      }
      if (isSubmitting) return;

      setIsSubmitting(true);
      setError(null);
      console.log('the values are:', value);
      form.reset();

      if (apptype === 'learn') {
        try {
          // Step 1: Create course structure
          setLoadingStep('Creating course structure...');
          const { CourseId } = await learn({
            messages: value.userPrompt.trim(),
          });

          // Step 2: Navigate immediately to show course canvas
          setLoadingStep('Preparing your course...');
          navigate.push(`/learning/learn/${CourseId}`);

          // Step 3: Generate content in background (non-blocking)
          // Don't await - let it run in background
          runAgent({ courseId: CourseId }).catch((error) => {
            console.error('Agent processing failed:', error);
            // Could show a toast notification here
          });
        } catch (error) {
          console.error('Failed to create course:', error);
          setError('Failed to create course. Please try again.');
        } finally {
          setIsSubmitting(false);
          setLoadingStep('');
        }
      } else {
        try {
          const newChatId = await createChat({
            title: value.userPrompt.slice(0, 50),
            model: 'nvidia/llama-3.3-nemotron-super-49b-v1:free',
          });

          const messageId = await addMessage({
            chatId: newChatId,
            content: value.userPrompt,
            role: 'user',
          });

          chat({
            chatId: newChatId,
            messages: value.userPrompt.trim(),
            parentMessageId: messageId,
          });
          navigate.push(`/learning/chat/${newChatId}`);
        } catch (error) {
          console.error(error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    validators: {
      onSubmit: zschema,
    },
  });

  // Keyboard shortcuts for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowChatPalette(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Creation mode - matching the UI design from the image
  return (
    <main className="relative grid h-[100svh] w-[100svw] grid-cols-[1fr_2fr_1fr] grid-rows-[1fr_2fr_1fr]">
      {/* Gradient background similar to the image */}
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
        {/* Vertical lines - adjusted for new proportions */}
        <div className="absolute top-0 left-[25%] h-full w-px bg-white/30" />
        <div className="absolute top-0 left-[75%] h-full w-px bg-white/30" />
        {/* Horizontal lines - adjusted for new proportions */}
        <div className="absolute top-[25%] left-0 h-px w-full bg-white/30" />
        <div className="absolute top-[75%] left-0 h-px w-full bg-white/30" />
        {/* Corner circles - adjusted for new proportions */}
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[25%] left-[25%] h-3 w-3 transform rounded-full bg-white/80" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[25%] left-[75%] h-3 w-3 transform rounded-full bg-white/80" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[75%] left-[25%] h-3 w-3 transform rounded-full bg-white/80" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[75%] left-[75%] h-3 w-3 transform rounded-full bg-white/80" />
      </div>

      {/* Top-left cell */}
      <div className="relative z-20" />

      {/* Top-center cell - Navigation and Heading */}
      <div className="relative z-20 flex flex-col items-end justify-end space-y-8">
        {/* Navigation buttons */}
        <div className="flex w-full items-center justify-center gap-8 border-white/30 border-t p-2">
          <button
            className={`font-medium text-3xl ${apptype == 'chart' ? 'text-white' : 'text-gray-400'}`}
            onClick={() => setapptype('chart')}
          >
            {' '}
            Chat
          </button>
          <button
            className={`font-medium text-3xl ${apptype == 'learn' ? 'text-white' : 'text-gray-400'}`}
            onClick={() => setapptype('learn')}
          >
            {' '}
            Learn
          </button>
          <button
            className="font-medium text-3xl text-gray-400 hover:text-white transition-colors"
            onClick={() => navigate.push('/learning/library')}
          >
            {' '}
            Library
          </button>
        </div>

        {/* Command palette hint */}
      </div>

      {/* Top-right cell */}
      <div className="relative z-20" />

      {/* Middle-left cell */}
      <div className="relative z-20" />

      {/* Middle-center cell - Main content area (largest) */}
      <div className="relative z-20 flex flex-col items-center justify-center p-3">
        {/* Main heading */}
        {apptype === 'chart' ? (
          <h1 className="text-center font-light text-[4em] text-white">
            Whats on <span className="font-serif italic">your Mind</span>
          </h1>
        ) : (
          <h1 className="text-center font-light text-[4em] text-white">
            <span className="font-serif italic">learning</span> made easy
          </h1>
        )}

        <div className="w-full max-w-2xl rounded-xl bg-[#E9E9E9] p-1">
          {/* Input form */}
          <form
            className="relative"
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit();
            }}
          >
            <div className="space-y-3">
              <form.Field name="userPrompt">
                {({ state, handleBlur, handleChange }) => (
                  <>
                    <textarea
                      className="min-h-[120px] w-full resize-none rounded-xl border-none bg-[#D2D2D2] px-6 py-4 text-black text-lg placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-0"
                      onBlur={handleBlur}
                      onChange={(e) => handleChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          void form.handleSubmit();
                        }
                      }}
                      placeholder={apptype === 'learn' ? 'what do you want to learn today?' : 'start here......'}
                      value={state.value}
                    />

                    {/* Submit button positioned below textarea */}
                    <div className="flex justify-end">
                      <form.Subscribe
                        selector={(state) => [
                          state.canSubmit,
                          state.isSubmitting,
                        ]}
                      >
                        {([canSubmit, isSubmitting]) => (
                          <Button
                            className="flex h-10 w-10 items-center justify-center rounded-lg border-0 bg-black p-0 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!canSubmit || isSubmitting}
                            type="submit"
                          >
                            {isSubmitting ? (
                              <ArrowClockwiseIcon
                                className="animate-spin"
                                size={20}
                              />
                            ) : (
                              <ArrowUpIcon size={20} />
                            )}
                          </Button>
                        )}
                      </form.Subscribe>
                    </div>
                  </>
                )}
              </form.Field>
            </div>
          </form>
        </div>
      </div>

      {/* Middle-right cell */}
      <div className="relative z-20" />

      {/* Bottom-left cell */}
      <div className="relative z-20" />

      {/* Bottom-center cell */}
      <div className="relative z-20">
        <div className="mt-4 flex h-full items-baseline justify-center text-center">
          <p className="text-sm text-white/40">
            Press{' '}
            <kbd className="rounded bg-white/10 px-2 py-1 text-xs">cmd+K</kbd>{' '}
            or{' '}
            <kbd className="rounded bg-white/10 px-2 py-1 text-xs">ctrl+K</kbd>{' '}
            to search chats
          </p>
        </div>
      </div>

      {/* Bottom-right cell */}
      <div className="relative z-20" />

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-white border-b-2" />
            <p className="text-lg text-white">
              {loadingStep || 'Processing...'}
            </p>
            <p className="mt-2 text-sm text-white/60">
              This may take a few moments
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed right-4 bottom-4 z-40 rounded-lg border border-red-500/30 bg-red-600/20 p-4 text-red-400 backdrop-blur-md">
          <p>{error}</p>
          <button
            className="mt-2 text-sm underline hover:no-underline"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Chat Command Palette */}
      <ChatCommandPalette
        isOpen={showChatPalette}
        onClose={() => setShowChatPalette(false)}
      />
    </main>
  );
};

export default AiHome;
