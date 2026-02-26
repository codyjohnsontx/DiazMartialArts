import { Card } from './Card';

type TestimonialProps = {
  quote: string;
  name: string;
  detail: string;
};

export function Testimonial({ quote, name, detail }: TestimonialProps) {
  return (
    <Card className="relative h-full bg-white">
      {/* Large decorative quote mark */}
      <span
        className="pointer-events-none absolute left-4 top-2 select-none font-[var(--font-heading)] text-7xl leading-none text-ember/20"
        aria-hidden="true"
      >
        &ldquo;
      </span>
      <div className="relative">
        {/* 5 stars */}
        <div className="mb-4 flex gap-0.5" aria-label="5 out of 5 stars">
          {Array(5)
            .fill(null)
            .map((_, i) => (
              <span key={i} className="text-sm leading-none text-gold" aria-hidden="true">
                ★
              </span>
            ))}
        </div>
        <p className="text-base leading-relaxed text-ink">&ldquo;{quote}&rdquo;</p>
        <p className="mt-5 text-sm font-semibold text-ink">{name}</p>
        <p className="text-sm text-black/60">{detail}</p>
      </div>
    </Card>
  );
}
