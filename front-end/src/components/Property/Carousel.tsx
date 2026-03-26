import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";
const Carousel = ({
  children: slides,
  autoSlide = false,
  autoSlideInterval = 4000,
}) => {
  const [curr, setCurr] = useState(0);
  const prev = () =>
    setCurr((curr) => (curr === 0 ? slides.length - 1 : curr - 1));
  const next = () =>
    setCurr((curr) => (curr === slides.length - 1 ? 0 : curr + 1));
  useEffect(() => {
    if (!autoSlide) return;
    const slideInterval = setInterval(next, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, [next, autoSlide, autoSlideInterval]);
  return (
    <div className="relative group w-full h-full">
      <div className="w-full h-full relative overflow-hidden">
        <div
          className="flex h-full transition-transform ease-out duration-500"
          style={{ transform: `translateX(-${curr * 100}%)` }}
        >
          {slides.map((slide: any, index: number) => (
            <div
              key={index}
              className="relative w-full h-full flex-shrink-0"
            >
              {slide}
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={prev}
            className="p-1 rounded-full  text-white hover:bg-black/50"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={next}
            className="p-1 rounded-full text-white hover:bg-black/50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      {slides.length > 1 ? (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 bg-gray-400 p-1 rounded-2xl mt-2">
          <div className="flex items-center justify-center gap-2">
            {slides.map((_: any, index: number) => (
              <div
                key={index}
                className={`transition-all rounded-full ${
                  curr === index
                    ? "w-2 h-2 bg-white shadow-md"
                    : "w-1 h-1 bg-white/60"
                }`}
              ></div>
            ))}
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Carousel;
