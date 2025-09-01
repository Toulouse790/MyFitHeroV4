import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        'destructive-ghost':
          'text-destructive hover:bg-destructive/10 focus-visible:ring-destructive',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
      shape: {
        default: 'rounded-md',
        pill: 'rounded-full',
      },
      isIcon: {
        true: {},
        false: {},
      },
    },
    compoundVariants: [
      {
        variant: 'link',
        size: ['sm', 'lg', 'default'],
        className: 'px-0 py-0',
      },
      {
        isIcon: true,
        size: 'default',
        className: 'w-10 p-0',
      },
      {
        isIcon: true,
        size: 'sm',
        className: 'w-9 p-0',
      },
      {
        isIcon: true,
        size: 'lg',
        className: 'w-11 p-0',
      },
      {
        isIcon: true,
        shape: 'pill',
        size: 'default',
        className: 'rounded-full',
      },
      {
        isIcon: true,
        shape: 'pill',
        size: 'sm',
        className: 'rounded-full',
      },
      {
        isIcon: true,
        shape: 'pill',
        size: 'lg',
        className: 'rounded-full',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'default',
      isIcon: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      isIcon,
      asChild = false,
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = loading || props.disabled;

    const loaderSize = size === 'lg' ? 'h-5 w-5' : size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, shape, isIcon, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? <Loader2 className={cn('animate-spin', loaderSize)} /> : children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
