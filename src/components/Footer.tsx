export default function Footer() {
  return (
    <footer className="border-t border-border-soft">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-serif text-lg text-cream">Naveen on Stage</p>
          <p className="mt-1 font-ui text-2xs tracking-[0.18em] text-dim uppercase">
            Toastmasters &middot; Public Speaking
          </p>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://www.toastmasters.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-ui text-2xs tracking-[0.16em] text-dim uppercase no-underline transition-colors hover:text-gold"
          >
            Toastmasters.org
          </a>
          <span aria-hidden="true" className="h-3 w-px bg-border" />
          <span className="font-ui text-2xs tracking-[0.16em] text-dim uppercase">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
