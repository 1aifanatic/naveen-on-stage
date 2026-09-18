export default function Hero() {
  return (
    <section id="hero" className="px-6 py-24 md:py-36">
      <div className="max-w-3xl mx-auto text-center">
        {/* Category badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <span className="font-ui text-[11px] tracking-[0.2em] uppercase px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/30">
            Toastmasters Portfolio
          </span>
          <span className="font-ui text-[11px] tracking-[0.2em] uppercase px-3 py-1 rounded-full bg-surface-2 text-text-dim border border-border-soft">
            Speechcraft Curriculum
          </span>
          <span className="font-ui text-[11px] tracking-[0.2em] uppercase px-3 py-1 rounded-full bg-surface-2 text-text-dim border border-border-soft">
            Tall Tales Division Winner
          </span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl md:text-8xl text-text leading-[0.95] mb-8">
          Naveen
          <br />
          <span className="italic text-gold">Toastmasters Journey</span>
        </h1>

        <p className="font-serif text-xl md:text-2xl text-text-muted leading-relaxed max-w-xl mx-auto mb-10 italic">
          Speeches, storytelling, and public speaking practice. Authentic words,
          disciplined preparation, and ideas crafted for the stage.
        </p>

        {/* Action links */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          <a
            href="#video-pmU6-n0Z5jA"
            className="font-ui text-xs tracking-[0.25em] uppercase text-bg bg-gold hover:bg-gold-dim transition-colors px-6 py-3 rounded font-medium no-underline shadow-xs"
          >
            Start with Speechcraft #2 ↓
          </a>
          <a
            href="#videos"
            className="font-ui text-xs tracking-[0.25em] uppercase text-gold border-b border-gold/60 pb-1 hover:text-cream hover:border-cream transition-colors no-underline"
          >
            Explore all talks ↓
          </a>
        </div>
      </div>
    </section>
  );
}