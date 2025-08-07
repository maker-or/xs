'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Header */}
      <div className="border-gray-800 border-b bg-[#050A06]">
        <div className="container mx-auto px-4 py-6">
          <Link
            className="inline-flex items-center gap-2 text-gray-300 transition-colors hover:text-white"
            href="/"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-8">
          {/* Title */}
          <div className="space-y-4 text-center">
            <h1 className="font-bold text-4xl text-white">Privacy Policy</h1>
            <p className="text-gray-400">Last updated: July 17, 2025</p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="mb-4 font-semibold text-2xl text-white">
                1. Information We Collect
              </h2>
              <div className="space-y-4">
                <p>
                  We collect information you provide directly to us, such as
                  when you create an account, use our services, or contact us
                  for support.
                </p>
                <h3 className="font-medium text-white text-xl">
                  Personal Information
                </h3>
                <ul className="ml-4 list-inside list-disc space-y-2">
                  <li>Name and email address</li>
                  <li>Account credentials</li>
                  <li>Profile information</li>
                  <li>Communication preferences</li>
                </ul>
                <h3 className="font-medium text-white text-xl">
                  Usage Information
                </h3>
                <ul className="ml-4 list-inside list-disc space-y-2">
                  <li>How you interact with our services</li>
                  <li>Features you use and actions you take</li>
                  <li>Time, frequency, and duration of your activities</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-semibold text-2xl text-white">
                2. How We Use Your Information
              </h2>
              <div className="space-y-4">
                <p>We use the information we collect to:</p>
                <ul className="ml-4 list-inside list-disc space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Personalize your experience</li>
                  <li>Monitor and analyze usage patterns</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-semibold text-2xl text-white">
                3. Information Sharing
              </h2>
              <div className="space-y-4">
                <p>
                  We do not sell, trade, or otherwise transfer your personal
                  information to third parties except as described in this
                  policy.
                </p>
                <h3 className="font-medium text-white text-xl">
                  We may share information:
                </h3>
                <ul className="ml-4 list-inside list-disc space-y-2">
                  <li>With service providers who assist in our operations</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and safety</li>
                  <li>In connection with a business transaction</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-semibold text-2xl text-white">
                4. Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-semibold text-2xl text-white">
                5. Data Retention
              </h2>
              <p>
                We retain your personal information for as long as necessary to
                fulfill the purposes outlined in this policy, unless a longer
                retention period is required by law.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-semibold text-2xl text-white">
                6. Your Rights
              </h2>
              <div className="space-y-4">
                <p>You have the right to:</p>
                <ul className="ml-4 list-inside list-disc space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Object to processing of your information</li>
                  <li>Data portability</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-semibold text-2xl text-white">
                7. Cookies and Tracking
              </h2>
              <p>
                We use cookies and similar tracking technologies to collect
                information about your browsing activities and to provide
                personalized services.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-semibold text-2xl text-white">
                8. Third-Party Services
              </h2>
              <p>
                Our service may contain links to third-party websites or
                services. We are not responsible for the privacy practices of
                these third parties.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-semibold text-2xl text-white">
                9. Changes to This Policy
              </h2>
              <p>
                We may update this privacy policy from time to time. We will
                notify you of any material changes by posting the new policy on
                this page.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-semibold text-2xl text-white">
                10. Contact Us
              </h2>
              <p>
                If you have any questions about this privacy policy, please
                contact us at:
              </p>
              <div className="mt-4 rounded-lg bg-gray-900 p-4">
                <p>Email: privacy@sphere.com</p>
                <p>Address: [Your Company Address]</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
