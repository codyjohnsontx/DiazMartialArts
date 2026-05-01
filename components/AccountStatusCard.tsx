import Link from 'next/link';

import { Card } from './Card';

type AccountStatusCardProps = {
  vodActive: boolean;
};

export function AccountStatusCard({ vodActive }: AccountStatusCardProps) {
  return (
    <Card interactive={false}>
      <h2 className="text-lg font-bold text-ink">Diaz on Demand</h2>
      <p className="mt-2 text-sm text-black/70">Status: {vodActive ? 'Active' : 'Not Active'}</p>
      <Link
        href="/ondemand"
        className="mt-4 inline-flex items-center justify-center rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#941f15]"
      >
        {vodActive ? 'Go to Diaz on Demand' : 'Open Diaz on Demand'}
      </Link>
    </Card>
  );
}
