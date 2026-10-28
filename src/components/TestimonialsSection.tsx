import React, { useRef } from 'react';
import { QuoteIcon } from './icons';
import SafeImage from './SafeImage';
import { IMAGES } from '../data/images';

// Sample demonstration testimonials (not fabricated metrics)
interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  avatar: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'test-1',
    quote: 'Absolutely love the craftsmanship and detail. The quality feels premium and looks stunning. I wear it every day with confidence.',
    author: 'Sophia M.',
    avatar: IMAGES.avatar1.src,
  },
  {
    id: 'test-2',
    quote: 'Such a luxurious feel at a great value. The shine and finish are truly eye-catching. Will definitely be buying again.',
    author: 'Emma L.',
    avatar: IMAGES.avatar2.src,
  },
  {
    id: 'test-3',
    quote: "Exceeded all my expectations in every way. The design is timeless and incredibly refined. I've received so many compliments already.",
    author: 'Olivia R.',
    avatar: IMAGES.avatar3.src,
  },
];

export function TestimonialsSection() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 300;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="w-full bg-white py-16 sm:py-24 px-5 sm:px-8 lg:px-8"
    >
      <div className="mx-auto max-w-[1600px]">
        {/* Centered Heading */}
        <div className="text-center mb-10 sm:mb-16">
          <h2
            id="testimonials-heading"
            tabIndex={-1}
            className="font-heading text-2xl sm:text-3xl lg:text-4xl font-normal text-[#26102C] tracking-tight focus:outline-none"
          >
            Loved by Our Customers
          </h2>
        </div>

        {/* Desktop 3-column / Mobile scroll-snap carousel */}
        <div className="relative">
          <div
            ref={carouselRef}
            className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 snap-x snap-mandatory focus:outline-none"
            tabIndex={0}
            role="region"
            aria-label="Customer testimonials"
          >
            {TESTIMONIALS.map((item) => (
              <article
                key={item.id}
                className="flex flex-col justify-between items-center text-center rounded-[2px] bg-[#EFEFEF] p-8 sm:p-10 shrink-0 w-[85%] sm:w-[75%] md:w-auto snap-center"
              >
                {/* Outlined purple quote icon */}
                <div className="mb-6 flex items-center justify-center text-[#69388F]">
                  <QuoteIcon size={34} />
                </div>

                {/* Review Text */}
                <blockquote className="flex-1 font-sans text-base sm:text-[17px] leading-relaxed text-[#26102C]">
                  "{item.quote}"
                </blockquote>

                {/* Centered Round Avatar and Author */}
                <footer className="mt-8 flex flex-col items-center">
                  <div className="h-14 w-14 overflow-hidden rounded-full border border-[#DCD7DF] bg-[#FAF8FB]">
                    <SafeImage
                      src={item.avatar}
                      alt={item.author}
                      width={56}
                      height={56}
                      type="portrait"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <cite className="mt-3 block font-heading text-sm sm:text-base font-medium not-italic text-[#26102C]">
                    {item.author}
                  </cite>
                </footer>
              </article>
            ))}
          </div>

          {/* Mobile Previous / Next Navigation Controls */}
          <div className="flex md:hidden justify-center items-center gap-3 mt-4">
            <button
              onClick={() => scrollCarousel('left')}
              className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-[#DCD7DF] bg-white text-[#26102C] hover:bg-[#F5F2F7]"
              aria-label="Previous testimonial"
            >
              <span aria-hidden="true">&larr;</span>
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-[#DCD7DF] bg-white text-[#26102C] hover:bg-[#F5F2F7]"
              aria-label="Next testimonial"
            >
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
