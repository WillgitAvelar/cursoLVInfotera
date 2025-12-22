import React from 'react';

const Loader = ({ size = 'md', text = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizes[size]} border-lime-400 border-t-transparent rounded-full animate-spin`}
      />
      {text && (
        <p className="text-lime-400 mt-3 text-sm font-medium">{text}</p>
      )}
    </div>
  );
};

export default Loader;