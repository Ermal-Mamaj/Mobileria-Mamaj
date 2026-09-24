import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { EditableText, EditableImage } from '../WysiwygFields.jsx';
import '../../pages/HomePage.css';

export default function HomeSection() {
  const [form, setForm] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    api.get('/content/home').then(setForm);
  }, []);

  async function save(field, value) {
    const next = { ...form, [field]: value };
    setForm(next);
    const saved = await api.put('/content/home', next);
    setForm(saved);
    setSavedAt(Date.now());
  }

  if (!form) return <p>Po ngarkohet...</p>;

  return (
    <div className="admin-panel">
      <div className="admin-panel__header-row">
        <h2 className="admin-panel__heading">Ballina</h2>
        {savedAt && <span className="admin-panel__saved">U ruajt ✓</span>}
      </div>
      <p className="admin-panel__description">
        Kjo është pikërisht siç do të duket faqja. Klikoni mbi çdo tekst ose foto për ta ndryshuar —
        ruhet automatikisht sapo largoheni nga fusha.
      </p>

      <div className="wysiwyg-frame">
        {/* Hero */}
        <div className="home-page__hero wysiwyg-hero">
          <div className="home-page__hero-media">
            <EditableImage
              value={form.hero_image_url}
              onSave={(url) => save('hero_image_url', url)}
              className="home-page__hero-image"
              dark
            />
          </div>
          <div className="home-page__hero-gradient" />
          <div className="home-page__hero-copy">
            <div className="eyebrow eyebrow--gold">
              <span className="eyebrow__rule" />
              <EditableText
                value={form.hero_eyebrow}
                onSave={(v) => save('hero_eyebrow', v)}
                placeholder="MOBILIE TË PUNUARA ME DORË"
                className="wysiwyg-field--eyebrow"
              />
            </div>
            <div className="home-page__hero-headline wysiwyg-headline-wrap">
              <EditableText
                as="textarea"
                rows={2}
                value={form.hero_headline}
                onSave={(v) => save('hero_headline', v)}
                placeholder="Titulli kryesor..."
                className="wysiwyg-field--headline"
              />
            </div>
            <div className="btn-gold wysiwyg-btn-wrap">
              <EditableText
                value={form.hero_cta}
                onSave={(v) => save('hero_cta', v)}
                placeholder="Eksploro Koleksionet"
                className="wysiwyg-field--btn"
              />
            </div>
          </div>
        </div>

        {/* Quote / brand band */}
        <div className="brand-band">
          <div className="brand-band__quote-mark">&ldquo;</div>
          <div className="brand-band__content">
            <EditableText
              as="textarea"
              rows={2}
              value={form.quote_text}
              onSave={(v) => save('quote_text', v)}
              placeholder="Teksti i citatit..."
              className="wysiwyg-field--quote brand-band__text"
            />
            <div className="eyebrow eyebrow--gold">
              <span className="eyebrow__rule" />
              <EditableText
                value={form.quote_label}
                onSave={(v) => save('quote_label', v)}
                placeholder="PUNISHTJA MAMAJ"
                className="wysiwyg-field--eyebrow"
              />
            </div>
          </div>
        </div>

        {/* Contact section heading */}
        <div className="home-page__section wysiwyg-section-bg">
          <div className="eyebrow eyebrow--muted">
            <span className="eyebrow__rule" />
            <span>NA KONTAKTONI</span>
          </div>
          <EditableText
            value={form.contact_heading}
            onSave={(v) => save('contact_heading', v)}
            placeholder="Le të krijojmë diçka të veçantë."
            className="wysiwyg-field--section-heading section-heading"
          />
          <EditableText
            as="textarea"
            rows={2}
            value={form.contact_intro}
            onSave={(v) => save('contact_intro', v)}
            placeholder="Na shkruani dhe..."
            className="wysiwyg-field--intro section-intro"
          />
          <p className="wysiwyg-note">↓ Formulari i kontaktit shfaqet këtu në faqen reale (emri, telefoni, mesazhi, butoni Dërgo)</p>
        </div>
      </div>
    </div>
  );
}
