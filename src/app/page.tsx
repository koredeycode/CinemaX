import MovieCarousel from "@/components/MovieCarousel";

import MovieCard from "@/components/MovieCard";
import { IMovie } from "@/models/Movie";


export const dynamic = "force-dynamic";

async function getMovies(status = "now_showing"): Promise<IMovie[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  
  try {
    const url = new URL(`${apiUrl}/api/movies`);
    url.searchParams.set("status", status);
    
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error(`Failed to fetch ${status} movies:`, error);
    return [];
  }
}

export default async function Home() {
  const nowShowingMovies = await getMovies("now_showing");
  const comingSoonMovies = await getMovies("coming_soon");

  // If no "now showing" movies, try to show everything or just handle empty
  // But per requirements, let's just show what we have.
  
  // Carousel primarily shows "Now Showing"
  const carouselMovies = nowShowingMovies.length > 0 ? nowShowingMovies : [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Carousel Section */}
      <MovieCarousel movies={carouselMovies} />

      {/* Now Showing Section */}
      <section id="now-showing" className="scroll-mt-20 my-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <h2 className="text-2xl font-bold text-white border-l-4 border-primary pl-4">
            Now Showing
          </h2>
        </div>
        
        {nowShowingMovies.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
             <p className="text-gray-500">No movies currently showing.</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x scrollbar-hide">
            {nowShowingMovies.map((movie) => (
              <div key={(movie as any)._id} className="min-w-[200px] w-[200px] snap-start">
                  <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Coming Soon Section */}
      <section id="coming-soon" className="scroll-mt-20 my-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <h2 className="text-2xl font-bold text-white border-l-4 border-blue-500 pl-4">
            Coming Soon
          </h2>
        </div>
        
        {comingSoonMovies.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
             <div className="text-4xl mb-3 opacity-50">📅</div>
             <p className="text-gray-500">More exciting titles coming soon.</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x scrollbar-hide">
            {comingSoonMovies.map((movie) => (
              <div key={(movie as any)._id} className="min-w-[200px] w-[200px] snap-start">
                  <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
