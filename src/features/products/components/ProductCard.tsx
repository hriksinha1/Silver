import { buttonClasses } from '@/shared/ui/Button';
import ImageSlot from '@/shared/ui/ImageSlot';
import { WhatsAppButton, buildProductMessage } from '@/features/whatsapp';
import { useCart } from '@/features/cart/context/CartContext';
import { productPath, type Product } from '../data/products';
import PriceLabel from './PriceLabel';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const image = product.images[0];
  const canAddToCart = product.price !== null && !product.isPlaceholder;

  return (
    <article
      className="silver-card group flex h-full flex-col rounded-[2px] border border-border bg-surface-white p-4 transition-all duration-300 md:flex-row md:gap-6 lg:flex-col lg:gap-0 lg:p-5"
      data-reveal
    >
      <a
        href={productPath(product)}
        className="jewellery-image-stage relative block overflow-hidden rounded-[2px] border border-border/80 bg-surface-primary md:w-2/5 md:shrink-0 lg:w-full"
        aria-label={`${product.name} – view details`}
      >
        <ImageSlot
          src={image?.src}
          alt={image?.alt ?? `${product.name} – photograph coming soon`}
          width={image?.width ?? 4}
          height={image?.height ?? 5}
          ratio="4 / 5"
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
        />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-[2px] bg-brand-primary/90 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-surface-primary backdrop-blur-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-silver" aria-hidden="true" />
          925 Silver
        </div>
      </a>

      <div className="flex flex-1 flex-col pt-5 md:pt-0 lg:pt-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="type-h3 font-medium">
            <a
              href={productPath(product)}
              className="transition-colors hover:text-brand-primary hover:underline underline-offset-4 decoration-accent-silver"
            >
              {product.name}
            </a>
          </h3>
        </div>

        <PriceLabel price={product.price} className="type-body-lg mt-1.5 block font-semibold text-brand-primary" />

        <p className="type-body mt-2.5 text-text-secondary line-clamp-2">
          {product.shortDescription ?? (product.isPlaceholder ? 'Certified 925 sterling silver piece. Details and photographs updating soon.' : '')}
        </p>

        <div className="mt-auto flex flex-col gap-2.5 pt-6 sm:flex-row lg:flex-col xl:flex-row">
          {canAddToCart ? (
            <button
              type="button"
              onClick={() => addToCart(product, true)}
              className={buttonClasses('primary', 'md', 'flex-1')}
            >
              Add to bag
            </button>
          ) : (
            <a href={productPath(product)} className={buttonClasses('secondary', 'md', 'flex-1')}>
              View details
            </a>
          )}
          <WhatsAppButton
            message={buildProductMessage(product)}
            variant={canAddToCart ? 'secondary' : 'primary'}
            size="md"
            className="flex-1"
          >
            Enquire
          </WhatsAppButton>
        </div>
      </div>
    </article>
  );
}
