import { useState } from 'react';
import NavHeader from '../components/NavHeader.jsx';
import Footer from '../components/Footer.jsx';
import { useApiGet } from '../lib/hooks.js';
import './ContactPage.css';

export default function ContactPage() {
  const { data: settings } = useApiGet('/site-settings', {});
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  const infoRows = [
    settings.phone && {
      label: 'Telefoni',
      value: settings.phone,
      icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
    },
    settings.email && {
      label: 'Email',
      value: settings.email,
      icon: (
        <>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </>
      ),
    },
    settings.address && {
      label: 'Salloni',
      value: settings.address,
      icon: (
        <>
          <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </>
      ),
    },
  ].filter(Boolean);

  return (
    <div className="app-shell">
      <NavHeader />
      <div className="page-body">
        <div className="eyebrow eyebrow--muted">
          <span className="eyebrow__rule" />
          <span>MAMAJ</span>
        </div>
        <h1 className="section-heading" style={{ marginBottom: 6 }}>Na Kontaktoni</h1>
        <p className="section-intro">Do të gëzoheshim t'ju dëgjonim.</p>

        <div className="contact-info-list">
          {infoRows.map((row) => (
            <div className="contact-info-card" key={row.label}>
              <div className="contact-info-card__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F2733" strokeWidth="2">
                  {row.icon}
                </svg>
              </div>
              <div>
                <h3 className="contact-info-card__label">{row.label}</h3>
                <p className="contact-info-card__value">{row.value}</p>
              </div>
            </div>
          ))}
        </div>

        {settings.business_hours && (
          <p className="contact-hours">Orari i Punës: {settings.business_hours}</p>
        )}

        <div className="contact-form-panel">
          <h3 className="contact-form-panel__heading">Dërgo një Mesazh</h3>
          <p className="contact-form-panel__intro">Keni pyetje? Do t'ju përgjigjemi së shpejti.</p>

          {sent ? (
            <p className="contact-form__success">Mesazhi u dërgua me sukses. Do t'ju kontaktojmë së shpejti.</p>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <input type="text" placeholder="Emri juaj" required />
              <input type="tel" placeholder="Numri i telefonit" required />
              <textarea placeholder="Mesazhi juaj" required />
              <button type="submit" className="btn-navy">Dërgo</button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
