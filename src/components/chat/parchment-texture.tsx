export default function ParchmentTexture() {
  return (
    <div
      className="w-full h-full bg-[#F8F4E3] opacity-100"
      style={{
        backgroundImage: `
          radial-gradient(at 30% 20%, rgba(139, 30, 63, 0.03) 0px, transparent 50%),
          radial-gradient(at 80% 70%, rgba(139, 30, 63, 0.02) 0px, transparent 50%),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")
        `,
        backgroundSize: "cover, cover, 200px 200px",
        backgroundPosition: "center, center, center",
      }}
    />
  )
}

