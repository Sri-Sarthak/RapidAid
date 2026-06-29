const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

const LoadingSpinner = ({ size = "md", className = "" }) => (
  <div
    className={`inline-block animate-spin rounded-full border-primary-200 border-t-primary-600 ${sizeMap[size]} ${className}`}
    role="status"
    aria-label="Loading"
  />
);

export default LoadingSpinner;
