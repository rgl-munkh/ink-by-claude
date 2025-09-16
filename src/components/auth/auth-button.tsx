import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AuthButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode;
  isLoading?: boolean;
}

export function AuthButton({
  children,
  isLoading = false,
  className,
  disabled,
  ...props
}: AuthButtonProps) {
  return (
    <Button
      className={cn(
        "w-full h-12 text-base font-medium",
        "lg:w-auto lg:min-w-[120px] lg:h-10 lg:text-sm",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading...
        </div>
      ) : (
        children
      )}
    </Button>
  );
}