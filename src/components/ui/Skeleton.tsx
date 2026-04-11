import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

export const ProductCardSkeleton: React.FC = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <Skeleton className="h-48 w-full rounded-lg" />
    <div className="mt-3 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-9 w-full mt-4" />
    </div>
  </div>
);
