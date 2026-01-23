import Concession from "@/models/Concession";
import bcrypt from "bcryptjs";
import "dotenv/config";
import dbConnect from "../src/lib/db";
import logger from "../src/lib/logger";
import Booking from "../src/models/Booking";
import Movie from "../src/models/Movie";
import User from "../src/models/User";

const sampleMovies = [
  {
    title: "Dune: Part Two",
    slug: "dune-part-two",
    description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    posterUrl: "https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    trailerUrl: "https://www.youtube.com/embed/Way9Dexny3w",
    rating: "PG-13",
    runtime: 166,
    genres: ["Sci-Fi", "Adventure", "Drama"],
    status: "now_showing"
  },
  {
    title: "Oppenheimer",
    slug: "oppenheimer",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    posterUrl: "https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/7CENyUim29IEsaJhUxIGymCRvPu.jpg",
    trailerUrl: "https://www.youtube.com/embed/uYPbbksJxIg",
    rating: "R",
    runtime: 180,
    genres: ["Biography", "Drama", "History"],
    status: "now_showing"
  },
  {
    title: "Barbie",
    slug: "barbie",
    description: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.",
    posterUrl: "https://image.tmdb.org/t/p/original/vJ4r8imQ9piseO9ufCwsopBBWnZ.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/ctMserH8g2SeOAnCw5gFjdQF8mo.jpg",
    trailerUrl: "https://www.youtube.com/embed/pBk4NYhWNMM",
    rating: "PG-13",
    runtime: 114,
    genres: ["Adventure", "Comedy", "Fantasy"],
    status: "now_showing"
  },
  {
    title: "The Dark Knight",
    slug: "the-dark-knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    posterUrl: "https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    trailerUrl: "https://www.youtube.com/embed/EXeTwQWrcwY",
    rating: "PG-13",
    runtime: 152,
    genres: ["Action", "Crime", "Drama"],
    status: "coming_soon"
  },
  {
    title: "Inception",
    slug: "inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    posterUrl: "https://image.tmdb.org/t/p/original/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/ii8QGacT3MXESqBckQlyrATY0lT.jpg",
    trailerUrl: "https://www.youtube.com/embed/YoHD9XEInc0",
    rating: "PG-13",
    runtime: 148,
    genres: ["Action", "Adventure", "Sci-Fi"],
    status: "now_showing"
  },
  {
    title: "Spider-Man: Across the Spider-Verse",
    slug: "spider-man-across-the-spider-verse",
    description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.",
    posterUrl: "https://image.tmdb.org/t/p/original/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    trailerUrl: "https://www.youtube.com/embed/cqGjhVJWtEg",
    rating: "PG",
    runtime: 140,
    genres: ["Animation", "Action", "Adventure"],
    status: "coming_soon"
  },
  {
    title: "Interstellar",
    slug: "interstellar",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    posterUrl: "https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
    trailerUrl: "https://www.youtube.com/embed/zSWdZVtXT7E",
    rating: "PG-13",
    runtime: 169,
    genres: ["Adventure", "Drama", "Sci-Fi"],
    status: "not_showing"
  },
  {
    title: "Pulp Fiction",
    slug: "pulp-fiction",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    posterUrl: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/96hiUXEuYsu4tcnvlaY8tEMFM0m.jpg",
    trailerUrl: "https://www.youtube.com/embed/s7EdQ4FqbhY",
    rating: "R",
    runtime: 154,
    genres: ["Crime", "Drama"],
    status: "not_showing"
  },
  {
    title: "The Matrix",
    slug: "the-matrix",
    description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    posterUrl: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg",
    trailerUrl: "https://www.youtube.com/embed/vKQi3bBA1y8",
    rating: "R",
    runtime: 136,
    genres: ["Action", "Sci-Fi"],
    status: "coming_soon"
  },
  {
    title: "Avatar: The Way of Water",
    slug: "avatar-the-way-of-water",
    description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home.",
    posterUrl: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
    trailerUrl: "https://www.youtube.com/embed/d9MyqFCD6sQ",
    rating: "PG-13",
    runtime: 192,
    genres: ["Sci-Fi", "Adventure", "Action"],
    status: "now_showing"
  },
  {
    title: "Deadpool & Wolverine",
    slug: "deadpool-and-wolverine",
    description: "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.",
    posterUrl: "https://image.tmdb.org/t/p/original/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg",
    trailerUrl: "https://www.youtube.com/embed/73_1biulkYk",
    rating: "R",
    runtime: 127,
    genres: ["Action", "Comedy", "Sci-Fi"],
    status: "coming_soon"
  },
  {
    title: "Kingdom of the Planet of the Apes",
    slug: "kingdom-of-the-planet-of-the-apes",
    description: "Several generations in the future following Caesar's reign, in which apes are the dominant species living harmoniously and humans have been reduced to living in the shadows. As a new tyrannical ape leader builds his empire, one young ape undertakes a harrowing journey that will cause him to question all that he has known about the past and to make choices that will define a future for apes and humans alike.",
    posterUrl: "https://image.tmdb.org/t/p/original/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/iHYh4cdO8ylA3W0dUxTDVdyJ5G9.jpg",
    trailerUrl: "https://www.youtube.com/embed/Kdr5oedn7q8",
    rating: "PG-13",
    runtime: 145,
    genres: ["Sci-Fi", "Adventure", "Action"],
    status: "now_showing"
  }
];

