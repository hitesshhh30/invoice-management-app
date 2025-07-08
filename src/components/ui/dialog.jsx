import React from 'react';
import { X } from 'lucide-react';

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const DialogContent = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <div ref={ref} className={`p-6 ${className}`} {...props}>
    {children}
  </div>
));
DialogContent.displayName = 'DialogContent';

const DialogHeader = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}
    {...props}
  />
));
DialogHeader.displayName = 'DialogHeader';

const DialogTitle = React.forwardRef(({ className = '', ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef(({ className = '', ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-gray-500 ${className}`}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

const DialogFooter = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}
    {...props}
  />
));
DialogFooter.displayName = 'DialogFooter';

const DialogTrigger = ({ asChild, children, ...props }) => {
  return React.cloneElement(children, props);
};

const DialogClose = ({ asChild, children, onClose, ...props }) => {
  return React.cloneElement(children, {
    onClick: onClose,
    ...props
  });
};

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
};