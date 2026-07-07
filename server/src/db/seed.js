import bcrypt from 'bcryptjs';
import db from './index.js';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-password';

const categories = [
  { slug: 'living-room', name: 'Living Room', tagline: 'Sofas & seating for gathering and relaxing' },
  { slug: 'bedroom', name: 'Bedroom', tagline: 'Beds & storage for restful spaces' },
  { slug: 'kitchen', name: 'Kitchen', tagline: 'Dining & storage built for daily use' },
  { slug: 'dining-room', name: 'Dining Room', tagline: 'Tables & chairs for gathering together' },
  { slug: 'home-office', name: 'Home Office', tagline: 'Desks & shelving for focused work' },
  { slug: 'outdoor', name: 'Outdoor', tagline: 'Patio & garden pieces built to last' },
];

const productsByCategory = {
  'living-room': [
    { name: 'Modern Sofa', material: 'Solid oak frame, linen upholstery' },
    { name: 'Accent Armchair', material: 'Walnut legs, boucle fabric' },
    { name: 'Coffee Table', material: 'Marble top, brass base' },
    { name: 'TV Console', material: 'Ash veneer, brushed handles' },
    { name: 'Bookshelf', material: 'Solid pine, matte lacquer' },
    { name: 'Reading Chair', material: 'Beech frame, wool blend' },
  ],
  bedroom: [
    { name: 'Oak Bed Frame', material: 'Solid oak, hand-rubbed finish' },
    { name: 'Nightstand', material: 'Walnut veneer, soft-close drawer' },
    { name: 'Dresser', material: 'Ash wood, brass pulls' },
    { name: 'Wardrobe', material: 'Solid pine, sliding doors' },
    { name: 'Vanity Table', material: 'Oak legs, mirrored top' },
    { name: 'Bedroom Bench', material: 'Beech frame, linen cushion' },
  ],
  kitchen: [
    { name: 'Kitchen Island', material: 'Solid oak, granite top' },
    { name: 'Bar Stool', material: 'Walnut seat, iron legs' },
    { name: 'Pantry Cabinet', material: 'Ash wood, glass panels' },
    { name: 'Utility Table', material: 'Pine top, steel frame' },
    { name: 'Wine Rack', material: 'Solid oak, open shelving' },
    { name: 'Dining Cart', material: 'Bamboo, brass casters' },
  ],
  'dining-room': [
    { name: 'Dining Table', material: 'Solid oak, made to order' },
    { name: 'Dining Chair', material: 'Walnut frame, linen seat' },
    { name: 'Buffet Cabinet', material: 'Ash veneer, brass hardware' },
    { name: 'China Cabinet', material: 'Solid pine, glass doors' },
    { name: 'Bar Cart', material: 'Brass frame, oak shelves' },
    { name: 'Server Table', material: 'Walnut top, tapered legs' },
  ],
  'home-office': [
    { name: 'Writing Desk', material: 'Solid oak, cable-managed' },
    { name: 'Office Chair', material: 'Walnut base, wool upholstery' },
    { name: 'Bookcase', material: 'Ash wood, open shelving' },
    { name: 'Filing Cabinet', material: 'Steel frame, oak front' },
    { name: 'Desk Lamp Table', material: 'Pine top, iron legs' },
    { name: 'Conference Table', material: 'Solid walnut, made to order' },
  ],
  outdoor: [
    { name: 'Patio Sofa', material: 'Teak frame, weather-resistant fabric' },
    { name: 'Outdoor Dining Set', material: 'Teak table, rope chairs' },
    { name: 'Lounge Chair', material: 'Eucalyptus wood, sling seat' },
    { name: 'Umbrella Stand', material: 'Cast iron, powder-coated' },
    { name: 'Fire Pit Table', material: 'Concrete top, teak base' },
    { name: 'Planter Bench', material: 'Teak wood, built-in planter' },
  ],
};

// Mirrors the "New Designs" carousel on Home Page.dc.html
const featuredHome = [
  { category: 'living-room', name: 'Modern Sofa', badge: 'NEW' },
  { category: 'bedroom', name: 'Oak Bed Frame', badge: 'NEW' },
  { category: 'dining-room', name: 'Dining Table', badge: 'CUSTOM' },
  { category: 'living-room', name: 'Coffee Table', badge: 'NEW' },
];

