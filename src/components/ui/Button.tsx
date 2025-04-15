import React from 'react';
import { cn } from '../../lib/utils';
import BaseButton from './BaseButton';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary';
}

const variantStyles = {
  default:
    'border border-border text-text-primary hover:bg-button-tertiary hover:border-primary',
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary: 'bg-button-secondary text-primary hover:bg-button-secondary/90',
};

function Button({
  children,
  className,
  variant = 'default',
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      className={cn(
        'flex items-center justify-center h-8 px-4 rounded-2xl text-sm font-normal cursor-pointer transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </BaseButton>
  );
}

export default Button;
