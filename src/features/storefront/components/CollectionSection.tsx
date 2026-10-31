import ProductCard from '@/features/products/components/ProductCard';
import { PRODUCTS } from '@/features/products/data/products';
import { COLLECTION } from '../data/content';

export default function CollectionSection() {
  return (
    <section id="collection" aria-labelledby="collection-heading" className="section-pad bg-surface-primary">
      <div className="page-container">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <h2 id="collection-heading" className="type-h2 text-balance">
            {COLLECTION.heading}
          </h2>
          <p className="type-body-lg mt-4 text-text-secondary">{COLLECTION.description}</p>
        </div>
        <div className="mt-12 grid gap-12 md:mt-16 md:gap-14 lg:grid-cols-3 lg:gap-8">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
