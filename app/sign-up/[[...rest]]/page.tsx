import { Button } from '@/components/Button';
import { Eyebrow } from '@/components/Eyebrow';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Account Access Closed',
  description: 'Online Diaz Martial Arts account creation is temporarily unavailable.',
  path: '/sign-up',
  noIndex: true,
});

export default function SignUpPage() {
  return (
    <section className="mx-auto grid min-h-[calc(100svh-76px)] w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
      <div>
        <Eyebrow>Account access</Eyebrow>
        <h1 className="display mt-5 text-5xl sm:text-7xl">
          Account creation
          <br />
          <span className="text-ember">is closed.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-black/72 sm:text-lg">
          The member portal is coming soon, but new online accounts are not open yet.
          Join the waitlist for launch updates or contact the gym to start training.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/sign-in#waitlist" size="lg">
            Join the waitlist →
          </Button>
          <Button href="/contact" variant="ghost" size="lg">
            Contact the gym
          </Button>
        </div>
      </div>

      <div className="border border-black/10 bg-white p-7 shadow-sm sm:p-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-bronze">
          Coming soon
        </div>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink">
          No signup form is available right now.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-black/70">
          Staff can still help with membership questions, class access, and trial class
          setup directly.
        </p>
        <div className="mt-6 border-t border-black/10 pt-5">
          <Button href="/schedule" variant="ghost">
            View schedule
          </Button>
        </div>
      </div>
    </section>
  );
}

