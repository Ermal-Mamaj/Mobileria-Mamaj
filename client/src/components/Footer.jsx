import { useApiGet } from '../lib/hooks.js';
import './Footer.css';

export default function Footer() {
  const { data: settings } = useApiGet('/site-settings', {});

  return (
    <div className="footer">
      <div className="footer__brand">
        <svg width="34" height="31" viewBox="0 0 40 36" fill="none" stroke="#EBC84C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="12.5" y="3.5" width="15" height="15" rx="2.5" />
          <path d="M16.5 14.5 v-6 l3.5 3.5 3.5-3.5 v6" />
          <path d="M12.5 9 h-4 a3 3 0 0 0-3 3 v8" />
          <path d="M27.5 9 h4 a3 3 0 0 1 3 3 v8" />
          <rect x="5.5" y="18.5" width="29" height="6" rx="2" />
          <path d="M8.5 24.5 v6 M31.5 24.5 v6 M13.5 24.5 v3.5 M26.5 24.5 v3.5" />
        </svg>
        <div className="footer__wordmark">
          <span className="footer__eyebrow">FABRIKA E MOBILEVE</span>
          <span className="footer__name">MAMAJ</span>
        </div>
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
      <p className="footer__copyright">© {new Date().getFullYear()} MAMAJ · Handcrafted furniture</p>
    </div>
  );
}
