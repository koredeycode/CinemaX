"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import clsx from "clsx";

interface SearchMoviesProps {
  className?: string;
}

import { Suspense } from "react";

function SearchMoviesContent({ className }: SearchMoviesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [text, setText] = useState(searchParams.get("search") || "");
  const [query] = useDebounce(text, 300);
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch results when query changes
  useEffect(() => {
    if (!query) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/movies?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
           setResults(data.data.slice(0, 5)); // Limit to 5 items
           setIsOpen(true);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [query]);

  const handleSearch = () => {
    setIsOpen(false);
    if (text.trim()) {
        router.push(`/search?search=${encodeURIComponent(text)}`);
    } else {
        router.push('/');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
  };

  return (
    <div className={clsx("relative w-full group", className)}>
      <div className="relative z-50">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if(query && results.length > 0) setIsOpen(true); }}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Delay to allow click
          placeholder="Search movies..."
          className="w-full bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 rounded-full py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all backdrop-blur-sm shadow-xl"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
           {loading ? (
             <div className="h-4 w-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin"></div>
           ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
           )}
        </div>
        
        {text && (
          <button
            onClick={() => { setText(""); setResults([]); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-40 max-h-96 overflow-y-auto custom-scrollbar">
              <div className="p-2">
                  <p className="text-xs font-bold text-gray-500 px-3 py-2 uppercase tracking-wider">Movies</p>
                  {results.map((movie) => (
                      <button
                        key={movie._id}
                        onClick={() => router.push(`/movies/${movie.slug}`)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg transition-colors text-left group/item"
                      >
                          <div className="w-10 h-14 bg-gray-800 rounded overflow-hidden shrink-0 relative">
                             {/* Small poster placeholder or image if available */}
                             {movie.posterUrl ? (
                                 <img src={movie.posterUrl} alt="" className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full bg-gray-700"></div>
                             )}
                          </div>
                          <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-white group-hover/item:text-primary truncate">{movie.title}</h4>
                              <p className="text-xs text-gray-400 truncate">{new Date(movie.createdAt).getFullYear()} • {movie.rating}</p>
                          </div>
                      </button>
                  ))}
              </div>
              <div className="bg-gray-950 p-2 border-t border-gray-800">
                  <button onClick={handleSearch} className="w-full py-2 text-xs font-bold text-primary hover:text-white transition-colors">
                      View all results for "{text}"
                  </button>
              </div>
          </div>
      )}
    </div>
  );
}

export default function SearchMovies(props: SearchMoviesProps) {
    return (
        <Suspense fallback={<div className={clsx("w-full h-10 bg-gray-800/50 rounded-full animate-pulse", props.className)}></div>}>
            <SearchMoviesContent {...props} />
        </Suspense>
    );
}
