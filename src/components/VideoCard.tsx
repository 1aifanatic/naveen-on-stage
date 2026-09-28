import { useState } from 'react';
import type { Video } from '../types';

interface VideoCardProps {
  video: Video;
  index: number;
  onOpen: (video: Video) => void;
}

// The whole tile is one control: click anywhere to open the theatre player.
// Duration is stated once, here, rather than repeated in a card header.
export default function VideoCard({ video, index, onOpen }: VideoCardProps) {
  const [thumbFailed, setThumbFailed] = useState(false);

  return (
    <article className="group relative">
      <button
        type="button"
        onClick={() => onOpen(video)}
        className="block w-full cursor-pointer border-0 bg-transparent p-0 text-left"
        aria-label={`Play ${video.title} — ${video.label}, ${video.duration}`}
      >
        <div className="relative overflow-hidden rounded-card border border-border bg-surface-2 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:border-gold/50 group-hover:shadow-xl group-hover:shadow-black/50">
          <div className="aspect-video">
            {thumbFailed ? (
              // A 404 from the CDN should degrade to a branded plate, not a black hole.
              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-surface-2 to-bg">
                <span className="font-serif text-3xl text-faint italic" aria-hidden="true">
                  {String(index).padStart(2, '0')}
                </span>
              </div>
            ) : (
              <img
                src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                alt=""
                onError={() => setThumbFailed(true)}
                className="h-full w-full object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                style={{ objectPosition: '60% center' }}
                loading="lazy"
                width="480"
                height="360"
              />
            )}
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />

          {/* Always visible on touch, revealed on hover with a pointer. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full border border-gold/60 bg-bg/75 text-gold backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:border-gold group-hover:bg-gold group-hover:text-bg">
              <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.5v13a1 1 0 001.53.85l10.2-6.5a1 1 0 000-1.7L9.53 4.65A1 1 0 008 5.5z" />
              </svg>
            </span>
          </span>

          <span className="absolute right-3 bottom-3 rounded bg-bg/85 px-2 py-1 font-ui text-2xs font-medium tracking-[0.08em] text-cream tabular-nums backdrop-blur-sm">
            {video.duration}
          </span>
        </div>

        {/* Meta above the title so every tile's label row lines up, and the
            title — the one element allowed to wrap — is always last. */}
        <div className="pt-4">
          <p className="flex items-baseline gap-2 font-ui text-2xs tracking-[0.12em] text-dim uppercase">
            <span className="text-faint tabular-nums">
              {String(index).padStart(2, '0')}
            </span>
            <span className="truncate">{video.label}</span>
          </p>
          <h3 className="mt-1.5 line-clamp-2 min-h-[3.1rem] font-serif text-lg leading-snug text-cream transition-colors duration-200 group-hover:text-gold">
            {video.title}
          </h3>
        </div>
      </button>
    </article>
  );
}
