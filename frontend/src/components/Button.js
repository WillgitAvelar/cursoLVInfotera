import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-lime-400 text-black hover:bg-lime-500 hover:shadow-lg hover:shadow-lime-400/50',
    secondary: 'bg-gray-800 text-lime-400 border border-lime-400 hover:bg-lime-400 hover:text-black',
    outline: 'bg-transparent text-lime-400 border-2 border-lime-400 hover:bg-lime-400 hover:text-black',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-lime-400 hover:bg-gray-900'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;