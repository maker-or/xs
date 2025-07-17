'use client'

import * as React from 'react'
import { useSignUp, useSignIn, SignUp } from '@clerk/nextjs'
import { useSearchParams, useRouter } from 'next/navigation'

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { signUp, setActive: setActiveSignUp } = useSignUp()
  const { signIn, setActive: setActiveSignIn } = useSignIn()

  const status = searchParams.get('__clerk_status')
  const token = searchParams.get('__clerk_ticket')
  const orgId = searchParams.get('organization_id') || searchParams.get('orgId') || searchParams.get("organization")

  // Debug logging to help troubleshoot
  React.useEffect(() => {
    console.log('AcceptInvitationPage loaded with:', {
      status,
      token: token ? 'present' : 'missing',
      orgId,
      allParams: Object.fromEntries(searchParams.entries())
    })
  }, [status, token, orgId, searchParams])

  // Handle sign-in with ticket
  React.useEffect(() => {
    if (!signIn || !setActiveSignIn || !token || status !== 'sign_in') {
      return
    }

    const createSignIn = async () => {
      try {
        const signInAttempt = await signIn.create({
          strategy: 'ticket',
          ticket: token as string,
        })

        if (signInAttempt.status === 'complete') {
          await setActiveSignIn({
            session: signInAttempt.createdSessionId,
          })
          
          // After successful sign-in, redirect to onboarding to ensure proper setup
          // Pass organization ID if available
          const redirectUrl =  '/onboarding'
          router.push(redirectUrl)
        } else {
          console.error('Sign-in incomplete:', JSON.stringify(signInAttempt, null, 2))
        }
      } catch (err: unknown) {
        // Check if the error is because user is already signed in
        if (err && typeof err === 'object' && 'errors' in err && 
            Array.isArray(err.errors) && err.errors[0]?.code === 'session_exists') {
          // User is already signed in, redirect to onboarding
          const redirectUrl = orgId ? `/onboarding?orgId=${orgId}` : '/onboarding'
          router.push(redirectUrl)
        } else {
          console.error('Sign-in error:', JSON.stringify(err, null, 2))
        }
      }
    }

    createSignIn()
  }, [signIn, setActiveSignIn, token, status, router, orgId])

  // Handle complete status
  React.useEffect(() => {
    if (status === 'complete') {
      // Redirect to onboarding instead of directly to student
      const redirectUrl =  '/onboarding'
      router.push(redirectUrl)
    }
  }, [status, router, orgId])

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050A06] text-white">
        <div className="max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="mb-4 font-serif text-2xl">Invalid Invitation</h1>
          <p className="mb-6 text-[#d0cfcf]">
            No invitation token found. Please check your invitation link or contact your administrator.
          </p>
        </div>
      </div>
    )
  }

  if (!status && token) {
    // If we have a token but no status, try to determine the status
    // This can happen if the URL parameters got partially lost during redirects
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050A06] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-solid border-blue-500"></div>
          <p>Processing invitation...</p>
          <p className="mt-2 text-sm text-[#d0cfcf]">
            Determining invitation type...
          </p>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050A06] text-white">
        <div className="max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="mb-4 font-serif text-2xl">Invalid Invitation</h1>
          <p className="mb-6 text-[#d0cfcf]">
            Invalid invitation link status. Please contact your administrator for a valid invitation.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'sign_in') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050A06] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-solid border-blue-500"></div>
          <p>Signing you in...</p>
          {orgId && (
            <p className="mt-2 text-sm text-[#d0cfcf]">
              Joining organization: {orgId}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (status === 'sign_up') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050A06] text-white">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="mb-2 font-serif text-2xl text-[#f7eee3]">
              Join Organization
            </h1>
            <p className="text-[#d0cfcf]">
              Complete your registration to join the organization
            </p>
            {orgId && (
              <div className="mt-4 rounded-lg border border-[#333] bg-[#1a1a1a] p-3">
                <p className="text-sm text-[#d0cfcf]">
                  Organization: {orgId}
                </p>
                <p className="text-xs text-[#FF5E00]">✓ Valid invitation</p>
              </div>
            )}
          </div>
          
          <SignUp
            appearance={{
              elements: {
                card: "bg-[#1a1a1a] text-white border border-[#333]",
                headerTitle: "text-[#f7eee3]",
                headerSubtitle: "text-[#d0cfcf]",
                socialButtonsBlockButton: "bg-[#333] text-white border-[#555] hover:bg-[#444]",
                formButtonPrimary: "bg-[#FF5E00] hover:bg-[#e54d00]",
                formFieldInput: "bg-[#333] text-white border-[#555]",
                footerActionLink: "text-[#FF5E00] hover:text-[#e54d00]",
              },
            }}
            // Redirect to onboarding after successful signup to ensure proper organization setup
            afterSignUpUrl={orgId ? `/onboarding?orgId=${orgId}` : '/onboarding'}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050A06] text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-solid border-blue-500"></div>
        <p>Processing invitation...</p>
        {orgId && (
          <p className="mt-2 text-sm text-[#d0cfcf]">
            Organization: {orgId}
          </p>
        )}
      </div>
    </div>
  )
}