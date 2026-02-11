interface SkeletonBoxProps {
  width?: string;
  height?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function SkeletonBox({
  width,
  height,
  className = "",
  children,
}: SkeletonBoxProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
      style={{ width, height }}
    >
      {children}
    </div>
  );
}
