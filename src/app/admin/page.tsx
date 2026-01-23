import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Movie from "@/models/Movie";

async function getStats() {
    await dbConnect();
    const movieCount = await Movie.countDocuments();
    const bookingCount = await Booking.countDocuments();
    // Calculate revenue using aggregation
    const revenueResult = await Booking.aggregate([
        { $match: { status: "confirmed" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    return { movieCount, bookingCount, totalRevenue };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-gray-400 text-sm font-medium">Total Revenue</h3>
                    <p className="text-3xl font-bold text-white mt-2">₦{stats.totalRevenue.toLocaleString()}</p>
                </div>
                
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-gray-400 text-sm font-medium">Total Bookings</h3>
                    <p className="text-3xl font-bold text-white mt-2">{stats.bookingCount}</p>
                </div>

                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-gray-400 text-sm font-medium">Active Movies</h3>
                    <p className="text-3xl font-bold text-white mt-2">{stats.movieCount}</p>
                </div>
            </div>
        </div>
    );
}
