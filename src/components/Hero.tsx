import { videos } from '../data/videos';

// Lead with the win. This is the strongest single piece of work in the set.
const FEATURED = videos.find((v) => v.category === 'Contest') ?? videos[0];

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden">
      {/* Stage-light wash. Pure CSS — no image asset. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] h-[38rem] w-[38rem] rounded-full opacity-45 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(245,197,24,0.20) 0%, rgba(245,197,24,0.06) 45%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12 lg:gap-16 lg:py-32">
        <div className="lg:col-span-7">
          <p className="eyebrow animate-rise">Toastmasters &middot; Public Speaking</p>

          <h1 className="display-xl animate-rise mt-6 font-serif leading-[0.92] text-cream [animation-delay:60ms]">
            Naveen
            <br />
            <span className="text-gold italic">on Stage</span>
          </h1>

          <p className="animate-rise mt-8 max-w-xl text-lede leading-relaxed text-muted [animation-delay:120ms]">
            A working record of the craft. Five Speechcraft speeches in curriculum
            order, then the Tall Tales division championship &mdash; stories built,
            rehearsed, and delivered until the words held up under a room.
          </p>

          <div className="animate-rise mt-10 flex flex-wrap items-center gap-4 [animation-delay:180ms]">
            <a
              href="#speeches"
              className="rounded-full bg-gold px-7 py-3.5 font-ui text-xs font-semibold tracking-[0.18em] text-bg uppercase no-underline transition-colors hover:bg-gold-dim"
            >
              Watch all {videos.length} talks
            </a>
            <a
              href={`#video-${videos[0].id}`}
              className="font-ui text-xs font-medium tracking-[0.18em] text-gold uppercase no-underline transition-colors hover:text-cream"
            >
              <span className="border-b border-gold/50 pb-1 transition-colors hover:border-cream">
                Start with Speechcraft&nbsp;#2
              </span>
            </a>
          </div>

          <dl className="animate-rise mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-7 [animation-delay:240ms]">
            <div>
              <dt className="eyebrow">Talks</dt>
              <dd className="mt-1.5 font-serif text-3xl text-cream">{videos.length}</dd>
            </div>
            <div>
              <dt className="eyebrow">Division</dt>
              <dd className="mt-1.5 font-serif text-3xl text-gold">1st</dd>
            </div>
            <div>
              <dt className="eyebrow">Runtime</dt>
              <dd className="mt-1.5 font-serif text-3xl text-cream">~49m</dd>
            </div>
          </dl>
        </div>

        {/* Featured talk — the championship win, treated like a poster */}
        <figure className="animate-spotlight lg:col-span-5 [animation-delay:140ms]">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rotate-2 rounded-card border border-gold/20"
            />
            <div className="relative overflow-hidden rounded-card border border-gold/30 bg-surface shadow-2xl shadow-black/50">
              <div className="aspect-video">
                <img
                  src={`https://img.youtube.com/vi/${FEATURED.id}/hqdefault.jpg`}
                  alt={`Thumbnail for ${FEATURED.title}`}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: '65% center' }}
                  width="480"
                  height="360"
                  fetchPriority="high"
                />
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent"
              />
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-bg/85 px-3 py-1.5 font-ui text-2xs font-medium tracking-[0.14em] text-gold uppercase backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Championship win
              </span>
            </div>
          </div>

          <figcaption className="mt-5 px-1">
            <p className="font-serif text-xl leading-snug text-cream italic">
              {FEATURED.title}
            </p>
            <p className="mt-1.5 font-ui text-xs text-dim">
              North Town Division &middot; Tall Tales
            </p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
