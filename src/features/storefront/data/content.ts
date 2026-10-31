/**
 * Editable storefront copy. Only statements that are true of the site as built
 * (or deliberately neutral) belong here — no invented policies, claims or metrics.
 */
export const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Collection', href: '#collection' },
  { label: 'Our Story', href: '#story' },
  { label: 'Gifting', href: '#gifting' },
  { label: 'Contact', href: '#contact' },
] as const;

export const ANNOUNCEMENT = 'Discover thoughtfully selected silver pieces.';

export const HERO = {
  eyebrow: 'Timeless craft. Lasting meaning.',
  heading: 'A little silver. A lifetime of meaning.',
  description:
    'Discover our thoughtfully curated silver collection, created for moments worth remembering.',
  /** Replace with a real photograph path (e.g. /images/hero.jpg) when available. */
  image: null as null | { src: string; width: number; height: number; alt: string },
};

export const COLLECTION = {
  heading: 'Three Pieces. Endless Meaning.',
  description: 'A carefully curated selection of silver treasures.',
};

export const STORY = {
  heading: 'Made to be treasured.',
  description:
    'Every detail matters. Discover the craftsmanship, material and story behind each silver piece.',
  image: null as null | { src: string; width: number; height: number; alt: string },
};

export const GIFTING = {
  heading: 'A gift beyond occasions.',
  description: 'For weddings, anniversaries, celebrations and the people who matter.',
  image: null as null | { src: string; width: number; height: number; alt: string },
};

export const TRUST_ITEMS = [
  {
    id: 'authenticity',
    title: 'Authenticity',
    description: 'Clear product material and purity details.',
  },
  {
    id: 'transparency',
    title: 'Product transparency',
    description: 'Honest and accessible product specifications.',
  },
  {
    id: 'assistance',
    title: 'Personal assistance',
    description: 'Direct customer communication through WhatsApp.',
  },
  {
    id: 'delivery',
    title: 'Careful delivery',
    description: 'Clear and accurate delivery information.',
  },
] as const;

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/** Answers below stay neutral until the store supplies verified policies. */
export const FAQS: FaqItem[] = [
  {
    id: 'faq-material',
    question: 'What material is each product made from?',
    answer:
      'Each product page lists its material and purity once verified details are added. If a detail is not shown, please ask us on WhatsApp before you buy.',
  },
  {
    id: 'faq-purity',
    question: 'How can I verify silver purity?',
    answer:
      'Ask us for the purity details of the piece you are considering. You can also have any silver item tested by an independent jeweller or assay centre.',
  },
  {
    id: 'faq-order',
    question: 'How do I place an order?',
    answer:
      'Message us on WhatsApp from any product page or from your bag. Your order is confirmed only when Silveram confirms it with you, including availability, delivery and payment details. Online checkout is not available yet.',
  },
  {
    id: 'faq-gifting',
    question: 'Do you offer gift packaging?',
    answer: 'Please ask us on WhatsApp about gift packaging for the piece you are interested in.',
  },
  {
    id: 'faq-delivery',
    question: 'What are the delivery timelines?',
    answer:
      'Delivery timelines depend on your location. We will confirm them with you on WhatsApp before you place an order.',
  },
  {
    id: 'faq-returns',
    question: 'What is the return or exchange policy?',
    answer:
      'Our return and exchange policy is being finalised. Please confirm the terms with us on WhatsApp before ordering.',
  },
  {
    id: 'faq-contact',
    question: 'How can I contact the store?',
    answer: 'The quickest way is WhatsApp. Our contact details are listed at the bottom of this page.',
  },
];
