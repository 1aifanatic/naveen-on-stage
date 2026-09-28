export default function About() {
  return (
    <section id="about" className="border-y border-border-soft bg-surface/40">
      <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 sm:py-24">
        <p className="eyebrow">The Journey</p>

        <blockquote className="mt-7">
          <p className="font-serif text-2xl leading-snug text-cream italic sm:text-3xl">
            &ldquo;I speak at Toastmasters to practise saying things worth
            hearing.&rdquo;
          </p>
        </blockquote>

        <div className="rule mx-auto my-9 w-24" />

        <p className="mx-auto max-w-xl text-body leading-relaxed text-muted">
          Every talk here is a practice run kept in public. The Speechcraft
          series runs in curriculum order from Speech&nbsp;#2 &mdash; the
          fundamentals, one at a time. The Tall Tales championship and the club
          keynotes are what came after: longer stories, harder rooms, and less
          room to hide.
        </p>

        <p className="mx-auto mt-5 max-w-xl text-body leading-relaxed text-muted">
          Watch in theatre mode, share a link straight to a speech, and leave a
          quick reaction underneath the one that stayed with you.
        </p>
      </div>
    </section>
  );
}
