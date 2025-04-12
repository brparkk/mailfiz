import { cn } from '../utils';
import BaseButton from './BaseButton';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

type ButtonVariant = 'default' | 'primary' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

const defaultVariants = {
  variant: 'default',
  size: 'md',
};

const buttonVariants: Record<ButtonVariant, ButtonProps> = {
  default: {
    variant: 'default',
    size: 'md',
  },
  primary: {
    variant: 'primary',
    size: 'md',
  },
  secondary: {
    variant: 'secondary',
    size: 'md',
  },
};

function Button({ children, className, ...props }: ButtonProps) {
  return (
    <BaseButton className={cn(className)} {...props}>
      {children}
    </BaseButton>
  );
}

export default Button;
