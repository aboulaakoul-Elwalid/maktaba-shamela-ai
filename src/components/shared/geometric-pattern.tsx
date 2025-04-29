export default function GeometricPattern() {
  return (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <pattern id="islamic-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M30,0 L60,15 L60,45 L30,60 L0,45 L0,15 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <path d="M0,15 L30,30 L60,15" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <path d="M0,45 L30,30 L60,45" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <path d="M30,0 L30,30" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <path d="M30,30 L30,60" fill="none" stroke="currentColor" strokeWidth="0.5" />

        {/* Additional decorative elements */}
        <circle cx="30" cy="30" r="2" fill="none" stroke="currentColor" strokeWidth="0.3" />
        <circle cx="30" cy="0" r="1" fill="none" stroke="currentColor" strokeWidth="0.3" />
        <circle cx="30" cy="60" r="1" fill="none" stroke="currentColor" strokeWidth="0.3" />
        <circle cx="0" cy="15" r="1" fill="none" stroke="currentColor" strokeWidth="0.3" />
        <circle cx="0" cy="45" r="1" fill="none" stroke="currentColor" strokeWidth="0.3" />
        <circle cx="60" cy="15" r="1" fill="none" stroke="currentColor" strokeWidth="0.3" />
        <circle cx="60" cy="45" r="1" fill="none" stroke="currentColor" strokeWidth="0.3" />
      </pattern>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#islamic-pattern)" />
    </svg>
  )
}

