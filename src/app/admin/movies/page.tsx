import dbConnect from "@/lib/db";
import Movie, { IMovie } from "@/models/Movie";
import Link from "next/link";

async function getMovies() {
    await dbConnect();
    const movies = await Movie.find({}).sort({ createdAt: -1 });
    return movies;
}

export default async function AdminMoviesPage() {
    const movies = await getMovies();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Movies</h1>
                <Link 
                    href="/admin/movies/new" 
                    className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
                >
                    Add Movie
                </Link>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-800 text-white uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Rating</th>
                            <th className="px-6 py-4">Runtime</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {movies.map((movie: IMovie) => (
                            <tr key={String(movie._id)} className="hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{movie.title}</td>
                                <td className="px-6 py-4">{movie.rating}</td>
                                <td className="px-6 py-4">{movie.runtime}m</td>
                                <td className="px-6 py-4">
                                    <Link 
                                        href={`/admin/movies/${movie._id}`}
                                        className="text-primary hover:text-red-400 mr-4"
                                    >
                                        Edit
                                    </Link>
                                    {/* Delete would require a client component or server action */}
                                </td>
                            </tr>
                        ))}
                         {movies.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center">No movies found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
