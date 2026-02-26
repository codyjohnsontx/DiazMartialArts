import { Button } from '@/components/Button';
import { Section } from '@/components/Section';

export default function NotFound() {
  return (
    <Section eyebrow="404" title="Page Not Found">
      <p className="mb-6 text-base leading-relaxed text-black/70">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button href="/">Go Back Home</Button>
        <Button href="/contact" variant="secondary">
          Contact Us
        </Button>
      </div>
    </Section>
  );
}
