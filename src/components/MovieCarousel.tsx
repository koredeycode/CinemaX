"use client";

import { IMovie } from "@/models/Movie";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";

interface MovieCarouselProps {
  movies: IMovie[];
}

export default function MovieCarousel({ movies }: MovieCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative group rounded-2xl overflow-hidden shadow-2xl mb-12 border border-gray-800">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {movies.slice(0, 5).map((movie) => (
            <Link
              key={movie._id.toString()}
              href={`/movies/${movie.slug}`}
              className="flex-[0_0_100%] min-w-0 relative aspect-[4/5] sm:aspect-[21/9] cursor-pointer block"
            >
              {/* Backdrop Image */}
              <div className="absolute inset-0">
                  <Image
                    src={movie.backdropUrl}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/60 sm:via-transparent to-transparent opacity-90 sm:opacity-80" />
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 p-6 sm:p-8 md:p-12 lg:p-16 w-full md:w-2/3 lg:w-1/2 z-10 flex flex-col justify-end h-full pointer-events-none">
                <span className="text-primary font-bold tracking-wider text-xs sm:text-sm uppercase mb-2 text-shadow-sm">
                  Now Showing
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 sm:mb-4 leading-tight drop-shadow-md">
                  {movie.title}
                </h2>
                <div className="flex items-center gap-3 sm:gap-4 text-gray-300 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                    <span className="bg-white/10 px-2 py-1 rounded backdrop-blur-sm shadow-sm">{movie.rating}</span>
                    <span className="drop-shadow-sm">{movie.runtime}m</span>
                   <span className="bg-primary/20 text-primary px-2 py-1 rounded backdrop-blur-sm shadow-sm">{movie.genres?.[0] || 'Movie'}</span>
                </div>
                <p className="text-gray-200 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 line-clamp-3 sm:line-clamp-2 drop-shadow-md">
                  {movie.description}
                </p>
                <div className="flex gap-4 pointer-events-auto">
                  <span
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 sm:px-6 sm:py-3 md:px-8 rounded-xl sm:rounded-xl text-sm sm:text-base font-bold transition-all transform hover:scale-105 shadow-lg shadow-primary/25 inline-block"
                  >
                    View Details
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-primary/80 backdrop-blur-sm text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 z-20 border border-white/10 hidden sm:block"
        onClick={scrollPrev}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-primary/80 backdrop-blur-sm text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 z-20 border border-white/10 hidden sm:block"
        onClick={scrollNext}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

       {/* Dots Indicators (Optional but nice) */}
       <div className="absolute bottom-6 right-8 z-20 flex gap-2">
           {/* We can implement dots if we have access to scrollSnaps from emblaApi, 
               but for simplicity, let's stick to arrows or just the autoplay */}
       </div>
    </div>
  );
}
