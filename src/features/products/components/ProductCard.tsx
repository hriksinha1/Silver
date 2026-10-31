import { buttonClasses } from '@/shared/ui/Button';
import ImageSlot from '@/shared/ui/ImageSlot';
import { WhatsAppButton, buildProductMessage } from '@/features/whatsapp';
import { productPath, type Product } from '../data/products';
import PriceLabel from './PriceLabel';

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];

  return (
    <article className="flex h-full flex-col md:flex-row md:gap-8 lg:flex-col lg:gap-0" data-reveal>
      <a href={productPath(product)} className="block md:w-2/5 md:shrink-0 lg:w-full" aria-label={`${product.name} – view details`}>
        <ImageSlot
          src={image?.src}
          alt={image?.alt ?? `${product.name} – photograph coming soon`}
          width={image?.width ?? 4}
          height={image?.height ?? 5}
          ratio="4 / 5"
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="border border-border"
        />
      </a>
      <div className="flex flex-1 flex-col pt-5 md:pt-0 lg:pt-5">
        <h3 className="type-h3">
          <a href={productPath(product)} className="hover:underline underline-offset-4 decoration-accent-silver">
            {product.name}
          </a>
        </h3>
        <PriceLabel price={product.price} className="type-body-lg mt-1 block font-medium" />
        <p className="type-body mt-3 text-text-secondary">
          {product.shortDescription ?? (product.isPlaceholder ? 'Details coming soon.' : '')}
        </p>
        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row lg:flex-col xl:flex-row">
          <a href={productPath(product)} className={buttonClasses('secondary', 'md', 'flex-1')}>
            View details
          </a>
          <WhatsAppButton
            message={buildProductMessage(product)}
            variant="primary"
            className="flex-1"
          >
            Enquire
          </WhatsAppButton>
        </div>
      </div>
    </article>
  );
}
