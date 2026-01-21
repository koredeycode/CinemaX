import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-center px-4">
      <h1 className="text-9xl font-bold text-primary opacity-20">404</h1>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <h2 className="text-4xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 max-w-md mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          href="/"
          className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
