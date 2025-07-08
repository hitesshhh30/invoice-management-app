import React from 'react';

const Button = React.forwardRef(({ 
  className = '', 
  variant = 'default', 
  size = 'default', 
  disabled = false,
  children, 
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500',
    link: 'text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500'
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3 py-1 text-sm',
    lg: 'h-11 px-8 py-2 text-lg',
    icon: 'h-10 w-10'
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      className={classes}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };