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

  console.log(`Migration complete: ${SCHEMA_STATEMENTS.length} tables ensured, gallery_images dropped.`);
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
