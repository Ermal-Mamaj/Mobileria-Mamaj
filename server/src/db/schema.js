export const SCHEMA = `
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  business_hours TEXT DEFAULT '',
  logo_url TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT DEFAULT '',
  hero_image_url TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  material TEXT DEFAULT '',
  image_url TEXT,
  badge TEXT,
  featured_home INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT,
  caption TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS home_content (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  hero_eyebrow TEXT DEFAULT '',
  hero_headline TEXT DEFAULT '',
  hero_cta TEXT DEFAULT '',
  hero_image_url TEXT,
  quote_text TEXT DEFAULT '',
  quote_label TEXT DEFAULT '',
  contact_heading TEXT DEFAULT '',
  contact_intro TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS about_content (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  hero_image_url TEXT,
  paragraph_1 TEXT DEFAULT '',
  paragraph_2 TEXT DEFAULT '',
  values_json TEXT DEFAULT '[]',
  quote_text TEXT DEFAULT '',
  quote_author TEXT DEFAULT ''
);
`;
