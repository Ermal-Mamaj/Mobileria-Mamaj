import bcrypt from 'bcryptjs';
import { sql } from './index.js';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-password';

const categories = [
  { slug: 'living-room', name: 'Dhoma e Ndenjes', tagline: 'Divane, kolltukë dhe tavolina kafeje të krijuara për momente të bukura së bashku.' },
  { slug: 'bedroom', name: 'Dhoma e Gjumit', tagline: 'Krevate, garderoba dhe komodina të ndërtuara për të zgjatur me breza.' },
  { slug: 'kitchen', name: 'Kuzhina', tagline: 'Mobilie kuzhine të projektuara për funksionalitet, komoditet dhe përdorim të përditshëm.' },
  { slug: 'dining-room', name: 'Dhoma e Ngrënies', tagline: 'Tavolina dhe karrige të krijuara për të bashkuar familjen rreth çdo vakti.' },
  { slug: 'home-office', name: 'Zyra', tagline: 'Tavolina pune dhe rafte për punë të përqendruar.' },
  { slug: 'outdoor', name: 'Ambienti i Jashtëm', tagline: 'Mobilie oborri dhe kopshti të ndërtuara për të zgjatur.' },
];

const productsByCategory = {
  'living-room': [
    { name: 'Divan Modern', material: 'Skelet prej Lisi · Lino' },
    { name: 'Kolltuk', material: 'Arrë · Bouclé' },
    { name: 'Tavolinë Kafeje', material: 'Mermer · Tunxh' },
    { name: 'Komodë TV', material: 'Lis Masiv' },
    { name: 'Raft Librash', material: 'Pishë Masive · Llak Mat' },
    { name: 'Kolltuk Leximi', material: 'Skelet prej Ahu · Lesh' },
  ],
  bedroom: [
    { name: 'Krevat prej Lisi', material: 'Lis Masiv · Punuar me Dorë' },
    { name: 'Komodinë', material: 'Rimeso Arre' },
    { name: 'Komodë', material: 'Lis · Doreza prej Tunxhi' },
    { name: 'Garderobë', material: 'Me Porosi' },
    { name: 'Tavolinë Tualeti', material: 'Këmbë prej Lisi · Pasqyrë' },
    { name: 'Stol Dhome Gjumi', material: 'Ah · Jastëk Lino' },
  ],
  kitchen: [
    { name: 'Ishull Kuzhine', material: 'Lis · Sipërfaqe Mermeri' },
    { name: 'Stol Bari', material: 'Set prej Dy Copash · Lis' },
    { name: 'Dollap Kuzhine', material: 'Lis Masiv' },
    { name: 'Tavolinë Pune', material: 'Pishë · Skelet Çeliku' },
    { name: 'Raft Vere', material: 'Lis Masiv · Rafte të Hapura' },
    { name: 'Karrocë Shërbimi', material: 'Bambu · Rrota Tunxhi' },
  ],
  'dining-room': [
    { name: 'Tavolinë Ngrënieje', material: 'Me Porosi' },
    { name: 'Karrige Ngrënieje', material: 'Set prej Katër Copash · Lis' },
    { name: 'Bufe', material: 'Arrë · Tunxh' },
    { name: 'Vitrinë', material: 'Pishë Masive · Dyer Xhami' },
    { name: 'Karrocë Bari', material: 'Skelet Tunxhi · Rafte Lisi' },
    { name: 'Tavolinë Shërbimi', material: 'Arrë · Këmbë të Holluara' },
  ],
  'home-office': [
    { name: 'Tavolinë Shkrimi', material: 'Lis Masiv · Menaxhim Kabllosh' },
    { name: 'Karrige Zyre', material: 'Bazë Arre · Lesh' },
    { name: 'Bibliotekë', material: 'Frashër · Rafte të Hapura' },
    { name: 'Dollap Dokumentesh', material: 'Skelet Çeliku · Fasadë Lisi' },
    { name: 'Tavolinë Anësore', material: 'Pishë · Këmbë Hekuri' },
    { name: 'Tavolinë Konferencash', material: 'Arrë Masive · Me Porosi' },
  ],
  outdoor: [
    { name: 'Divan Oborri', material: 'Tik · Pëlhurë Rezistente' },
    { name: 'Set Ngrënieje për Jashtë', material: 'Tavolinë Tiku · Karrige me Litar' },
    { name: 'Shezlon', material: 'Dru Eukalipti' },
    { name: 'Mbajtëse Çadre', material: 'Gizë e Lyer' },
    { name: 'Tavolinë me Vatër Zjarri', material: 'Sipërfaqe Betoni · Bazë Tiku' },
    { name: 'Stol me Vazo', material: 'Dru Tiku · Vazo e Integruar' },
  ],
};

// Mirrors the "New Designs" carousel on Home Page.dc.html
const featuredHome = [
  { category: 'living-room', name: 'Divan Modern', badge: 'E RE' },
  { category: 'bedroom', name: 'Krevat prej Lisi', badge: 'E RE' },
  { category: 'dining-room', name: 'Tavolinë Ngrënieje', badge: 'ME POROSI' },
  { category: 'living-room', name: 'Tavolinë Kafeje', badge: 'E RE' },
];

