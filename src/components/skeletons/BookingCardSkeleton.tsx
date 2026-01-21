import { Skeleton } from "@/components/ui/Skeleton";

export function BookingCardSkeleton() {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex gap-4 items-center">
      <Skeleton className="w-16 h-24 rounded-lg shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2 w-2/3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex justify-between items-end">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
