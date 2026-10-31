import Button, { buttonClasses } from '@/shared/ui/Button';
import { useCart } from '@/features/cart/context/CartContext';
import ImageSlot from '@/shared/ui/ImageSlot';
import { productPath, type Product } from '../data/products';
import PriceLabel from './PriceLabel';

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  const { addToCart } = useCart();

  return (
    <article className="flex h-full flex-col md:flex-row md:gap-8 lg:flex-col lg:gap-0" data-reveal>
      <a href={productPath(product)} className="block md:w-2/5 md:shrink-0 lg:w-full" aria-label={`${product.name} – view details`}>
        <ImageSlot
          src={image?.src}
          alt={image?.alt ?? `${product.name} – photograph coming soon`}
          width={image?.width ?? 6}
          height={image?.height ?? 5}
          ratio="6 / 5"
          sizes="(min-width: 1024px) 400px, (min-width: 768px) 40vw, 100vw"
          imgClassName="transition-transform duration-500 hover:scale-[1.03]"
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
        <p className="type-body mt-3 line-clamp-4 text-text-secondary">
          {product.shortDescription ?? (product.isPlaceholder ? 'Details coming soon.' : '')}
        </p>
        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row lg:flex-col xl:flex-row">
          <a href={productPath(product)} className={buttonClasses('secondary', 'md', 'flex-1')}>
            View Product
          </a>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            disabled={product.price === null}
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </article>
  );
}
