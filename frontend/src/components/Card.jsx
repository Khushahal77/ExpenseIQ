const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'p-6',
  onClick,
}) => {
  const baseClass = hover ? 'glass-card-hover cursor-pointer' : 'glass-card';
  
  return (
    <div
      className={`${baseClass} ${padding} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
