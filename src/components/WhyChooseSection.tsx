import React from 'react';
import SafeImage from './SafeImage';
import { LayersIcon, HandCraftIcon, HeartIcon, ShieldIcon } from './icons';
import { IMAGES } from '../data/images';

const REASONS = [
  {
    id: 'reason-materials',
    title: 'Premium Materials',
    description: 'Carefully selected metals and ethically sourced stones',
    icon: LayersIcon,
  },
  {
    id: 'reason-craft',
    title: 'Handcrafted Excellence',
    description: 'Designed with precision and attention to detail',
    icon: HandCraftIcon,
  },
  {
    id: 'reason-quality',
    title: 'Lifetime Quality',
    description: 'Jewellery made to last for generations to come',
    icon: HeartIcon,
  },
  {
    id: 'reason-secure',
    title: 'Secure Shopping',
    description: 'Safe payments and trusted white-glove delivery',
    icon: ShieldIcon,
  },
];

export function WhyChooseSection() {
  return (
    <section
      id="why-aurelia"
      aria-labelledby="why-aurelia-heading"
      className="w-full bg-[#EFEFEF] py-14 sm:py-20 px-5 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-[1280px]">
        {/* Centered Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <h2
            id="why-aurelia-heading"
            tabIndex={-1}
            className="font-heading text-2xl sm:text-3xl lg:text-4xl font-normal text-[#26102C] tracking-tight focus:outline-none"
          >
            Why Choose Aurelia
          </h2>
        </div>

        {/* 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Left Column: 4 White Benefit Rows */}
          <div className="flex flex-col justify-between gap-3 sm:gap-4 h-full">
            {REASONS.map((item) => {
              const IconComponent = item.icon;

              return (
                <div
                  key={item.id}
                  className="flex flex-1 items-center gap-4 sm:gap-5 rounded-[2px] bg-white p-5 sm:p-6 transition-transform duration-200 hover:translate-x-1"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[2px] bg-[#FAF8FB] text-[#69388F]">
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base sm:text-lg font-medium text-[#26102C]">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-xs sm:text-sm text-[#4E4852]">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Editorial Portrait Image */}
          <div className="relative overflow-hidden rounded-[2px] bg-white aspect-square max-h-[560px] w-full">
            <SafeImage
              src={IMAGES.whyPortrait.src}
              alt={IMAGES.whyPortrait.alt}
              width={IMAGES.whyPortrait.width}
              height={IMAGES.whyPortrait.height}
              type="portrait"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseSection;
