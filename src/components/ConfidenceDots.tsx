import { cn } from '@/lib/utils';

interface Props {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  className?: string;
}

export function ConfidenceDots({ level, className }: Props) {
  const filled = level === 'HIGH' ? 3 : level === 'MEDIUM' ? 2 : 1;
  return (
    <span
      aria-label={`${level.toLowerCase()} confidence`}
      className={cn('inline-flex items-center gap-0.5', className)}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            'size-1 rounded-full',
            i < filled ? 'bg-current' : 'bg-current/25',
          )}
        />
      ))}
    </span>
  );
}
