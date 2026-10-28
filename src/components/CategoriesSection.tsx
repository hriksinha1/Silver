import React from 'react';
import Button from './Button';
import SafeImage from './SafeImage';
import { IMAGES } from '../data/images';
import { useCart } from '../context/CartContext';

interface CategoryItem {
  id: string;
  name: string;
  count: string;
  description: string;
  image: string;
  type: 'ring' | 'necklace' | 'bracelet' | 'earring';
  targetProductId: string;
  targetProductName: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-rings',
    name: 'Rings',
    count: '648 Products',
    description: 'Elegant designs for every occasion',
    image: IMAGES.catRings.src,
    type: 'ring',
    targetProductId: 'product-celeste-diamond-ring',
    targetProductName: 'Celeste Diamond Ring',
  },
  {
    id: 'cat-necklaces',
    name: 'Necklaces',
    count: '543 Products',
    description: 'Timeless pieces that elevate your style',
    image: IMAGES.catNecklaces.src,
    type: 'necklace',
    targetProductId: 'product-minimal-diamond-necklace',
    targetProductName: 'Minimal Diamond Necklace',
  },
  {
    id: 'cat-bracelets',
    name: 'Bracelets',
    count: '823 Products',
    description: 'Crafted to complement your every move',
    image: IMAGES.catBracelets.src,
    type: 'bracelet',
    targetProductId: 'product-solis-charm-bracelet',
    targetProductName: 'Solis Charm Bracelet',
  },
  {
    id: 'cat-earrings',
    name: 'Earrings',
    count: '1,321 Products',
    description: 'Subtle shine or bold statements',
    image: IMAGES.catEarrings.src,
    type: 'earring',
    targetProductId: 'product-floral-pattern-earring',
    targetProductName: 'Floral Pattern Earring',
  },
];

export function CategoriesSection() {
  const { highlightProduct } = useCart();

  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      className="w-full bg-[#EFEFEF] py-14 sm:py-20 px-5 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-[1280px]">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
          <h2
            id="categories-heading"
            tabIndex={-1}
            className="font-heading text-2xl sm:text-3xl lg:text-4xl font-normal text-[#26102C] tracking-tight focus:outline-none"
          >
            Shop by Category
          </h2>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              document.getElementById('best-sellers')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            View Collection
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <article
              key={cat.id}
              className="group flex flex-col justify-between bg-white p-5 sm:p-6 rounded-[2px] transition-transform duration-200 hover:-translate-y-0.5"
            >
              {/* Count chip */}
              <div className="flex items-center justify-start">
                <span className="inline-block rounded-[2px] bg-[#EFEFEF] px-2 py-0.5 text-[11px] font-medium text-[#4E4852] tabular-nums">
                  {cat.count}
                </span>
              </div>

              {/* Centered Product Cut-out */}
              <div className="my-4 flex aspect-square w-full items-center justify-center overflow-hidden p-3">
                <SafeImage
                  src={cat.image}
                  alt={`${cat.name} category`}
                  width={240}
                  height={240}
                  type={cat.type}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                />
              </div>

              {/* Information & Action */}
              <div>
                <h3 className="font-heading text-lg sm:text-xl font-medium text-[#26102C] tracking-tight">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-[#4E4852] line-clamp-1">{cat.description}</p>
                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => highlightProduct(cat.targetProductId, cat.targetProductName)}
                    aria-label={`See More ${cat.name} in Best Sellers`}
                  >
                    See More
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoriesSection;
