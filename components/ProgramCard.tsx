import { Card } from './Card';

type ProgramCardProps = {
  title: string;
  description: string;
  age: string;
  level: string;
};

export function ProgramCard({ title, description, age, level }: ProgramCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      {/* Ember top accent bar */}
      <div className="-mx-6 -mt-6 mb-5 h-1 rounded-t-2xl bg-ember" />
      <h3 className="text-xl font-bold text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-black/70">{description}</p>
      <div className="mt-5 space-y-1 text-xs uppercase tracking-[0.16em] text-black/55">
        <p>{age}</p>
        <p>{level}</p>
      </div>
      <div className="mt-auto flex justify-end pt-4">
        <span className="text-base text-black/30" aria-hidden="true">
          →
        </span>
      </div>
    </Card>
  );
}
