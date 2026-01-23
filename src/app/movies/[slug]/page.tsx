import BookingSelector from "@/components/BookingSelector";
import MovieHero from "@/components/MovieHero";
import { IMovie } from "@/models/Movie";
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

export default async function MoviePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const movie = await getMovie(slug);

  if (!movie) {
    notFound();
  }

  return (
    <div className="bg-black min-h-screen">
      <MovieHero movie={movie} />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Col: Synopsis & Details */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Storyline Section */}
            <section className="animate-fade-in-up">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-1 h-8 bg-primary rounded-full"></span>
                Storyline
              </h2>
              <div className="text-gray-300 text-lg leading-relaxed space-y-4">
                <p>{movie.description}</p>
              </div>
            </section>

             {/* Details Grid */}
             <section className="animate-fade-in-up delay-100">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="w-1 h-8 bg-primary rounded-full"></span>
                    About the Movie
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800/50 hover:border-gray-700 transition-colors">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-2">Released</h3>
                        <p className="text-white text-xl font-medium">
                            {new Date(movie.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                     <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800/50 hover:border-gray-700 transition-colors">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-2">Genre</h3>
                        <div className="flex flex-wrap gap-2">
                            {movie.genres.map(g => (
                                <span key={g} className="bg-gray-800 text-gray-200 px-3 py-1 rounded-full text-sm border border-gray-700">
                                    {g}
                                </span>
                            ))}
                        </div>
                    </div>
                     <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800/50 hover:border-gray-700 transition-colors">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-2">Runtime</h3>
                         <p className="text-white text-xl font-medium">{movie.runtime} minutes</p>
                    </div>
                     <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800/50 hover:border-gray-700 transition-colors">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-2">Rating</h3>
                         <p className="text-white text-xl font-medium">{movie.rating}</p>
                    </div>
                </div>
            </section>
          </div>

          {/* Right Col: Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
                 <div className="bg-gray-900/30 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
                    {movie.status === "now_showing" ? (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Book Tickets
                            </h2>
                            <BookingSelector movie={movie} />
                        </>
                    ) : (
                        <div className="text-center py-10">
                            {movie.status === "coming_soon" ? (
                                <>
                                    <div className="text-5xl mb-4">📅</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
                                    <p className="text-gray-400">
                                        Tickets are not yet available for this movie. Stay tuned!
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="text-5xl mb-4">🚫</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Not Showing</h3>
                                    <p className="text-gray-400">
                                        This movie is no longer showing in cinemas.
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                 </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
