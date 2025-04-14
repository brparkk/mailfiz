import { cn } from '../../lib/utils';

interface ArrowIconProps {
  className?: string;
  isOpen?: boolean;
}

function ArrowIcon({ className, isOpen }: ArrowIconProps) {
  return (
    <svg
      className={cn(
        'w-4 h-4 transition-transform',
        isOpen && 'rotate-180',
        className
      )}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export default ArrowIcon;
