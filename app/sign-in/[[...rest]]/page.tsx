import { Button } from '@/components/Button';
import { Eyebrow } from '@/components/Eyebrow';
import { MemberPortalWaitlistForm } from '@/components/MemberPortalWaitlistForm';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Member Portal Coming Soon',
  description:
    'The Diaz Martial Arts member portal is coming soon with membership access, class resources, and Diaz on Demand updates.',
  path: '/sign-in',
  noIndex: true,
});

const portalFeatures = [
  {
    n: '01',
    t: 'Membership access',
    d: 'A simpler place to check account status and member updates once online access opens.',
  },
  {
    n: '02',
    t: 'Class resources',
    d: 'Training notes, class references, and next-step guidance tied to what you practice at the gym.',
  },
  {
    n: '03',
    t: 'Diaz on Demand',
    d: 'Future access to structured video curriculum for students training between classes.',
  },
];

export default function SignInPage() {
  return (
    <>
      <section className="bg-ink text-sand">
        <div className="mx-auto grid min-h-[calc(100svh-76px)] w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
          <div>
            <Eyebrow variant="light">Account access</Eyebrow>
            <h1 className="display mt-5 text-5xl sm:text-7xl lg:text-[88px]">
              Member portal
              <br />
              <span className="text-ember">coming soon.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/72 sm:text-lg">
              Online login is closed while we prepare a cleaner member experience for
              membership access, class resources, and Diaz on Demand.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#waitlist" size="lg">
                Join the waitlist →
              </Button>
              <Button href="/schedule" variant="ghost-light" size="lg">
                View schedule
              </Button>
            </div>
          </div>

          <div className="self-center border border-white/12 bg-white/6 p-7 sm:p-8">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
              No login yet
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-sand">
              Be first to know when access opens.
            </h2>
            <p className="mb-5 mt-2 text-sm leading-relaxed text-white/68">
              We&apos;ll send launch updates and practical details for members as the portal
              gets closer.
            </p>
            <MemberPortalWaitlistForm />
          </div>
        </div>
      </section>

      <section className="border-b border-black/8 bg-sand">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <Eyebrow>What&apos;s coming</Eyebrow>
            <h2 className="display mt-3 text-3xl sm:text-[44px]">
              One place for the member side of training.
            </h2>
          </div>
          <div>
            {portalFeatures.map((feature, index) => (
              <div
                key={feature.n}
                className={`grid grid-cols-[52px_1fr] gap-5 py-5 ${
                  index === 0 ? 'border-t border-black/14' : 'border-t border-black/8'
                }`}
              >
                <div className="text-[13px] font-extrabold tracking-[0.08em] text-ember">
                  {feature.n}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight">{feature.t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-black/70">
                    {feature.d}
                  </p>
                </div>
              </div>
            ))}
            <div className="border-t border-black/8 pt-5">
              <Button href="/contact" variant="ghost">
                Contact the gym
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

