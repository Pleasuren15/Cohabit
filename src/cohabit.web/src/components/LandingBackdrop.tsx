/**
 * Photographic backdrop for the landing province-selection flow.
 * Rendered behind both the province picker and its confirmation step.
 */
export default function LandingBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1920"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Scrim keeps the landing text legible over the photo */}
      <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70" />

      {/* Vignette to keep focus centred */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 dark:to-black/35" />
    </div>
  )
}