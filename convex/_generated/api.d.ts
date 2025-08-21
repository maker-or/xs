/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as agent from "../agent.js";
import type * as ai from "../ai.js";
import type * as branches from "../branches.js";
import type * as chats from "../chats.js";
import type * as context from "../context.js";
import type * as course from "../course.js";
import type * as emails_components_BaseEmail from "../emails/components/BaseEmail.js";
import type * as emails_verifyOTP from "../emails/verifyOTP.js";
import type * as message from "../message.js";
import type * as resumable from "../resumable.js";
import type * as stage from "../stage.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  agent: typeof agent;
  ai: typeof ai;
  branches: typeof branches;
  chats: typeof chats;
  context: typeof context;
  course: typeof course;
  "emails/components/BaseEmail": typeof emails_components_BaseEmail;
  "emails/verifyOTP": typeof emails_verifyOTP;
  message: typeof message;
  resumable: typeof resumable;
  stage: typeof stage;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
