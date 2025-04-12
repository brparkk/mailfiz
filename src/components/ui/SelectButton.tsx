import { cn } from '../lib/utils';
import BaseButton from './BaseButton';

interface SelectButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  isSelected?: boolean;
}

function SelectButton({
  children,
  className,
  isSelected = false,
  ...props
}: SelectButtonProps) {
  return (
    <BaseButton
      className={cn(
        'w-full p-2 text-left text-sm cursor-pointer transition-colors',
        isSelected
          ? 'text-primary bg-button-tertiary'
          : 'text-text-primary hover:bg-button-secondary',
        className
      )}
      {...props}
    >
      {children}
    </BaseButton>
  );
}

export default SelectButton;
