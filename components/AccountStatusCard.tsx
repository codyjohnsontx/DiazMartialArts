import { Card } from './Card';

type AccountStatusCardProps = {
  vodActive: boolean;
  ondemandUrl: string;
};

export function AccountStatusCard({ vodActive, ondemandUrl }: AccountStatusCardProps) {
  const href = vodActive ? `${ondemandUrl}/library` : `${ondemandUrl}/subscribe`;

  return (
    <Card>
      <h3 className="text-lg font-bold text-ink">Diaz on Demand</h3>
      <p className="mt-2 text-sm text-black/70">Status: {vodActive ? 'Active' : 'Not Active'}</p>
      <a
        href={href}
        className="mt-4 inline-flex items-center justify-center rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#941f15]"
      >
        {vodActive ? 'Go to Diaz on Demand' : 'Upgrade to Diaz on Demand'}
      </a>
    </Card>
  );
}
