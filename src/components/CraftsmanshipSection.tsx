import React from 'react';
import Button from './Button';
import SafeImage from './SafeImage';
import { IMAGES } from '../data/images';

export function CraftsmanshipSection() {
  return (
    <section
      id="craftsmanship"
      aria-labelledby="craftsmanship-heading"
      className="w-full bg-[#EFEFEF] py-10 sm:py-16 px-5 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Left Large Craftsmanship Image */}
          <div className="relative overflow-hidden rounded-[2px] bg-white min-h-[340px] sm:min-h-[420px] lg:min-h-full">
            <SafeImage
              src={IMAGES.craft.src}
              alt={IMAGES.craft.alt}
              width={IMAGES.craft.width}
              height={IMAGES.craft.height}
              type="craft"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Right White Content Panel */}
          <div className="flex flex-col justify-center rounded-[2px] bg-white p-8 sm:p-12 lg:p-14">
            <h2
              id="craftsmanship-heading"
              tabIndex={-1}
              className="font-heading text-2xl sm:text-3xl lg:text-4xl font-normal text-[#26102C] tracking-tight focus:outline-none"
            >
              Timeless Craftsmanship
            </h2>

            <p className="mt-4 sm:mt-6 font-sans text-sm sm:text-base leading-relaxed text-[#4E4852]">
              Every piece we create is a reflection of artistry and precision. Our jewellery is crafted using carefully selected materials and designed to celebrate life's most meaningful moments. From concept to creation, we focus on delivering elegance that lasts.
            </p>

            <div className="mt-8 sm:mt-10">
              <span className="font-heading text-4xl sm:text-5xl font-light text-[#26102C] tracking-tight">
                10+
              </span>
              <p className="mt-1 font-sans text-xs sm:text-sm text-[#4E4852]">
                Years of experience
              </p>
            </div>

            <div className="mt-8 sm:mt-10">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  document.getElementById('why-aurelia')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                See More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CraftsmanshipSection;
