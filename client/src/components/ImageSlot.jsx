import './ImageSlot.css';

export default function ImageSlot({ src, placeholder = 'Photo', className = '', dark = false }) {
  if (src) {
    return <img src={src} alt={placeholder} className={`image-slot image-slot--filled ${className}`} />;
  }
  return (
    <div className={`image-slot image-slot--empty ${dark ? 'image-slot--dark' : ''} ${className}`}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      <span className="image-slot__caption">{placeholder}</span>
    </div>
  );
}
