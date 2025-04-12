import { cn } from '../utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

function BaseButton({ children, className, ...props }: ButtonProps) {
  return (
    <button className={cn(className)} {...props}>
      {children}
    </button>
  );
}

export default BaseButton;
