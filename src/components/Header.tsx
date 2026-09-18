export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md border-b border-border-soft">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <a
          href="#hero"
          className="font-ui text-sm tracking-wider uppercase text-gold no-underline font-semibold flex items-center gap-2"
        >
          <span className="text-base">🎭</span>
          <span>Naveen <span className="text-text-dim font-normal">Toastmasters Journey</span></span>
        </a>

        <nav className="flex items-center gap-6 font-ui text-xs tracking-wider uppercase text-text-muted">
          <a
            href="#videos"
            className="hover:text-gold transition-colors no-underline hidden sm:inline-block"
          >
            Speechcraft #2–#6
          </a>
          <a
            href="#videos"
            className="hover:text-gold transition-colors no-underline"
          >
            All Speeches
          </a>
          <a
            href="#about"
            className="hover:text-gold transition-colors no-underline hidden md:inline-block"
          >
            About
          </a>
        </nav>
      </div>
    </header>
  );
}