/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
  "/auth/new-verification",
  '/api/emails/webhook',
  '/api/paddle/webhook',
  '/api/health'
  // 'api/organization/invite'
];


/**
 * An array of routes that are accessible to the admin
 * These routes are role guard which are only accessible to admin or owner of the organization
 * @type {string[]}
 */
export const adminRoutes = [
  "/organization/setting",
  '/organization/billing',
  '/organization/domain'
  // '/api/paddle/webhook',
  // 'api/organization/invite'
];


/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password"
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/";