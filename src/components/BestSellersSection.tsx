import React from 'react';
import Button from './Button';
import SafeImage from './SafeImage';
import { PlusIcon } from './icons';
import { IMAGES } from '../data/images';
import { useCart } from '../context/CartContext';

interface ProductItem {
  id: string;
  name: string;
  price: number;
  image: string;
  type: 'ring' | 'necklace' | 'earring' | 'bracelet';
}

const PRODUCTS: ProductItem[] = [
  {
    id: 'product-celeste-diamond-ring',
    name: 'Celeste Diamond Ring',
    price: 249,
    image: IMAGES.productRing.src,
    type: 'ring',
  },
  {
    id: 'product-minimal-diamond-necklace',
    name: 'Minimal Diamond Necklace',
    price: 199,
    image: IMAGES.productNecklace.src,
    type: 'necklace',
  },
  {
    id: 'product-floral-pattern-earring',
    name: 'Floral Pattern Earring',
    price: 149,
    image: IMAGES.productEarring.src,
    type: 'earring',
  },
  {
    id: 'product-solis-charm-bracelet',
    name: 'Solis Charm Bracelet',
    price: 189,
    image: IMAGES.productBracelet.src,
    type: 'bracelet',
  },
];

export function BestSellersSection() {
  const { addToCart, highlightedProductId } = useCart();

  return (
    <section
      id="best-sellers"
      aria-labelledby="best-sellers-heading"
      className="w-full bg-[#EFEFEF] py-12 sm:py-18 px-5 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-[1280px]">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
          <h2
            id="best-sellers-heading"
            tabIndex={-1}
            className="font-heading text-2xl sm:text-3xl lg:text-4xl font-normal text-[#26102C] tracking-tight focus:outline-none"
          >
            Best Sellers
          </h2>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            View Collection
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {PRODUCTS.map((prod) => {
            const isHighlighted = highlightedProductId === prod.id;

            return (
              <article
                key={prod.id}
                id={prod.id}
                tabIndex={-1}
                className={`group flex flex-col overflow-hidden bg-white rounded-[2px] transition-all duration-300 ${
                  isHighlighted
                    ? 'ring-4 ring-[#69388F] shadow-lg scale-[1.01]'
                    : 'hover:-translate-y-0.5'
                }`}
              >
                {/* Full-bleed square photo */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#E2DEE5]">
                  <SafeImage
                    src={prod.image}
                    alt={prod.name}
                    width={386}
                    height={386}
                    type={prod.type}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>

                {/* White info strip */}
                <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                  <h3 className="font-heading text-base sm:text-lg font-medium text-[#26102C] tracking-tight min-h-[2.5rem] flex items-center">
                    {prod.name}
                  </h3>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-sans text-sm sm:text-base font-semibold tabular-nums text-[#26102C]">
                      ${prod.price}
                    </span>

                    <button
                      onClick={() =>
                        addToCart({
                          id: prod.id,
                          name: prod.name,
                          price: prod.price,
                          image: prod.image,
                        })
                      }
                      className="flex h-8 w-8 min-w-[32px] min-h-[32px] items-center justify-center rounded-[2px] bg-[#69388F] text-white transition-colors hover:bg-[#7B43A6] active:bg-[#572E77]"
                      aria-label={`Add ${prod.name} to cart`}
                    >
                      <PlusIcon size={14} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BestSellersSection;
