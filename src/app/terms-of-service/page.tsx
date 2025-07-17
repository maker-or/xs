"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#050A06]">
        <div className="container mx-auto px-4 py-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Title */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
            <p className="text-gray-400">Last updated: July 17, 2025</p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Sphere, you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to abide by the above, please do 
                not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p>
                Sphere is an AI-powered knowledge management platform that provides educational 
                tools, content organization, and learning assistance. We reserve the right to 
                modify or discontinue the service at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-white">Account Creation</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>You must be at least 13 years old to create an account</li>
                  <li>One person may not maintain multiple accounts</li>
                </ul>
                <h3 className="text-xl font-medium text-white">Account Responsibilities</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Keep your password secure and confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>You are responsible for all activities under your account</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-white">You agree NOT to:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the service for any illegal or unauthorized purpose</li>
                  <li>Violate any laws in your jurisdiction</li>
                  <li>Transmit worms, viruses, or malicious code</li>
                  <li>Collect or harvest user information</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>Create accounts through unauthorized means</li>
                  <li>Impersonate any person or entity</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Content and Intellectual Property</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-white">Your Content</h3>
                <p>
                  You retain ownership of content you submit to our service. By submitting content, 
                  you grant us a license to use, modify, and distribute it as necessary to provide 
                  our services.
                </p>
                <h3 className="text-xl font-medium text-white">Our Content</h3>
                <p>
                  The service and its original content, features, and functionality are owned by 
                  Sphere and are protected by international copyright, trademark, and other 
                  intellectual property laws.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Privacy</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which also 
                governs your use of the service, to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Payments and Subscriptions</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-white">Billing</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Subscription fees are billed in advance</li>
                  <li>All fees are non-refundable unless required by law</li>
                  <li>We may change pricing with 30 days notice</li>
                </ul>
                <h3 className="text-xl font-medium text-white">Cancellation</h3>
                <p>
                  You may cancel your subscription at any time. Cancellation will take effect at 
                  the end of your current billing period.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Termination</h2>
              <div className="space-y-4">
                <p>
                  We may terminate or suspend your account and access to the service immediately, 
                  without prior notice, for conduct that we believe violates these Terms of Service.
                </p>
                <h3 className="text-xl font-medium text-white">Effects of Termination</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your right to use the service will cease immediately</li>
                  <li>We may delete your account and data</li>
                  <li>Provisions that should survive termination will remain in effect</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Disclaimers</h2>
              <div className="space-y-4">
                <p>
                  The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind.
                  We disclaim all warranties, express or implied, including warranties of 
                  merchantability and fitness for a particular purpose.
                </p>
                <h3 className="text-xl font-medium text-white">AI-Generated Content</h3>
                <p>
                  Our service uses AI technology. AI-generated content may not always be accurate 
                  or appropriate. Users should verify information independently.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Limitation of Liability</h2>
              <p>
                In no event shall Sphere be liable for any indirect, incidental, special, 
                consequential, or punitive damages, including loss of profits, data, or use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of 
                [Your Jurisdiction], without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of 
                material changes via email or through the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <p>Email: legal@sphere.com</p>
                <p>Address: [Your Company Address]</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 