const concessionItems = [
    { name: "Popcorn (Large)", price: 1500, emoji: "🍿", category: "food" },
    { name: "Popcorn (Medium)", price: 1200, emoji: "🍿", category: "food" },
    { name: "Soda (Large)", price: 800, emoji: "🥤", category: "drink" },
    { name: "Soda (Medium)", price: 600, emoji: "🥤", category: "drink" },
    { name: "Candy Bar", price: 500, emoji: "🍬", category: "snack" },
    { name: "Nachos & Cheese", price: 1800, emoji: "🧀", category: "food" },
    { name: "Hot Dog", price: 1200, emoji: "🌭", category: "food" },
    { name: "Water", price: 300, emoji: "💧", category: "drink" },
];

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

async function seed() {
  logger.info("🌱 Starting Database Seed...");

  try {
    await dbConnect();
    // 1. Clear Database
    logger.info("🧹 Clearing existing data...");
    await Booking.deleteMany({});
    await Movie.deleteMany({});
    await User.deleteMany({});

    // 2. Seed Users
    logger.info("👥 Seeding Users...");
    const adminPassword = await hashPassword("admin123");
    const userPassword = await hashPassword("user123");

    await User.create({
      name: "Admin User",
      email: "admin@cinemax.com",
      password: adminPassword,
      role: "admin"
    });

    await User.create({
      name: "John Doe",
      email: "user@cinemax.com",
      password: userPassword,
      role: "user"
    });

    logger.info(`   - Created Admin: admin@cinemax.com / admin123`);
    logger.info(`   - Created User: user@cinemax.com / user123`);

    // 3. Seed Movies
    logger.info("🎬 Seeding Movies...");
    
    // Generate Schedules for next 7 days
    const schedules: { date: string; times: string[] }[] = [];
    const today = new Date();
    for(let i=0; i<7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        schedules.push({
            date: dateStr,
            times: ["10:00", "13:00", "16:00", "19:00", "22:00"]
        });
    }

    const moviesWithSchedules = sampleMovies.map(m => ({
        ...m,
        price: 4500,
        schedule: schedules
    }));

    const movies = await Movie.insertMany(moviesWithSchedules);
    logger.info(`   - Added ${movies.length} movies with schedules`);

    // 5. Seed Concessions
    logger.info("🍿 Seeding Concessions...");
    const concessions = await Concession.insertMany(concessionItems);
    logger.info(`   - Added ${concessions.length} concessions`);

    // 6. Seed Bookings
    logger.info("🎟️ Seeding Bookings...");
    const user = await User.findOne({ email: "user@cinemax.com" });
    
    if (user && movies.length > 0) {
        const movie = movies[0];
        const schedule = movie.schedule[0]; // Today

        // Booking 1: Confirmed
        await Booking.create({
            user: user._id,
            userEmail: user.email,
            movieId: movie._id,
            date: schedule.date,
            time: schedule.times[1], // 13:00
            seats: ["D4", "D5"],
            foodDetails: [
                { id: concessions[0]._id.toString(), name: concessions[0].name, qty: 1, cost: concessions[0].price },
                { id: concessions[2]._id.toString(), name: concessions[2].name, qty: 2, cost: concessions[2].price }
            ],
            totalPrice: (movie.price * 2) + concessions[0].price + (concessions[2].price * 2),
            status: "confirmed",
            paymentIntentId: "SEED-REF-001"
        });

        // Booking 2: Pending
        await Booking.create({
            user: user._id,
            userEmail: user.email,
            movieId: movies[1]._id,
             date: schedule.date,
            time: schedule.times[3], // 19:00
            seats: ["F10"],
            totalPrice: movies[1].price,
            status: "pending", // Emulate an abandoned checkout
            paymentIntentId: "SEED-REF-002"
        });

        logger.info(`   - Created 2 sample bookings for ${user.email}`);
    }

    logger.info("✅ Seeding Complete!");
    process.exit(0);

  } catch (error) {
    logger.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