async function run() {
  const [{ n: userCount }] = await sql`SELECT COUNT(*)::int AS n FROM admin_users`;
  if (userCount === 0) {
    const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
    await sql`INSERT INTO admin_users (username, password_hash) VALUES (${ADMIN_USERNAME}, ${hash})`;
    console.log(`Seeded admin user "${ADMIN_USERNAME}"`);
  }

  const [{ n: settingsCount }] = await sql`SELECT COUNT(*)::int AS n FROM site_settings`;
  if (settingsCount === 0) {
    await sql`
      INSERT INTO site_settings (id, phone, whatsapp, email, address, facebook, instagram, business_hours)
      VALUES (1, ${'+383 44/49 218 690'}, ${'+383 44/49 218 690'}, ${'hello@mamaj.com'}, ${'Rr. Nena Terezë, Prishtinë'}, ${'MobileriaMamaj'}, ${''}, ${'Hën–Sht: 9:00–18:00'})
    `;
    console.log('Seeded site settings');
  }

  const [{ n: homeCount }] = await sql`SELECT COUNT(*)::int AS n FROM home_content`;
  if (homeCount === 0) {
    await sql`
      INSERT INTO home_content (id, hero_eyebrow, hero_headline, hero_cta, quote_text, quote_label, contact_heading, contact_intro)
      VALUES (1, ${'MOBILIE TË PUNUARA ME DORË'}, ${'Mjeshtëri në çdo detaj.\nElegancë në çdo ambient.'}, ${'Eksploro Koleksionet'}, ${'Çdo mobilie punohet me dorë në punishten tonë dhe krijohet për të zgjatur me breza.'}, ${'PUNISHTJA MAMAJ'}, ${'Le të krijojmë diçka të veçantë.'}, ${'Na shkruani dhe së bashku do të krijojmë mobilien ideale për shtëpinë tuaj.'})
    `;
    console.log('Seeded home content');
  }

  const [{ n: aboutCount }] = await sql`SELECT COUNT(*)::int AS n FROM about_content`;
  if (aboutCount === 0) {
    const values = [
      { title: 'Mjeshtëri', description: 'Çdo bashkim dhe përfundim bëhet me dorë dhe kontrollohet dy herë.' },
      { title: 'Materiale të Qëndrueshme', description: 'Dru i përzgjedhur me përgjegjësi dhe pëlhura natyrale.' },
      { title: 'Me Porosi', description: 'Përmasa dhe përfundime të personalizuara për çdo shtëpi.' },
    ];
    await sql`
      INSERT INTO about_content (id, paragraph_1, paragraph_2, values_json, quote_text, quote_author)
      VALUES (1, ${'MAMAJ nisi si një punishte e vogël familjare, duke punuar me dorë mobilie që sjellin ngrohtësi dhe karakter në jetesën moderne. Çdo mobilie që krijojmë ndërthur zdrukthëtarinë tradicionale me dizajnin bashkëkohor dhe ndërtohet për të zgjatur me breza.'}, ${'Sot punojmë me mjeshtër vendas dhe materiale të përzgjedhura për të krijuar mobilie për çdo ambient — nga divanet përfaqësuese deri te setet e ngrënies me porosi.'}, ${JSON.stringify(values)}, ${'Mobilia duhet të ndihet sikur ka qenë gjithmonë pjesë e shtëpisë suaj.'}, ${'Ekipi MAMAJ'})
    `;
    console.log('Seeded about content');
  }

  const [{ n: catCount }] = await sql`SELECT COUNT(*)::int AS n FROM categories`;
  if (catCount === 0) {
    for (const [ci, cat] of categories.entries()) {
      const [{ id: categoryId }] = await sql`
        INSERT INTO categories (slug, name, tagline, sort_order)
        VALUES (${cat.slug}, ${cat.name}, ${cat.tagline}, ${ci})
        RETURNING id
      `;
      const products = productsByCategory[cat.slug] || [];
      for (const [pi, p] of products.entries()) {
        const feature = featuredHome.find((f) => f.category === cat.slug && f.name === p.name);
        await sql`
          INSERT INTO products (category_id, name, material, badge, featured_home, sort_order)
          VALUES (${categoryId}, ${p.name}, ${p.material}, ${feature ? feature.badge : null}, ${feature ? 1 : 0}, ${pi})
        `;
      }
    }
    console.log('Seeded categories & products');
  }

  const [{ n: galleryCount }] = await sql`SELECT COUNT(*)::int AS n FROM gallery_images`;
  if (galleryCount === 0) {
    for (let i = 1; i <= 6; i++) {
      await sql`INSERT INTO gallery_images (caption, sort_order) VALUES (${`Foto ${i}`}, ${i - 1})`;
    }
    console.log('Seeded gallery placeholders');
  }
}

run()
  .then(() => console.log('Seed complete.'))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
