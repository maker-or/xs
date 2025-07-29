// for clrek auth
export default {
  providers: [
    {
      domain: process.env.CLERK_FRONTEND_API_URL,
      applicationID: "convex",
    },
  ],
};

// for better-auth
// export default {
//   providers: [
//     {
//       domain: process.env.CONVEX_SITE_URL,
//       applicationID: "convex",
//     },
//   ],
// };
