/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
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
      ],
  
      },
      
      async rewrites() {
        return [
          {
            source: "/ingest/static/:path*",
            destination: "https://us-assets.i.posthog.com/static/:path*",
          },
          {
            source: "/ingest/:path*",
            destination: "https://us.i.posthog.com/:path*",
          },
          {
            source: "/ingest/decide",
            destination: "https://us.i.posthog.com/decide",
          },
        ];
      },
};

export default config;