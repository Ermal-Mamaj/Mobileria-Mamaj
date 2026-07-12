import { useApiGet } from '../lib/hooks.js';
import './Footer.css';

export default function Footer() {
  const { data: settings } = useApiGet('/site-settings', {});

  return (
    <div className="footer">
      <div className="footer__brand">
        <img
          src={settings?.logo_url || '/logo-full.png'}
          alt="MAMAJ — Fabrika e Mobileve"
          className="footer__logo"
        />
      </div>
      <div className="footer__rows">
        {settings?.phone && (
          <div className="footer__row">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EBC84C" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>{settings.phone}</span>
          </div>
        )}
        {settings?.facebook && (
          <div className="footer__row">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#EBC84C">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
            <span>{settings.facebook}</span>
          </div>
        )}
      </div>
      <p className="footer__copyright">© {new Date().getFullYear()} MAMAJ · Mobilie të Punuara me Dorë</p>
    </div>
  );
}
