// Individual CREATE TABLE statements. Kept as an array (rather than one
// multi-statement string) because Neon's HTTP-based serverless driver runs
// one statement per call — see db/migrate.js, which loops over these.
export const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    phone TEXT DEFAULT '',
    whatsapp TEXT DEFAULT '',
    email TEXT DEFAULT '',
    address TEXT DEFAULT '',
    facebook TEXT DEFAULT '',
    instagram TEXT DEFAULT '',
    business_hours TEXT DEFAULT '',
    logo_url TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT DEFAULT '',
    hero_image_url TEXT,
    sort_order INTEGER DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    material TEXT DEFAULT '',
    image_url TEXT,
    badge TEXT,
    featured_home INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS home_content (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    hero_eyebrow TEXT DEFAULT '',
    hero_headline TEXT DEFAULT '',
    hero_cta TEXT DEFAULT '',
    hero_image_url TEXT,
    quote_text TEXT DEFAULT '',
    quote_label TEXT DEFAULT '',
    contact_heading TEXT DEFAULT '',
    contact_intro TEXT DEFAULT ''
  )`,

  `CREATE TABLE IF NOT EXISTS about_content (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    hero_image_url TEXT,
    paragraph_1 TEXT DEFAULT '',
    paragraph_2 TEXT DEFAULT '',
    values_json JSONB DEFAULT '[]',
    quote_text TEXT DEFAULT '',
    quote_author TEXT DEFAULT ''
  )`,

  // Extra photos for a product, beyond the cover shot in products.image_url.
  // Kept as a separate table rather than more columns so a product can carry
  // any number of angles; the cover stays where it is so existing cards,
  // carousels and the CMS keep working untouched.
  `CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
  )`,

  `CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON product_images (product_id)`,

  // Every contact submission lands here first. Email delivery is a
  // best-effort extra on top: if Resend is unconfigured or down, the
  // enquiry is still captured and readable in the CMS rather than lost.
  `CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    emailed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
];
