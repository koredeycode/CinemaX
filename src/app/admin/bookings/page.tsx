import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";

async function getBookings() {
    await dbConnect();
    // Deep populate: booking -> showtime -> movie
    const bookings = await Booking.find({})
        .populate({
            path: 'showtime',
            populate: { path: 'movie' }
        })
        .sort({ createdAt: -1 });
    return bookings;
}

export default async function AdminBookingsPage() {
    const bookings = await getBookings();

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">Bookings</h1>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-800 text-white uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Guest</th>
                            <th className="px-6 py-4">Movie</th>
                            <th className="px-6 py-4">Seats</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {bookings.map((booking: any) => (
                            <tr key={String(booking._id)} className="hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-mono text-xs">{String(booking._id).substring(0, 8)}...</td>
                                <td className="px-6 py-4">
                                    <div className="text-white font-medium">{booking.guestDetails.name}</div>
                                    <div className="text-xs">{booking.guestDetails.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {booking.showtime?.movie?.title || "Unknown"}
                                    <div className="text-xs text-gray-500">
                                        {booking.showtime ? new Date(booking.showtime.startTime).toLocaleString() : ""}
                                    </div>
                                </td>
                                <td className="px-6 py-4">{booking.seats.join(", ")}</td>
                                <td className="px-6 py-4 text-primary font-bold">${booking.totalPrice}</td>
                                <td className="px-6 py-4">{new Date(booking.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                         {bookings.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center">No bookings found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
