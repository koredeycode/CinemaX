import Link from "next/link";
import { ReactNode } from "react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  actionLink?: string;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({
  title = "No data found",
  message = "It looks like there is nothing here yet.",
  actionLabel,
  actionLink,
  icon,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 py-16 bg-gray-900/30 rounded-xl border border-dashed border-gray-800 ${className}`}>
      {icon ? (
        <div className="mb-6 opacity-50">{icon}</div>
      ) : (
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-6 opacity-50">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        </div>
      )}
      
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-sm mb-8">{message}</p>

      {actionLabel && actionLink && (
        <Link 
          href={actionLink}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
