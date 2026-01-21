import MovieHero from "@/components/MovieHero";

import ShowtimeSelector from "@/components/ShowtimeSelector";
import { IMovie } from "@/models/Movie";
import { IShowtime } from "@/models/Showtime";
import { notFound } from "next/navigation";

async function getMovie(id: string): Promise<IMovie | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${apiUrl}/api/movies/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch (error) {
    return null;
  }
}

async function getShowtimes(movieId: string): Promise<IShowtime[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${apiUrl}/api/showtimes?movieId=${movieId}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data;
  } catch (error) {
    return [];
  }
}

export default async function MoviePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const movie = await getMovie(slug);

  if (!movie) {
    notFound();
  }

  const showtimes = await getShowtimes(movie._id.toString());



  return (
    <div className="bg-black min-h-screen">
      <MovieHero movie={movie} />

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Col: Info (Trailer is now in Hero Modal) */}
        <div className="lg:col-span-2 space-y-12">
            <section>
                <h2 className="text-2xl font-bold text-white mb-6">Synopsis</h2>
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 leading-relaxed text-gray-300 text-lg">
                    {movie.description}
                </div>
            </section>
        </div>

        {/* Right Col: Booking */}
        <div className="lg:col-span-1">
            <div className="sticky top-24">
                <h2 className="text-2xl font-bold text-white mb-6">Showtimes</h2>
                <ShowtimeSelector showtimes={showtimes} />
            </div>
        </div>
      </div>
    </div>
  );
}
