import { TRUST_ITEMS } from '../data/content';

export default function TrustSection() {
  return (
    <section aria-labelledby="trust-heading" className="section-pad bg-surface-primary">
      <div className="page-container">
        <div className="mx-auto mb-12 max-w-2xl text-center" data-reveal>
          <p className="type-eyebrow text-text-muted">Why Silveram</p>
          <h2 id="trust-heading" className="type-h2 mt-4 text-balance">
            Why choose Silveram
          </h2>
        </div>
        <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map((item, index) => (
            <li key={item.id} className="border-t border-accent-silver pt-5" data-reveal>
              <span className="type-caption font-semibold tracking-[0.2em] text-text-muted">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="type-body-lg mt-3 font-medium">{item.title}</h3>
              <p className="type-body mt-2 text-text-secondary">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
