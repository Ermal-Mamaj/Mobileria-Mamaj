// Express 4 does not catch rejected promises thrown inside async route
// handlers — if a query fails and nothing explicitly catches it, the
// request never gets a response at all. It just hangs until the platform's
// hard timeout kills it (we saw this happen for a full 300 seconds on
// Vercel over a routine database error that should have failed instantly).
//
// Wrapping every async handler with this forwards any rejection to
// Express's error-handling middleware (see index.js), which responds
// immediately instead of leaving the connection open.
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
