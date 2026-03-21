const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-dark-700"></div>
        <div className="absolute inset-0 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
      </div>
      {text && <p className="text-sm text-dark-400 animate-pulse">{text}</p>}
    </div>
  );
};

const LoadingSkeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`loading-shimmer rounded-xl ${className}`}
        />
      ))}
    </>
  );
};

export { LoadingSpinner, LoadingSkeleton };
