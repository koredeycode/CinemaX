"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string;
}

export default function TrailerModal({ isOpen, onClose, trailerUrl }: TrailerModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  // Convert standard YouTube watch URL to embed URL if needed
  // from: https://www.youtube.com/watch?v=VIDEO_ID
  // to: https://www.youtube.com/embed/VIDEO_ID?autoplay=1
  let embedUrl = trailerUrl;
  if (trailerUrl.includes("watch?v=")) {
    embedUrl = trailerUrl.replace("watch?v=", "embed/");
    if (!embedUrl.includes("?")) {
        embedUrl += "?autoplay=1";
    } else {
        embedUrl += "&autoplay=1";
    }
  } else if (trailerUrl.includes("youtu.be/")) {
     // Handle short links if necessary, though seed uses watch?v=
     const id = trailerUrl.split("youtu.be/")[1];
     embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1`;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>,
    document.body
  );
}
