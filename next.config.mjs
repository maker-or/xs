await import('./src/env.js');

// import { withSentryConfig } from "@sentry/nextjs";

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    reactCompiler: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        pathname: '/**', // This allows all paths under utfs.io
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        port: '',
        pathname: '/**', // This allows all paths under img.freepik.com
      },
      {
        protocol: 'https',
        hostname: 'veterinaire-tour-hassan.com',
        port: '',
        pathname: '/**', // This allows all paths under veterinaire-tour-hassan.com
      },
      {
        protocol: 'https',
        hostname: 'sf2jdmaodp.ufs.sh',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.synopsys.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'developer-blogs.nvidia.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.tandfonline.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'foothill.edu',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn1.slideserve.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/posthog/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/posthog/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
      {
        source: '/posthog/decide',
        destination: 'https://us.i.posthog.com/decide',
      },
    ];
  },
};

// Injected content via Sentry wizard below
// const sentryConfig = withSentryConfig(config, {
//   // For all available options, see:
//   // https://www.npmjs.com/package/@sentry/webpack-plugin#options

//   org: "sphere-ye",
//   project: "sphereaiin",

//   // Only print logs for uploading source maps in CI
//   silent: !process.env.CI,

//   // For all available options, see:
//   // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

//   // Upload a larger set of source maps for prettier stack traces (increases build time)
//   widenClientFileUpload: true,

//   // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
//   // This can increase your server load as well as your hosting bill.
//   // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
//   // side errors will fail.
//   tunnelRoute: "/monitoring",

//   // Automatically tree-shake Sentry logger statements to reduce bundle size
//   disableLogger: true,

//   // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
//   // See the following for more information:
//   // https://docs.sentry.io/product/crons/
//   // https://vercel.com/docs/cron-jobs
//   automaticVercelMonitors: true,
// });

export default config;
