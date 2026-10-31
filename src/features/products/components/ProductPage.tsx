import { useEffect } from 'react';
import Button, { buttonClasses } from '@/shared/ui/Button';
import { ArrowLeftIcon } from '@/shared/ui/icons';
import { useCart } from '@/features/cart/context/CartContext';
import { WhatsAppButton, buildProductMessage } from '@/features/whatsapp';
import { SITE } from '@/shared/config/site';
import { setPageMeta, setStructuredData } from '@/shared/lib/seo';
import type { PolicyId } from '@/features/policies/data/policies';
import { PRODUCTS, getProductBySlug, productPath, type Product } from '../data/products';
import ProductGallery from './ProductGallery';
import PriceLabel from './PriceLabel';

interface ProductPageProps {
  slug: string;
  onOpenPolicy: (id: PolicyId) => void;
}

function specRows(product: Product): Array<[string, string]> {
  const rows: Array<[string, string | undefined]> = [
    ['Material', product.material],
    ['Silver purity', product.purity],
    ['Weight', product.weight],
    ['Dimensions', product.dimensions],
    ['Available sizes', product.sizes?.length ? product.sizes.join(', ') : undefined],
  ];
  return rows.filter((row): row is [string, string] => Boolean(row[1]));
}

/** Product schema is emitted only for real (non-placeholder) products with a price. */
function productJsonLd(product: Product) {
  if (product.isPlaceholder || product.price === null) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(product.description && { description: product.description }),
    ...(product.images.length > 0 && {
      image: product.images.map((image) => new URL(image.src, SITE.url).toString()),
    }),
    ...(product.material && { material: product.material }),
    brand: { '@type': 'Brand', name: SITE.name },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      url: `${SITE.url}/${productPath(product)}`,
    },
  };
}

export default function ProductPage({ slug, onOpenPolicy }: ProductPageProps) {
  const product = getProductBySlug(slug);
  const { addToCart } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!product) {
      setPageMeta({ title: `Piece not found | ${SITE.name}`, description: 'This piece could not be found.' });
      return;
    }
    setPageMeta({
      title: `${product.name} | ${SITE.name}`,
      description:
        product.shortDescription ??
        product.description?.slice(0, 155) ??
        `${product.name} from the ${SITE.name} silver collection.`,
      path: productPath(product),
    });
    setStructuredData(productJsonLd(product));
    return () => setStructuredData(null);
  }, [product]);

  if (!product) {
    return (
      <main id="main-content" tabIndex={-1} className="page-container section-pad focus:outline-none">
        <h1 className="type-h1">We couldn’t find that piece.</h1>
        <a href="#collection" className={buttonClasses('primary', 'lg', 'mt-8')}>
          View the collection
        </a>
      </main>
    );
  }

  const specs = specRows(product);
  const others = PRODUCTS.filter((item) => item.id !== product.id);
  const canBuy = product.price !== null;

  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      <div className="page-container pb-16 pt-6 md:pb-24 md:pt-10">
        <a
          href="#collection"
          className="type-caption mb-6 inline-flex min-h-11 items-center gap-2 text-text-secondary hover:text-text-primary"
        >
          <ArrowLeftIcon size={16} /> Back to the collection
        </a>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery product={product} />

          <div className="lg:pt-4">
            <p className="type-eyebrow text-text-muted">Silveram</p>
            <h1 className="type-h1 mt-3">{product.name}</h1>
            <PriceLabel price={product.price} className="type-h3 mt-4 block" />

            {product.shortDescription && (
              <p className="type-body-lg mt-5 text-text-secondary">{product.shortDescription}</p>
            )}
            {product.description && <p className="type-body mt-4 text-text-secondary">{product.description}</p>}
            {product.isPlaceholder && (
              <p className="type-body mt-5 border-l-2 border-accent-silver pl-4 text-text-secondary">
                Full details, photography and pricing for this piece are coming soon. Message us on WhatsApp
                and we will share what you would like to know.
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <WhatsAppButton message={buildProductMessage(product)} size="lg" className="w-full">
                Enquire on WhatsApp
              </WhatsAppButton>
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                disabled={!canBuy}
                onClick={() => addToCart(product, true)}
              >
                Add to bag
              </Button>
              {!canBuy && (
                <p className="type-caption text-text-muted">
                  Adding to the bag is available once a price is set. Please enquire on WhatsApp.
                </p>
              )}
              <p className="type-caption text-text-muted">
                An enquiry is not an order. Your order is confirmed only when Silveram confirms it with you.
              </p>
            </div>

            {specs.length > 0 && (
              <dl className="mt-10 divide-y divide-border border-y border-border">
                {specs.map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[9rem_1fr] gap-4 py-3">
                    <dt className="type-caption uppercase tracking-[0.12em] text-text-muted">{label}</dt>
                    <dd className="type-body">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-8 divide-y divide-border border-y border-border">
              {product.care && product.care.length > 0 && (
                <details className="group py-4">
                  <summary className="type-body cursor-pointer list-none font-medium">Care instructions</summary>
                  <ul className="type-body mt-3 list-disc space-y-1 pl-5 text-text-secondary">
                    {product.care.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </details>
              )}
              <details className="group py-4">
                <summary className="type-body cursor-pointer list-none font-medium">Delivery</summary>
                <p className="type-body mt-3 text-text-secondary">
                  {product.deliveryInfo ??
                    'We confirm delivery timelines and charges for your location on WhatsApp before you order.'}{' '}
                  <button type="button" className="underline underline-offset-4" onClick={() => onOpenPolicy('shipping')}>
                    Shipping policy
                  </button>
                </p>
              </details>
              <details className="group py-4">
                <summary className="type-body cursor-pointer list-none font-medium">Returns &amp; exchanges</summary>
                <p className="type-body mt-3 text-text-secondary">
                  {product.returnInfo ?? 'Please confirm return and exchange terms with us before ordering.'}{' '}
                  <button type="button" className="underline underline-offset-4" onClick={() => onOpenPolicy('returns')}>
                    Return policy
                  </button>
                </p>
              </details>
            </div>
          </div>
        </div>

        <section aria-labelledby="more-heading" className="mt-20 border-t border-border pt-10">
          <h2 id="more-heading" className="type-h3">
            More from the collection
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
            {others.map((item) => (
              <li key={item.id}>
                <a
                  href={productPath(item)}
                  className="type-body-lg inline-flex min-h-11 items-center underline underline-offset-4 decoration-accent-silver hover:decoration-brand-primary"
                >
                  {item.name}
                </a>
              </li>
            ))}
            <li>
              <a href="#collection" className="type-body-lg inline-flex min-h-11 items-center underline underline-offset-4 decoration-accent-silver hover:decoration-brand-primary">
                View all three pieces
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
