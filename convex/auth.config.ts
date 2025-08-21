export default {
  providers: [
    {
      domain: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      applicationID: 'convex',
    },
  ],
}
