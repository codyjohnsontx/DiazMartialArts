import Image from 'next/image';

type CrestProps = {
  size?: number;
  variant?: 'dark' | 'light';
  className?: string;
};

export function Crest({ size = 40, variant = 'dark', className }: CrestProps) {
  const borderColor = variant === 'light' ? 'rgba(247, 243, 237, 0.7)' : 'rgba(16, 18, 20, 0.18)';

  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderColor,
      }}
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full border bg-white ${className ?? ''}`}
    >
      <Image src="/diaz_logo.png" alt="" fill sizes={`${size}px`} className="object-cover" />
    </span>
  );
}
