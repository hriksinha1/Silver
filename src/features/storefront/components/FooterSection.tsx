import { InstagramIcon, WhatsAppIcon } from '@/shared/ui/icons';
import { SITE } from '@/shared/config/site';
import { PRODUCTS, productPath } from '@/features/products/data/products';
import { buildGeneralMessage, buildWhatsAppUrl } from '@/features/whatsapp';
import { POLICIES, type PolicyId } from '@/features/policies/data/policies';

interface FooterSectionProps {
  onOpenPolicy: (id: PolicyId) => void;
}

const linkClass =
  'type-body inline-flex min-h-11 items-center text-surface-primary/80 underline-offset-4 hover:text-surface-primary hover:underline';

export default function FooterSection({ onOpenPolicy }: FooterSectionProps) {
  const whatsappUrl = buildWhatsAppUrl(buildGeneralMessage());
  const hasContact = Boolean(whatsappUrl || SITE.instagramUrl || SITE.contactEmail);

  return (
    <footer id="contact" className="on-navy bg-brand-primary text-surface-primary">
      <div className="page-container section-pad grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-xl font-semibold uppercase tracking-[0.3em]">Silveram</p>
          <p className="type-body mt-4 max-w-sm text-surface-primary/80">
            Silver gifting and jewellery, thoughtfully selected for the moments that matter.
          </p>
        </div>

        <nav aria-label="Collection">
          <h2 className="type-eyebrow text-accent-silver">Collection</h2>
          <ul className="mt-3">
            {PRODUCTS.map((product) => (
              <li key={product.id}>
                <a href={productPath(product)} className={linkClass}>
                  {product.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company and policies">
          <h2 className="type-eyebrow text-accent-silver">Silveram</h2>
          <ul className="mt-3">
            <li><a href="#story" className={linkClass}>About us</a></li>
            <li><a href="#gifting" className={linkClass}>Gifting</a></li>
            <li><a href="#faq" className={linkClass}>FAQ</a></li>
            {(Object.keys(POLICIES) as PolicyId[]).map((id) => (
              <li key={id}>
                <button type="button" onClick={() => onOpenPolicy(id)} className={`${linkClass} cursor-pointer`}>
                  {POLICIES[id].title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="type-eyebrow text-accent-silver">Contact</h2>
          <ul className="mt-3">
            {whatsappUrl && (
              <li>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={`${linkClass} gap-2`}>
                  <WhatsAppIcon size={18} /> WhatsApp
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            )}
            {SITE.instagramUrl && (
              <li>
                <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className={`${linkClass} gap-2`}>
                  <InstagramIcon size={18} /> Instagram
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            )}
            {SITE.contactEmail && (
              <li>
                <a href={`mailto:${SITE.contactEmail}`} className={linkClass}>
                  {SITE.contactEmail}
                </a>
              </li>
            )}
          </ul>
          {!hasContact && (
            <p className="type-body mt-3 text-surface-primary/80">Contact details coming soon.</p>
          )}
        </div>
      </div>
      <div className="border-t border-accent-silver/30">
        <p className="type-caption page-container py-5 text-surface-primary/70">
          © {new Date().getFullYear()} Silveram. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
