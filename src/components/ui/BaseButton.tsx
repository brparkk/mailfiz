import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

function BaseButton({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'disabled:bg-[#f2f2f2] disabled:text-input-placeholder disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default BaseButton;
