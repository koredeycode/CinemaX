import MovieCarousel from "@/components/MovieCarousel";

import MovieCard from "@/components/MovieCard";
import { IMovie } from "@/models/Movie";

async function getMovies(search?: string): Promise<IMovie[]> {
  const isDev = process.env.NODE_ENV !== 'production';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  
  try {
    const url = new URL(`${apiUrl}/api/movies`);
    if (search) {
      url.searchParams.set("search", search);
    }
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch movies:", error);
    return [];
  }
}

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;
  const movies = await getMovies(search);
  
  // Use all movies for carousel if no search, otherwise maybe just show top ones? 
  // For now, let's just pass the movies list. If search is active, carousel will show filtered results 
  // which might be weird, but let's stick to requirements.
  // Ideally, the carousel should perhaps always show "Featured" movies (all movies), 
  // and the search only affects the grid below.
  // Let's fetch "all movies" separately for carousel if we want it constant, 
  // but for simplicity/performance let's use the fetched movies or maybe 
  // fetch top 5 separately if search is present.
  
  // Better UX: Carousel always shows the latest/trendiest movies.
  // Grid shows the search results.
  let carouselMovies = movies;
  if (search) {
      // If searching, we probably still want a nice hero. 
      // Let's re-fetch top 5 for carousel if we are in search mode, 
      // OR just hide carousel in search mode? 
      // User asked for "carousel ... swipeable", didn't specify behavior on search.
      // Let's assume carousel is always there as a "Hero".
      carouselMovies = await getMovies(); // fetch all (limitation: double fetch unless cached)
      // Since `getMovies` caches 'no-store', this double fetches. 
      // We can optimize later.
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Carousel Section */}
      <MovieCarousel movies={carouselMovies} />

      <section id="movies" className="scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <h2 className="text-2xl font-bold text-white border-l-4 border-primary pl-4">
            {search ? `Search Results for "${search}"` : "Now Showing"}
          </h2>
        </div>
        
        {movies.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No movies found</div>
            {search && (
              <p className="text-gray-600">
                Try adjusting your search for "{search}"
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.map((movie) => (
              <MovieCard key={(movie as any)._id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
