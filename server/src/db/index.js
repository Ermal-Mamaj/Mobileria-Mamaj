import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy server/.env.example to server/.env and fill in your Neon connection string.');
}

// neon() gives back a tagged-template query function that runs each call as
// a single stateless HTTP request — no connection pool to exhaust, which is
// what makes it safe to use from short-lived serverless invocations. For a
// small admin CMS like this, that's a much better fit than pg's Pool, which
// wants a long-lived TCP connection per instance.
export const sql = neon(process.env.DATABASE_URL);

export default sql;
