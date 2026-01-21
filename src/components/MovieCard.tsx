import { IMovie } from "@/models/Movie";
import Link from "next/link";

interface MovieCardProps {
  movie: IMovie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie.slug || movie._id}`} className="group relative block overflow-hidden rounded-lg bg-gray-900 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
      <div className="aspect-[2/3] w-full overflow-hidden bg-gray-800">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-lg font-bold text-white group-hover:text-primary transition-colors">
            {movie.title}
            </h3>
            <span className="shrink-0 rounded bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-300 border border-gray-700">
                {movie.rating}
            </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-gray-400">
          {movie.genres.join(", ")} • {movie.runtime}m
        </p>
      </div>
    </Link>
  );
}
