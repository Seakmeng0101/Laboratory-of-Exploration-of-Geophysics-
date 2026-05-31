
import { useState, useEffect } from 'react';
import mex1 from '../assets/mex1.jpg';
import mex2 from '../assets/mex2.webp';
import mex3 from '../assets/mex3.jpg';

interface CarouselProps {
  images: {
    src: string;
    alt: string;
  }[];
}

const Carousel = ({ images }: CarouselProps) => {
  const [current, setCurrent] = useState(0);

  // Auto slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  const prev = () => {
    setCurrent((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const next = () => {
    setCurrent((prev) =>
      (prev + 1) % images.length
    );
  };

  return (
    <div className="relative w-full bg-gray-900">
      {/* Slides */}
      <div className="relative h-80 overflow-hidden md:h-[600px]">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === current
                ? 'opacity-100 z-10'
                : 'opacity-0 z-0'
            }`}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Previous Button */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-0 top-0 z-30 flex h-full items-center px-4"
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/60">
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m15 19-7-7 7-7"
            />
          </svg>
        </span>
      </button>

      {/* Next Button */}
      <button
        type="button"
        onClick={next}
        className="absolute right-0 top-0 z-30 flex h-full items-center px-4"
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/60">
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m9 5 7 7-7 7"
            />
          </svg>
        </span>
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === current
                ? 'bg-white'
                : 'bg-white/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const IMAGES = [
  { src: mex1, alt: 'Mexican Food 1' },
  { src: mex2, alt: 'Mexican Food 2' },
  { src: mex3, alt: 'Mexican Food 3' },
];

const Home = () => {
  return (
    <div>
      <Carousel images={IMAGES} />
    </div>
  );
};

export default Home;

