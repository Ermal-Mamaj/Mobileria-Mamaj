import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const NEW_USERNAME = 'Mamaj';
const NEW_PASSWORD = 'Mamaj123';

console.log('Starting...');
console.log('DATABASE_URL is set:', !!process.env.DATABASE_URL);

try {
  const sql = neon(process.env.DATABASE_URL);
  const hash = bcrypt.hashSync(NEW_PASSWORD, 10);
  const result = await sql`UPDATE admin_users SET username = ${NEW_USERNAME}, password_hash = ${hash} RETURNING id, username`;
  console.log('Rows updated:', result.length);
  console.log('Result:', result);
  console.log('Done.');
} catch (err) {
  console.error('FAILED:', err.message);
  process.exit(1);
}