"use client";

import { IMovie } from "@/models/Movie";
import { useState } from "react";
import TrailerModal from "./TrailerModal";

interface MovieHeroProps {
  movie: IMovie;
}

export default function MovieHero({ movie }: MovieHeroProps) {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  return (
    <>
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-10" />
        
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          className="h-full w-full object-cover opacity-70"
        />

        <div className="absolute bottom-0 left-0 z-20 container mx-auto px-4 py-12 flex items-end">
          <img
            src={movie.posterUrl}
            className="w-56 rounded-xl shadow-2xl mr-8 hidden lg:block border border-gray-700/50"
          />
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
              {movie.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-200 text-sm md:text-base mb-6 font-medium">
              <span className="bg-white/10 backdrop-blur-md px-2 py-1 rounded border border-white/20">
                {movie.rating}
              </span>
              <span>{movie.runtime} min</span>
              <span>{movie.genres.join(", ")}</span>
            </div>
            {/* <p className="text-gray-200 text-lg leading-relaxed line-clamp-3 md:line-clamp-none mb-8 drop-shadow-md">
              {movie.description}
            </p> */}

            <button
              onClick={() => setIsTrailerOpen(true)}
              className="flex items-center gap-3 bg-primary hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-lg shadow-primary/40 group"
            >
              <span className="flex items-center justify-center w-8 h-8 bg-white text-primary rounded-full group-hover:bg-white/90">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              </span>
              Watch Trailer
            </button>
          </div>
        </div>
      </div>

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={movie.trailerUrl}
      />
    </>
  );
}
