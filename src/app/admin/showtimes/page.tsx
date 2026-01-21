import dbConnect from "@/lib/db";
import { IMovie } from "@/models/Movie"; // Ensure this is exported from Movie.ts
import Showtime, { IShowtime } from "@/models/Showtime";
import Link from "next/link";

interface PopulatedShowtime extends Omit<IShowtime, "movie"> {
    movie: IMovie;
}

async function getShowtimes() {
    await dbConnect();
    // Populate movie details
    const showtimes = await Showtime.find({}).populate("movie").sort({ startTime: 1 });
    return showtimes as unknown as PopulatedShowtime[];
}

export default async function AdminShowtimesPage() {
    const showtimes = await getShowtimes();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Showtimes</h1>
                <Link 
                    href="/admin/showtimes/new" 
                    className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
                >
                    Add Showtime
                </Link>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-800 text-white uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Movie</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Booked</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {showtimes.map((st) => (
                            <tr key={String(st._id)} className="hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{st.movie?.title || "Unknown Movie"}</td>
                                <td className="px-6 py-4">{new Date(st.startTime).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{new Date(st.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                <td className="px-6 py-4">${st.price}</td>
                                <td className="px-6 py-4">{st.bookedSeats.length} seats</td>
                            </tr>
                        ))}
                         {showtimes.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center">No showtimes found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
