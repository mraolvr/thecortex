import React from 'react';

const baseClasses = [
  'inline-flex',
  'items-center',
  'justify-center',
  'px-4',
  'py-2',
  'rounded',
  'font-medium',
  'transition-colors',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-offset-2',
  'shadow',
  'disabled:opacity-60',
  'disabled:cursor-not-allowed',
  // Color classes for light and dark mode
  'bg-white',
  'text-black',
  'hover:bg-neutral-100',
  'dark:bg-neutral-800',
  'dark:text-white',
  'dark:hover:bg-neutral-700',
  'focus:ring-black',
  'dark:focus:ring-white',
  'focus:ring-offset-white',
  'dark:focus:ring-offset-black',
];

const Button = React.forwardRef(
  ({ children, className = '', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={[
        ...baseClasses,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = 'Button';

export default Button; 