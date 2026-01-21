import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

export default function Loading() {
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="h-8 w-32 bg-gray-800 rounded animate-pulse"></div>
                <div className="h-10 w-28 bg-gray-800 rounded animate-pulse"></div>
            </div>
            <TableSkeleton rows={8} cols={4} />
        </div>
    );
}
