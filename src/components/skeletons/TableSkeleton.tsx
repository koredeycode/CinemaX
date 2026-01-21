import { Skeleton } from "@/components/ui/Skeleton";

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function TableSkeleton({ rows = 5, cols = 4 }: TableSkeletonProps) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="w-full text-left">
        {/* Header */}
        <div className="bg-gray-800 p-4 border-b border-gray-800 flex gap-4">
            {Array.from({ length: cols }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-24" />
            ))}
        </div>
        
        {/* Rows */}
        <div className="divide-y divide-gray-800">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="p-4 flex gap-4 items-center">
               {Array.from({ length: cols }).map((_, j) => (
                   <Skeleton key={j} className="h-4 w-full" />
               ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