function run() {
  const userCount = db.prepare('SELECT COUNT(*) AS n FROM admin_users').get().n;
  if (userCount === 0) {
    const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
    db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(ADMIN_USERNAME, hash);
    console.log(`Seeded admin user "${ADMIN_USERNAME}"`);
  }

  const settingsCount = db.prepare('SELECT COUNT(*) AS n FROM site_settings').get().n;
  if (settingsCount === 0) {
    db.prepare(`INSERT INTO site_settings (id, phone, whatsapp, email, address, facebook, instagram, business_hours)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?)`).run(
      '+383 44/49 218 690',
      '+383 44/49 218 690',
      'hello@mamaj.com',
      "Rr. Nena Terezë, Prishtinë",
      'MobileriaMamaj',
      '',
      'Mon–Sat: 9:00–18:00'
    );
    console.log('Seeded site settings');
  }

  const homeCount = db.prepare('SELECT COUNT(*) AS n FROM home_content').get().n;
  if (homeCount === 0) {
    db.prepare(`INSERT INTO home_content (id, hero_eyebrow, hero_headline, hero_cta, quote_text, quote_label, contact_heading, contact_intro)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?)`).run(
      'HANDCRAFTED FURNITURE',
      'Furniture made\nto live with',
      'Explore Collections',
      'Every piece is handcrafted in our workshop — built to last for generations.',
      'THE MAMAJ WORKSHOP',
      'Have a project in mind?',
      "Send us a message — we'll help you design a piece that fits your home."
    );
    console.log('Seeded home content');
  }

  const aboutCount = db.prepare('SELECT COUNT(*) AS n FROM about_content').get().n;
  if (aboutCount === 0) {
    const values = [
      { title: 'Craftsmanship', description: 'Every joint and finish is done by hand, checked twice.' },
      { title: 'Sustainable Materials', description: 'Responsibly sourced wood and natural fabrics.' },
      { title: 'Made to Order', description: 'Custom sizes and finishes for every home.' },
    ];
    db.prepare(`INSERT INTO about_content (id, paragraph_1, paragraph_2, values_json, quote_text, quote_author)
      VALUES (1, ?, ?, ?, ?, ?)`).run(
      'MAMAJ began as a small family workshop, handcrafting furniture that brings warmth and character to modern living. Every piece we make blends traditional joinery with contemporary design, built to last for generations.',
      'Today we work with local artisans and trusted material sources to create furniture for every room — from statement sofas to made-to-order dining sets.',
      JSON.stringify(values),
      'Furniture should feel like it was always meant to be in your home.',
      'The MAMAJ Team'
    );
    console.log('Seeded about content');
  }

  const catCount = db.prepare('SELECT COUNT(*) AS n FROM categories').get().n;
  if (catCount === 0) {
    const insertCat = db.prepare('INSERT INTO categories (slug, name, tagline, sort_order) VALUES (?, ?, ?, ?)');
    const insertProduct = db.prepare(`INSERT INTO products (category_id, name, material, badge, featured_home, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)`);

    categories.forEach((cat, ci) => {
      const info = insertCat.run(cat.slug, cat.name, cat.tagline, ci);
      const categoryId = info.lastInsertRowid;
      const products = productsByCategory[cat.slug] || [];
      products.forEach((p, pi) => {
        const feature = featuredHome.find((f) => f.category === cat.slug && f.name === p.name);
        insertProduct.run(categoryId, p.name, p.material, feature ? feature.badge : null, feature ? 1 : 0, pi);
      });
    });
    console.log('Seeded categories & products');
  }

  const galleryCount = db.prepare('SELECT COUNT(*) AS n FROM gallery_images').get().n;
  if (galleryCount === 0) {
    const insertGallery = db.prepare('INSERT INTO gallery_images (caption, sort_order) VALUES (?, ?)');
    for (let i = 1; i <= 6; i++) {
      insertGallery.run(`Photo ${i}`, i - 1);
    }
    console.log('Seeded gallery placeholders');
  }
}

run();
console.log('Seed complete.');
