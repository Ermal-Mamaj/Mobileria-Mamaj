// Run once (locally, or as a one-off) to create/update tables:
//   npm run migrate -w server
// Deliberately NOT run automatically on server startup — DDL on every cold
// start is unnecessary and risky against a shared Neon database.
import { sql } from './index.js';
import { SCHEMA_STATEMENTS } from './schema.js';

async function migrate() {
  for (const statement of SCHEMA_STATEMENTS) {
    await sql.query(statement);
  }

  // gallery_images backed the old standalone inspiration gallery, which has
  // been replaced by per-product photos (product_images). Drop it on
  // already-migrated databases — safe to run repeatedly since IF EXISTS
  // makes it a no-op once it's gone.
  await sql.query('DROP TABLE IF EXISTS gallery_images');

  // site_settings already existed on prior deployments before address_2 was
  // added to the schema above — CREATE TABLE IF NOT EXISTS only skips
  // creating the table when it's already there, it doesn't add missing
  // columns to it. ADD COLUMN IF NOT EXISTS handles that, and is a no-op on
  // fresh databases where the column already came from the CREATE TABLE.
  await sql.query(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS address_2 TEXT DEFAULT ''`);

  console.log(`Migration complete: ${SCHEMA_STATEMENTS.length} tables ensured, gallery_images dropped, address_2 column ensured.`);
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
