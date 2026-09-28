import { useEffect, useMemo, useState } from 'react';
import { videos } from '../data/videos';
import VideoCard from './VideoCard';
import Theater from './Theater';
import type { Video } from '../types';

const FILTERS = [
  { key: 'All', short: 'All', label: 'All Talks' },
  { key: 'Speechcraft', short: 'Speechcraft', label: 'Speechcraft Series' },
  { key: 'Contest', short: 'Contest', label: 'Contest & Club' },
] as const;

type Filter = (typeof FILTERS)[number]['key'];

function inCategory(video: Video, filter: Filter) {
  if (filter === 'All') return true;
  if (filter === 'Speechcraft') return video.category === 'Speechcraft';
  return video.category !== 'Speechcraft';
}

export default function VideoGallery() {
  const [filter, setFilter] = useState<Filter>('All');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Video | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);

  const speechcraft = useMemo(
    () => videos.filter((v) => v.category === 'Speechcraft'),
    []
  );
  const featured = useMemo(
    () => videos.filter((v) => v.category !== 'Speechcraft'),
    []
  );

  // ponytail: 8 items, so a linear filter is instant — no search index needed.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos.filter((video) => {
      if (!inCategory(video, filter)) return false;
      if (!q) return true;
      return (
        video.title.toLowerCase().includes(q) ||
        video.label.toLowerCase().includes(q) ||
        video.description.toLowerCase().includes(q) ||
        video.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [filter, query]);

  const searching = query.trim() !== '';

  // Deep links: #video-<id> reveals the tile and rings it, whether the link
  // was pasted cold or clicked while the page was already open.
  useEffect(() => {
    function revealHash() {
      const hash = window.location.hash;
      if (!hash.startsWith('#video-')) return;
      const id = hash.slice('#video-'.length);
      const target = videos.find((v) => v.id === id);
      if (!target) return;

      setFilter('All');
      setQuery('');
      // Wait a frame so the tile is painted before we measure and scroll to it.
      requestAnimationFrame(() => {
        const el = document.getElementById(hash.slice(1));
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlight(id);
        setTimeout(() => setHighlight(null), 2400);
      });
    }

    revealHash();
    window.addEventListener('hashchange', revealHash);
    return () => window.removeEventListener('hashchange', revealHash);
  }, []);

  const groups = searching
    ? [{ key: 'results', title: 'Results', sub: null, items: results }]
    : filter === 'All'
    ? [
        {
          key: 'speechcraft',
          title: 'The Speechcraft Series',
          sub: 'Delivered in curriculum order, starting at Speech #2.',
          items: speechcraft,
        },
        {
          key: 'featured',
          title: 'Contest & Club Talks',
          sub: 'Division championship storytelling and club keynotes.',
          items: featured,
        },
      ]
    : [
        {
          key: filter === 'Speechcraft' ? 'speechcraft' : 'featured',
          title:
            filter === 'Speechcraft'
              ? 'The Speechcraft Series'
              : 'Contest & Club Talks',
          sub:
            filter === 'Speechcraft'
              ? 'Delivered in curriculum order, starting at Speech #2.'
              : 'Division championship storytelling and club keynotes.',
          items: filter === 'Speechcraft' ? speechcraft : featured,
        },
      ];

  return (
    <section id="speeches" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
      {/* Heading */}
      <div className="max-w-2xl">
        <p className="eyebrow">The Talks</p>
        <h2 className="display-lg mt-4 font-serif leading-[1.05] text-cream">
          Speeches, <span className="text-gold italic">in order.</span>
        </h2>
        <p className="mt-5 text-lede leading-relaxed text-muted">
          Five fundamentals, then the rooms that tested them. Pick any talk to
          watch it in theatre mode.
        </p>
      </div>

      {/* Filters */}
      <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Filter talks by series"
          className="grid grid-cols-3 gap-1 rounded-2xl border border-border-soft bg-surface/70 p-1.5 sm:flex sm:w-auto sm:rounded-full"
        >
          {FILTERS.map((f) => {
            const selected = filter === f.key;
            const count =
              f.key === 'All'
                ? videos.length
                : videos.filter((v) => inCategory(v, f.key)).length;
            return (
              <button
                key={f.key}
                type="button"
                role="tab"
                id={`tab-${f.key}`}
                aria-selected={selected}
                aria-controls="speeches-panel"
                onClick={() => setFilter(f.key)}
                className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border-0 px-2 py-2.5 font-ui text-2xs font-medium tracking-[0.08em] uppercase transition-colors sm:rounded-full sm:px-4 sm:tracking-[0.12em] ${
                  selected
                    ? 'bg-gold text-bg'
                    : 'bg-transparent text-muted hover:text-cream'
                }`}
              >
                <span className="truncate sm:hidden">{f.short}</span>
                <span className="hidden sm:inline">{f.label}</span>
                <span className={selected ? 'text-bg/60' : 'text-faint tabular-nums'}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative sm:w-72">
          <label htmlFor="talk-search" className="sr-only">
            Search talks by title, topic, or keyword
          </label>
          <input
            id="talk-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics — AI, habits, humour…"
            className="w-full rounded-full border border-line-strong bg-surface/60 py-3 pr-10 pl-4 font-ui text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-1 text-dim transition-colors hover:text-gold"
              aria-label="Clear search"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Panel */}
      <div id="speeches-panel" role="tabpanel" aria-labelledby={`tab-${filter}`} className="mt-12">
        <p aria-live="polite" className="sr-only">
          {searching
            ? `${results.length} talks match your search`
            : `${results.length} talks shown`}
        </p>

        {results.length === 0 ? (
          <div className="rounded-card border border-dashed border-line-strong px-6 py-20 text-center">
            <p className="font-serif text-xl text-muted italic">
              Nothing matches &ldquo;{query.trim()}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setFilter('All');
              }}
              className="mt-5 cursor-pointer border-0 bg-transparent font-ui text-2xs tracking-[0.14em] text-gold uppercase transition-colors hover:text-cream"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {groups.map((group) =>
              group.items.length === 0 ? null : (
                <section key={group.key} aria-label={group.title}>
                  <div className="mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border pb-4">
                    <h3 className="font-serif text-2xl text-cream sm:text-3xl">
                      {group.title}
                    </h3>
                    {group.sub && (
                      <p className="font-ui text-xs text-dim">{group.sub}</p>
                    )}
                  </div>

                  <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((video) => (
                      <div
                        key={video.id}
                        id={`video-${video.id}`}
                        className="scroll-mt-28"
                        data-highlight={highlight === video.id ? 'true' : undefined}
                      >
                        <VideoCard
                          video={video}
                          index={videos.indexOf(video) + 1}
                          onOpen={setActive}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )
            )}
          </div>
        )}
      </div>

      {active && (
        <Theater
          videos={videos}
          current={active}
          onNavigate={setActive}
          onClose={() => setActive(null)}
        />
      )}
    </section>
  );
}
