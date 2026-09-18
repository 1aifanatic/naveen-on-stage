import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { videos } from '../data/videos';
import VideoCard from './VideoCard';
import type { Video, VideoCategory } from '../types';

export default function VideoGallery() {
  const [selectedFilter, setSelectedFilter] = useState<VideoCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [fullscreenVideo, setFullscreenVideo] = useState<Video | null>(null);
  const [isOsFullscreen, setIsOsFullscreen] = useState(false);
  const [modalCopied, setModalCopied] = useState(false);
  const theaterRef = useRef<HTMLDivElement>(null);

  // ponytail: in-memory filtering is instant for 8 speeches; avoids search index libraries
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesCategory =
        selectedFilter === 'All'
          ? true
          : selectedFilter === 'Speechcraft'
          ? video.category === 'Speechcraft'
          : video.category !== 'Speechcraft';

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const matchesQuery =
        video.title.toLowerCase().includes(query) ||
        video.label.toLowerCase().includes(query) ||
        video.description.toLowerCase().includes(query) ||
        video.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  }, [selectedFilter, searchQuery]);

  // Speechcraft speeches (strictly in order starting from #2 to #6)
  const speechcraftVideos = useMemo(
    () => videos.filter((v) => v.category === 'Speechcraft'),
    []
  );

  // Other speeches (Contest & Club)
  const otherVideos = useMemo(
    () => videos.filter((v) => v.category !== 'Speechcraft'),
    []
  );

  // Current index in the active list for theater mode navigation
  const activeFullscreenIndex = useMemo(() => {
    if (!fullscreenVideo) return -1;
    return videos.findIndex((v) => v.id === fullscreenVideo.id);
  }, [fullscreenVideo]);

  const handleNextVideo = useCallback(() => {
    if (activeFullscreenIndex < videos.length - 1) {
      setFullscreenVideo(videos[activeFullscreenIndex + 1]);
    }
  }, [activeFullscreenIndex]);

  const handlePrevVideo = useCallback(() => {
    if (activeFullscreenIndex > 0) {
      setFullscreenVideo(videos[activeFullscreenIndex - 1]);
    }
  }, [activeFullscreenIndex]);

  // Toggle OS-level hardware fullscreen
  // ponytail: standard HTML5 Fullscreen API avoids external modal/lightbox package
  function toggleOsFullscreen() {
    if (!document.fullscreenElement) {
      theaterRef.current?.requestFullscreen().catch(() => {});
      setIsOsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsOsFullscreen(false);
    }
  }

  // Keyboard navigation & scroll lock for fullscreen modal
  useEffect(() => {
    if (!fullscreenVideo) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
          setFullscreenVideo(null);
        }
      } else if (e.key === 'ArrowRight') {
        handleNextVideo();
      } else if (e.key === 'ArrowLeft') {
        handlePrevVideo();
      }
    }

    function handleFullscreenChange() {
      setIsOsFullscreen(Boolean(document.fullscreenElement));
    }

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [fullscreenVideo, handleNextVideo, handlePrevVideo]);

  // ponytail: handle hash link on mount and URL changes so shared links jump directly to speech
  useEffect(() => {
    function scrollToTargetHash() {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#video-')) {
        const id = hash.replace('#video-', '');
        const targetVideo = videos.find((v) => v.id === id);
        if (targetVideo) {
          setSelectedFilter('All');
        }
        setTimeout(() => {
          const el = document.getElementById(hash.slice(1));
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('border-gold', 'shadow-lg');
            setTimeout(() => {
              el.classList.remove('border-gold', 'shadow-lg');
            }, 2500);
          }
        }, 150);
      }
    }

    scrollToTargetHash();
    window.addEventListener('hashchange', scrollToTargetHash);
    return () => window.removeEventListener('hashchange', scrollToTargetHash);
  }, []);

  async function shareCurrentFullscreenVideo() {
    if (!fullscreenVideo) return;
    const url = `${window.location.origin}${window.location.pathname.replace(/\/index\.html$/, '')}#video-${fullscreenVideo.id}`;

    try {
      window.history.replaceState(null, '', url);
    } catch {}

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${fullscreenVideo.title} | Naveen Toastmasters Journey`,
          text: `Watch "${fullscreenVideo.title}" (${fullscreenVideo.label}) by Naveen:`,
          url,
        });
        setModalCopied(true);
        setTimeout(() => setModalCopied(false), 2500);
        return;
      } catch (err: unknown) {
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
      } catch {}
    }

    setModalCopied(true);
    setTimeout(() => setModalCopied(false), 2500);
  }

  return (
    <section id="videos" className="px-6 py-20 max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-12">
        <p className="font-ui text-xs tracking-[0.3em] uppercase text-text-dim mb-3">
          The Speeches
        </p>
        <h2 className="font-display text-4xl md:text-5xl text-text leading-tight mb-4">
          Speeches, <span className="italic text-gold">in order.</span>
        </h2>
        <p className="font-serif italic text-text-muted text-lg max-w-xl mx-auto">
          From the foundational Speechcraft series (starting from Speech #2) to Division
          championship storytelling and club keynotes.
        </p>
      </div>

      {/* Navigation & Filter Bar */}
      <div className="mb-12 space-y-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-surface/80 rounded-lg border border-border-soft max-w-xl mx-auto">
          <button
            type="button"
            onClick={() => setSelectedFilter('All')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded text-xs font-ui tracking-wider uppercase transition-all cursor-pointer ${
              selectedFilter === 'All'
                ? 'bg-gold text-bg font-semibold shadow-xs'
                : 'text-text-muted hover:text-cream bg-transparent border-none'
            }`}
          >
            All Speeches
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('Speechcraft')}
            className={`flex-1 min-w-[150px] py-2 px-3 rounded text-xs font-ui tracking-wider uppercase transition-all cursor-pointer ${
              selectedFilter === 'Speechcraft'
                ? 'bg-gold text-bg font-semibold shadow-xs'
                : 'text-text-muted hover:text-cream bg-transparent border-none'
            }`}
          >
            Speechcraft Series
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('Contest')}
            className={`flex-1 min-w-[140px] py-2 px-3 rounded text-xs font-ui tracking-wider uppercase transition-all cursor-pointer ${
              selectedFilter === 'Contest'
                ? 'bg-gold text-bg font-semibold shadow-xs'
                : 'text-text-muted hover:text-cream bg-transparent border-none'
            }`}
          >
            Contest & Club Speeches
          </button>
        </div>

        {/* Search / Topic Filter */}
        <div className="max-w-md mx-auto relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, keyword (e.g. AI, Habits, Humor)..."
            className="w-full bg-surface/50 border border-border rounded-md px-4 py-2.5 text-sm font-ui text-text placeholder:text-text-dim focus:outline-none focus:border-gold transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-ui text-text-dim hover:text-gold cursor-pointer bg-transparent border-none"
              aria-label="Clear search"
            >
              Clear ✕
            </button>
          )}
        </div>
      </div>

      {/* Render Lists */}
      {searchQuery.trim() !== '' ? (
        /* Search results view */
        <div className="space-y-12">
          <p className="font-ui text-xs tracking-wider text-text-dim text-center uppercase">
            Found {filteredVideos.length} talk{filteredVideos.length === 1 ? '' : 's'} matching "{searchQuery}"
          </p>
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <p className="font-serif italic text-text-muted text-lg mb-2">
                No speeches matched your search.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="font-ui text-xs text-gold uppercase tracking-wider underline cursor-pointer bg-transparent border-none"
              >
                Reset search filter
              </button>
            </div>
          ) : (
            filteredVideos.map((video, idx) => (
              <VideoCard
                key={video.id}
                video={video}
                index={idx + 1}
                onOpenFullscreen={setFullscreenVideo}
              />
            ))
          )}
        </div>
      ) : selectedFilter === 'Speechcraft' ? (
        /* Explicit Speechcraft Series View (in strict order #2 to #6) */
        <div className="space-y-12">
          <div className="p-4 rounded-md bg-surface border border-gold/20 text-center mb-8">
            <span className="font-ui text-[11px] font-medium uppercase tracking-widest text-gold block mb-1">
              Sequential Curriculum
            </span>
            <p className="font-serif italic text-sm text-text-muted">
              Organized sequentially starting with Speechcraft Speech #2 through Speech #6.
            </p>
          </div>

          <div className="space-y-12">
            {speechcraftVideos.map((video, idx) => (
              <VideoCard
                key={video.id}
                video={video}
                index={idx + 1}
                onOpenFullscreen={setFullscreenVideo}
              />
            ))}
          </div>
        </div>
      ) : selectedFilter === 'Contest' ? (
        /* Explicit Contest & Club View */
        <div className="space-y-12">
          <div className="p-4 rounded-md bg-surface border border-gold/20 text-center mb-8">
            <span className="font-ui text-[11px] font-medium uppercase tracking-widest text-gold block mb-1">
              Competition & Keynotes
            </span>
            <p className="font-serif italic text-sm text-text-muted">
              Tall Tales division championship speech, humorous presentations, and keynote storytelling.
            </p>
          </div>

          <div className="space-y-12">
            {otherVideos.map((video, idx) => (
              <VideoCard
                key={video.id}
                video={video}
                index={idx + 1}
                onOpenFullscreen={setFullscreenVideo}
              />
            ))}
          </div>
        </div>
      ) : (
        /* All Speeches View with Organized Section Headers */
        <div className="space-y-20">
          {/* Section 1: The Speechcraft Series in exact order #2 to #6 */}
          <div>
            <div className="border-b border-border pb-4 mb-10">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-ui uppercase tracking-wider bg-gold/15 text-gold border border-gold/30">
                  Speechcraft
                </span>
                <h3 className="font-display text-2xl md:text-3xl text-text">
                  The Speechcraft Series
                </h3>
              </div>
              <p className="font-serif italic text-text-muted text-sm mt-1">
                Delivered in curriculum order: starting from Speechcraft Speech #2.
              </p>
            </div>

            <div className="space-y-12">
              {speechcraftVideos.map((video, idx) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  index={idx + 1}
                  onOpenFullscreen={setFullscreenVideo}
                />
              ))}
            </div>
          </div>

          {/* Section 2: Contest & Club Speeches */}
          <div>
            <div className="border-b border-border pb-4 mb-10">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-ui uppercase tracking-wider bg-gold/15 text-gold border border-gold/30">
                  Featured Talks
                </span>
                <h3 className="font-display text-2xl md:text-3xl text-text">
                  Contest & Signature Club Talks
                </h3>
              </div>
              <p className="font-serif italic text-text-muted text-sm mt-1">
                Division 1st place championship storytelling and engaging club speeches.
              </p>
            </div>

            <div className="space-y-12">
              {otherVideos.map((video, idx) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  index={speechcraftVideos.length + idx + 1}
                  onOpenFullscreen={setFullscreenVideo}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Theater Modal */}
      {fullscreenVideo &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={theaterRef}
            className="fixed inset-0 z-[9999] bg-[#14110B] flex flex-col justify-between p-4 md:p-6 lg:p-8 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={`Full screen theater player for ${fullscreenVideo.title}`}
          >
          {/* Top Bar: Title, Label, Fullscreen Toggle, Close */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-border-soft shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-ui text-xs px-2.5 py-0.5 rounded bg-gold/20 text-gold border border-gold/30 shrink-0">
                {fullscreenVideo.label}
              </span>
              <h3 className="font-display text-lg md:text-2xl text-cream truncate">
                {fullscreenVideo.title}
              </h3>
              <span className="font-ui text-xs text-text-dim hidden sm:inline-block">
                • {fullscreenVideo.duration}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Share speech */}
              <button
                type="button"
                onClick={shareCurrentFullscreenVideo}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
                  modalCopied
                    ? 'bg-gold/20 border border-gold text-gold font-medium'
                    : 'bg-surface hover:bg-surface-2 border border-border text-xs font-ui text-text-muted hover:text-cream'
                }`}
                title="Share or copy link to this speech"
                aria-label="Share or copy link to this speech"
              >
                {modalCopied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="tracking-wider uppercase text-[10px] text-gold font-medium">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="hidden sm:inline tracking-wider uppercase text-[10px]">Share</span>
                  </>
                )}
              </button>

              {/* Native OS fullscreen toggle */}
              <button
                type="button"
                onClick={toggleOsFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface hover:bg-surface-2 border border-border text-xs font-ui text-text-muted hover:text-gold cursor-pointer transition-colors"
                title={isOsFullscreen ? 'Exit display fullscreen' : 'Enter display fullscreen'}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  {isOsFullscreen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0v4m0-4h4m6 6l5 5m0 0v-4m0 4h-4M9 15l-5 5m0 0v-4m0 4h4m11-5l5-5m0 0v4m0-4h-4" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  )}
                </svg>
                <span className="hidden sm:inline tracking-wider uppercase text-[10px]">
                  {isOsFullscreen ? 'Windowed' : 'Display Fullscreen'}
                </span>
              </button>

              {/* Close button */}
              <button
                type="button"
                onClick={() => setFullscreenVideo(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-surface hover:bg-surface-2 border border-border text-text-muted hover:text-cream cursor-pointer text-lg transition-colors"
                aria-label="Close fullscreen player"
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Center: Large 16:9 Video Player */}
          <div className="my-auto py-4 flex items-center justify-center w-full">
            <div className="w-full max-w-5xl aspect-video bg-black rounded-md overflow-hidden border border-border shadow-2xl relative">
              <iframe
                src={`https://www.youtube.com/embed/${fullscreenVideo.id}?autoplay=1&rel=0&enablejsapi=1`}
                title={fullscreenVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>

          {/* Bottom Bar: Sequential Navigation & Info */}
          <div className="pt-4 border-t border-border-soft shrink-0">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Previous Speech Button */}
              <button
                type="button"
                onClick={handlePrevVideo}
                disabled={activeFullscreenIndex <= 0}
                className="flex items-center gap-2 px-4 py-2 rounded bg-surface hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed border border-border text-xs font-ui tracking-wider uppercase text-text transition-colors cursor-pointer w-full md:w-auto justify-center"
              >
                <span>←</span>
                <span>
                  {activeFullscreenIndex > 0
                    ? `Prev: ${videos[activeFullscreenIndex - 1].label}`
                    : 'Start of Speeches'}
                </span>
              </button>

              {/* Sequential Indicator */}
              <div className="text-center">
                <span className="font-ui text-xs tracking-widest text-text-dim uppercase block">
                  Now Playing • {fullscreenVideo.label}
                </span>
                <span className="font-serif italic text-sm text-gold">
                  {fullscreenVideo.title}
                </span>
              </div>

              {/* Next Speech Button */}
              <button
                type="button"
                onClick={handleNextVideo}
                disabled={activeFullscreenIndex >= videos.length - 1}
                className="flex items-center gap-2 px-4 py-2 rounded bg-surface hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed border border-border text-xs font-ui tracking-wider uppercase text-gold transition-colors cursor-pointer w-full md:w-auto justify-center"
              >
                <span>
                  {activeFullscreenIndex < videos.length - 1
                    ? `Next: ${videos[activeFullscreenIndex + 1].label}`
                    : 'End of Speeches'}
                </span>
                <span>→</span>
              </button>
            </div>

            {/* Keyboard hints */}
            <p className="text-center font-ui text-[10px] text-text-dim mt-3">
              Tip: Use Left / Right arrow keys to switch speeches • Esc to exit
            </p>
          </div>
          </div>,
          document.body
        )}
    </section>
  );
}