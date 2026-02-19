import { cn } from '@/lib/utils';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export function Card({ children, className, id }: CardProps) {
  return (
    <div id={id} className={cn('rounded-2xl border border-black/10 bg-white p-6 shadow-sm', className)}>
      {children}
    </div>
  );
}
