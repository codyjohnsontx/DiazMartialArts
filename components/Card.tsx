import { cn } from '@/lib/utils';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  interactive?: boolean;
};

export function Card({ children, className, id, interactive = true }: CardProps) {
  return (
    <div
      id={id}
      className={cn('surface-card rounded-2xl p-6', interactive && 'card-hover', className)}
    >
      {children}
    </div>
  );
}
