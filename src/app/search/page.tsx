import { FadeIn, StaggerContainer, StaggerItem } from "@/components/Motion";
import MovieCard from "@/components/MovieCard";
import { IMovie } from "@/models/Movie";
import Link from "next/link";

async function getMovies(search?: string): Promise<IMovie[]> {
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

export default async function SearchPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;
  const movies = await getMovies(search);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
           <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
           </Link>
           <h1 className="text-2xl font-bold text-white border-l-4 border-primary pl-4">
             Search Results for "{search}"
           </h1>
      </div>

      {movies.length === 0 ? (
        <FadeIn>
          <div className="text-center py-20 bg-gray-900 rounded-2xl border border-gray-800">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl text-white font-bold mb-2">No movies found</h2>
            <p className="text-gray-400">
              We couldn't find any movies matching "{search}". Try a different keyword.
            </p>
          </div>
        </FadeIn>
      ) : (
        <StaggerContainer className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {movies.map((movie) => (
            <StaggerItem key={(movie as any)._id}>
                <MovieCard movie={movie} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
