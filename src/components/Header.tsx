import { useEffect, useRef, useState } from 'react';

const LINKS = [
  { href: '#speeches', label: 'The Talks' },
  { href: '#about', label: 'The Journey' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // The header only earns its border + blur once content is passing under it
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile panel on Escape and return focus to the control that opened it
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || menuOpen
          ? 'border-border-soft bg-bg/85 backdrop-blur-xl'
          : 'border-transparent bg-bg/50 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a
          href="#hero"
          className="group flex items-center gap-2.5 no-underline"
          aria-label="Naveen on Stage — home"
        >
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-full border border-gold/30 bg-gold/10 text-base transition-colors group-hover:border-gold/60 group-hover:bg-gold/20"
          >
            🎭
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-ui text-sm font-semibold tracking-[0.18em] text-gold uppercase">
              Naveen
            </span>
            <span className="font-ui text-2xs tracking-[0.18em] text-dim uppercase">
              On Stage
            </span>
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 sm:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-ui text-xs font-medium tracking-[0.16em] text-muted uppercase no-underline transition-colors hover:text-gold"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#speeches"
            className="rounded-full bg-gold px-5 py-2.5 font-ui text-xs font-semibold tracking-[0.16em] text-bg uppercase no-underline transition-colors hover:bg-gold-dim"
          >
            Watch the Talks
          </a>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full border border-line-strong text-cream transition-colors hover:border-gold hover:text-gold sm:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M3 7h18M3 12h18M3 17h18" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="animate-rise border-t border-border-soft bg-bg px-5 pb-6 sm:hidden"
        >
          <ul className="flex flex-col">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-border-soft py-4 font-ui text-sm font-medium tracking-[0.16em] text-cream uppercase no-underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#speeches"
            onClick={() => setMenuOpen(false)}
            className="mt-5 block rounded-full bg-gold px-5 py-3.5 text-center font-ui text-xs font-semibold tracking-[0.16em] text-bg uppercase no-underline"
          >
            Watch the Talks
          </a>
        </nav>
      )}
    </header>
  );
}
