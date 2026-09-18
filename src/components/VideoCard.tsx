import { useState } from 'react';
import type { Video } from '../types';

interface VideoCardProps {
  video: Video;
  index: number;
  onOpenFullscreen: (video: Video) => void;
}

export default function VideoCard({ video, index, onOpenFullscreen }: VideoCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ponytail: native clipboard API saves installing a copy/toast library
  function copyShareLink() {
    const url = `${window.location.origin}${window.location.pathname}#video-${video.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function submitFeedback(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (rating === 0) return setError('Please tap a heart to rate.');
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          name: name.trim() || undefined,
          rating,
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
      setName('');
      setMessage('');
    } catch {
      setError('Could not send. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article
      id={`video-${video.id}`}
      className="scroll-mt-24 p-6 md:p-8 rounded-lg bg-surface/60 border border-border/80 hover:border-border transition-colors animate-fade-up"
    >
      {/* Header: Label, Number, Duration */}
      <header className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="font-ui text-xs tracking-[0.25em] text-text-dim">
              №{String(index).padStart(2, '0')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-ui font-medium tracking-wider uppercase bg-gold/10 text-gold border border-gold/30">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              {video.label}
            </span>
          </div>

          <span className="font-ui text-xs tracking-wider text-text-muted flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 text-gold-soft"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" strokeWidth="2" />
              <path strokeWidth="2" strokeLinecap="round" d="M12 7v5l3 2" />
            </svg>
            {video.duration}
          </span>
        </div>

        <h3 className="font-display text-2xl md:text-3xl text-text leading-snug">
          {video.title}
        </h3>

        <p className="font-serif italic text-text-muted text-base md:text-lg leading-relaxed mt-2 mb-3">
          {video.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {video.tags.map((tag) => (
            <span
              key={tag}
              className="font-ui text-[11px] text-text-dim px-2 py-0.5 rounded bg-surface-2/60 border border-border-soft"
            >
              #{tag}
            </span>
          ))}
        </div>
      </header>

      {/* Player Section */}
      <div className="relative aspect-video bg-surface-2 rounded-sm overflow-hidden border border-border mb-4">
        {!loaded ? (
          <div className="relative w-full h-full group">
            <img
              src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
              loading="lazy"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-black/30" />

            {/* Duration pill in bottom right */}
            <span className="absolute bottom-3 right-3 font-ui text-[11px] font-medium tracking-wider px-2 py-0.5 rounded bg-bg/80 text-cream border border-border backdrop-blur-xs">
              {video.duration}
            </span>

            {/* Big center play trigger */}
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className="absolute inset-0 flex items-center justify-center cursor-pointer border-none bg-transparent group"
              aria-label={`Play ${video.title} inline`}
            >
              <span className="relative z-10 w-16 h-16 rounded-full border border-gold/70 bg-bg/70 backdrop-blur-xs flex items-center justify-center text-gold text-xl group-hover:scale-110 group-hover:bg-gold group-hover:text-bg transition-all shadow-lg">
                ▶
              </span>
            </button>

            {/* Quick Full Screen banner at top right */}
            <button
              type="button"
              onClick={() => onOpenFullscreen(video)}
              className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded bg-bg/80 text-cream border border-border hover:border-gold hover:text-gold text-xs font-ui tracking-wider transition-colors cursor-pointer"
              title="Watch full screen"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>Full Screen</span>
            </button>
          </div>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        )}
      </div>

      {/* Video Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-2 border-b border-border-soft text-xs font-ui">
        <div className="flex items-center gap-2">
          {/* Watch Full Screen button */}
          <button
            type="button"
            onClick={() => onOpenFullscreen(video)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface hover:bg-surface-2 border border-border hover:border-gold text-gold transition-colors cursor-pointer"
            aria-label={`Watch ${video.title} in full screen theater`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span className="tracking-wider uppercase font-medium text-[11px]">Watch Full Screen</span>
          </button>

          {/* Copy link */}
          <button
            type="button"
            onClick={copyShareLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface hover:bg-surface-2 border border-border text-text-muted hover:text-cream transition-colors cursor-pointer"
            title="Copy link to this speech"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-[11px] uppercase tracking-wider">
              {copied ? 'Link Copied!' : 'Share'}
            </span>
          </button>
        </div>

        {/* YouTube external link */}
        <a
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-text-dim hover:text-gold tracking-wider uppercase text-[11px] no-underline transition-colors"
        >
          <span>Open on YouTube</span>
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Direct, ultra-simple reaction row */}
      <div className="pt-4 border-t border-border-soft">
        {submitted ? (
          <div className="flex items-center gap-2 py-1 text-gold font-serif italic text-base">
            <span className="text-xl">♥</span>
            <span>Thank you! Your reaction was received.</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Hearts + quick submit */}
              <div className="flex items-center gap-3">
                <span className="font-ui text-xs tracking-wider uppercase text-text-muted">
                  Reaction:
                </span>
                <div
                  className="flex items-center gap-1.5"
                  onMouseLeave={() => setHover(0)}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHover(n)}
                      className="text-2xl leading-none cursor-pointer bg-transparent border-none p-0 transition-transform hover:scale-125"
                      aria-label={`${n} heart${n > 1 ? 's' : ''}`}
                    >
                      <span className={(hover || rating) >= n ? 'text-gold' : 'text-border'}>
                        ♥
                      </span>
                    </button>
                  ))}
                </div>

                {rating > 0 && (
                  <button
                    type="button"
                    onClick={() => submitFeedback()}
                    disabled={submitting}
                    className="font-ui text-xs uppercase tracking-wider px-3 py-1 bg-gold text-bg font-semibold rounded hover:bg-gold-dim transition-colors cursor-pointer border-none shadow-xs"
                  >
                    {submitting ? 'Sending…' : 'Send ♥'}
                  </button>
                )}
              </div>

              {/* Optional note toggle */}
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="font-ui text-xs text-text-dim hover:text-gold tracking-wider uppercase bg-transparent border-none cursor-pointer transition-colors"
              >
                {open ? '− Close note' : '+ Add note (optional)'}
              </button>
            </div>

            {/* Optional Note & Name Drawer */}
            {open && (
              <div className="pt-2 pb-1 space-y-3 max-w-md animate-fade-up">
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name (optional)"
                    maxLength={50}
                    className="w-full bg-transparent border-0 border-b border-border py-1 font-serif text-base text-text placeholder:text-text-dim focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What stayed with you? (optional note)"
                    rows={2}
                    maxLength={300}
                    className="w-full bg-transparent border-0 border-b border-border py-1 font-serif text-base text-text placeholder:text-text-dim focus:outline-none focus:border-gold transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => submitFeedback()}
                    disabled={submitting || rating === 0}
                    className="font-ui text-xs tracking-wider uppercase px-4 py-2 bg-gold text-bg font-medium rounded hover:bg-gold-dim disabled:opacity-40 transition-colors cursor-pointer border-none"
                  >
                    {submitting ? 'Sending…' : rating > 0 ? 'Send reaction & note' : 'Tap hearts above to rate'}
                  </button>
                </div>
              </div>
            )}

            {error && <p className="font-ui text-xs text-red-400/80">{error}</p>}
          </div>
        )}
      </div>
    </article>
  );
}