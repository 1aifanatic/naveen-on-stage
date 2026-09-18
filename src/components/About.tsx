export default function About() {
  return (
    <section id="about" className="px-6 py-16 border-y border-border-soft bg-surface/30">
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-ui text-xs tracking-[0.3em] uppercase text-text-dim mb-4">
          The Journey
        </p>
        <p className="font-serif text-lg md:text-xl text-text-muted leading-relaxed italic mb-6">
          "I speak at Toastmasters to practice the craft of saying things worth hearing."
        </p>
        <p className="font-ui text-xs text-text-dim tracking-wide leading-relaxed max-w-lg mx-auto">
          Explore the Speechcraft progression in curriculum order (starting from Speech #2),
          followed by competitive Tall Tales and club presentations. Watch in theater full-screen,
          share a talk, and leave a quick heart reaction under any speech.
        </p>
      </div>
    </section>
  );
}