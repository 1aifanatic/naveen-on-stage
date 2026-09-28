import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Video } from '../types';

interface TheaterProps {
  videos: Video[];
  current: Video;
  onNavigate: (video: Video) => void;
  onClose: () => void;
}

function buildShareUrl(video: Video) {
  return `${window.location.origin}${window.location.pathname.replace(/\/index\.html$/, '')}#video-${video.id}`;
}

export default function Theater({ videos, current, onNavigate, onClose }: TheaterProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [isOsFullscreen, setIsOsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const index = videos.findIndex((v) => v.id === current.id);
  const hasPrev = index > 0;
  const hasNext = index < videos.length - 1;

  const goPrev = useCallback(() => {
    if (index > 0) onNavigate(videos[index - 1]);
  }, [index, onNavigate, videos]);

  const goNext = useCallback(() => {
    if (index < videos.length - 1) onNavigate(videos[index + 1]);
  }, [index, onNavigate, videos]);

  const toggleOsFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      panelRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Scroll lock, focus management and the keyboard model for the dialog.
  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
        return;
      }
      if (e.key !== 'Tab') return;

      // Focus trap: keep Tab inside the dialog while it owns the screen.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input, textarea, iframe, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const onFullscreenChange = () => setIsOsFullscreen(Boolean(document.fullscreenElement));

    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      // Send focus back to the tile that opened this, so keyboard users resume in place.
      restoreFocusRef.current?.focus?.();
    };
  }, [goNext, goPrev, onClose]);

  async function share() {
    const url = buildShareUrl(current);
    try {
      window.history.replaceState(null, '', url);
    } catch {}

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${current.title} | Naveen on Stage`,
          text: `Watch "${current.title}" (${current.label}) by Naveen:`,
          url,
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      } catch (err: unknown) {
        // A user closing the native share sheet is not a failure.
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }

    let success = false;
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        success = true;
      } catch {}
    }

    if (!success) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        success = true;
      } catch {}
    }

    setCopied(success);
    setTimeout(() => setCopied(false), 2500);
  }

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Theatre player: ${current.title}`}
      className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-bg"
    >
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b border-border-soft bg-bg/90 px-4 py-3.5 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 font-ui text-2xs font-medium tracking-[0.12em] text-gold uppercase">
            {current.label}
          </span>
          <h2 className="truncate font-serif text-lg text-cream sm:text-2xl">
            {current.title}
          </h2>
          <span className="hidden shrink-0 font-ui text-xs text-dim tabular-nums sm:inline">
            {current.duration}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={share}
            className="flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-2 font-ui text-2xs tracking-[0.12em] text-muted uppercase transition-colors hover:border-gold hover:text-gold"
            aria-label="Share or copy a link to this talk"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="hidden sm:inline">{copied ? 'Link copied' : 'Share'}</span>
          </button>

          <button
            type="button"
            onClick={toggleOsFullscreen}
            className="flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-2 font-ui text-2xs tracking-[0.12em] text-muted uppercase transition-colors hover:border-gold hover:text-gold"
            aria-label={isOsFullscreen ? 'Exit display fullscreen' : 'Enter display fullscreen'}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              {isOsFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0v4m0-4h4m6 6l5 5m0 0v-4m0 4h-4M9 15l-5 5m0 0v-4m0 4h4m11-5l5-5m0 0v4m0-4h-4" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              )}
            </svg>
          </button>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-line-strong text-muted transition-colors hover:border-gold hover:text-gold"
            aria-label="Close theatre player"
            title="Close (Esc)"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Player — flexes into whatever is left so the meta below is never
          pushed off-screen. YouTube letterboxes itself, so no aspect lock. */}
      <div className="flex min-h-0 flex-1 items-center px-4 py-4 sm:px-6 sm:py-6">
        <div className="h-full max-h-[68vh] min-h-[12rem] w-full max-w-6xl overflow-hidden rounded-card border border-border bg-black shadow-2xl shadow-black/60">
          <iframe
            src={`https://www.youtube.com/embed/${current.id}?autoplay=1&rel=0&enablejsapi=1`}
            title={current.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      </div>

      {/* Meta + reaction */}
      <div className="max-h-[42vh] shrink-0 overflow-y-auto border-t border-border-soft px-4 pt-5 pb-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="max-w-3xl text-body leading-relaxed text-muted">
            {current.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {current.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-border-soft bg-surface-2/60 px-2 py-0.5 font-ui text-2xs text-dim"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-4 border-t border-border-soft pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Reaction videoId={current.id} key={current.id} />

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <button
                type="button"
                onClick={goPrev}
                disabled={!hasPrev}
                className="flex items-center gap-2 rounded-full border border-line-strong px-4 py-2.5 font-ui text-2xs tracking-[0.12em] text-muted uppercase transition-colors hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-35"
              >
                <span aria-hidden="true">←</span>
                <span>{hasPrev ? videos[index - 1].label : 'Start'}</span>
              </button>

              <span className="font-ui text-2xs tracking-[0.12em] text-dim tabular-nums">
                {index + 1} / {videos.length}
              </span>

              <button
                type="button"
                onClick={goNext}
                disabled={!hasNext}
                className="flex items-center gap-2 rounded-full border border-line-strong px-4 py-2.5 font-ui text-2xs tracking-[0.12em] text-muted uppercase transition-colors hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-35"
              >
                <span>{hasNext ? videos[index + 1].label : 'End'}</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <p className="mt-4 text-center font-ui text-2xs text-faint">
            <kbd className="font-ui">←</kbd> <kbd className="font-ui">→</kbd> to change
            talk &middot; <kbd className="font-ui">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Reaction lives here rather than under all eight tiles: the moment someone
// actually has an opinion is right after they have watched one.
function Reaction({ videoId }: { videoId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [noteOpen, setNoteOpen] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit() {
    if (rating === 0) {
      setError('Pick a rating first.');
      return;
    }
    setError('');
    setStatus('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          name: name.trim() || undefined,
          rating,
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('done');
      setName('');
      setMessage('');
    } catch {
      setStatus('error');
      setError('Could not send. Try again.');
    }
  }

  if (status === 'done') {
    return (
      <p className="font-serif text-lg text-gold italic">
        Thank you &mdash; your reaction came through.
      </p>
    );
  }

  return (
    <div className="w-full sm:max-w-md">
      <div className="flex flex-wrap items-center gap-3">
        <span id={`rating-label-${videoId}`} className="font-ui text-2xs tracking-[0.14em] text-dim uppercase">
          Reaction
        </span>

        <div
          className="flex items-center gap-0.5"
          role="group"
          aria-labelledby={`rating-label-${videoId}`}
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(0)}
              aria-pressed={rating === n}
              aria-label={`Rate ${n} out of 5`}
              className="cursor-pointer border-0 bg-transparent p-1 text-xl leading-none transition-transform duration-150 hover:scale-125"
            >
              <span className={(hover || rating) >= n ? 'text-gold' : 'text-faint'}>♥</span>
            </button>
          ))}
        </div>

        {rating > 0 && (
          <button
            type="button"
            onClick={submit}
            disabled={status === 'sending'}
            className="cursor-pointer rounded-full bg-gold px-4 py-2 font-ui text-2xs font-semibold tracking-[0.12em] text-bg uppercase transition-colors hover:bg-gold-dim disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending…' : 'Send'}
          </button>
        )}

        <button
          type="button"
          onClick={() => setNoteOpen((v) => !v)}
          aria-expanded={noteOpen}
          className="cursor-pointer border-0 bg-transparent font-ui text-2xs tracking-[0.12em] text-dim uppercase transition-colors hover:text-gold"
        >
          {noteOpen ? '− Drop note' : '+ Add a note'}
        </button>
      </div>

      {noteOpen && (
        <div className="animate-rise mt-3 space-y-2">
          <label className="sr-only" htmlFor={`name-${videoId}`}>
            Your name
          </label>
          <input
            id={`name-${videoId}`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            maxLength={50}
            className="w-full border-b border-line-strong bg-transparent pb-1.5 font-ui text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none"
          />
          <label className="sr-only" htmlFor={`note-${videoId}`}>
            Your note
          </label>
          <textarea
            id={`note-${videoId}`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What stayed with you?"
            rows={2}
            maxLength={300}
            className="w-full resize-none border-b border-line-strong bg-transparent pb-1.5 font-ui text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none"
          />
        </div>
      )}

      {error && <p className="mt-2 font-ui text-2xs text-red-400/90">{error}</p>}
    </div>
  );
}
