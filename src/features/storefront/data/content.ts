import { HandCraftIcon, HeartIcon, LayersIcon, ShieldIcon } from '@/shared/ui/icons';
import { IMAGES } from '@/shared/data/images';

export const REASONS = [
  {
    id: 'reason-materials',
    title: 'Premium Materials',
    description: 'Carefully selected metals and ethically sourced stones',
    icon: LayersIcon,
  },
  {
    id: 'reason-craft',
    title: 'Handcrafted Excellence',
    description: 'Designed with precision and attention to detail',
    icon: HandCraftIcon,
  },
  {
    id: 'reason-quality',
    title: 'Lifetime Quality',
    description: 'Jewellery made to last for generations to come',
    icon: HeartIcon,
  },
  {
    id: 'reason-secure',
    title: 'Secure Shopping',
    description: 'Safe payments and trusted white-glove delivery',
    icon: ShieldIcon,
  },
];

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  avatar: string;
}

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'test-1',
    quote: 'Absolutely love the craftsmanship and detail. The quality feels premium and looks stunning. I wear it every day with confidence.',
    author: 'Sophia M.',
    avatar: IMAGES.avatar1.src,
  },
  {
    id: 'test-2',
    quote: 'Such a luxurious feel at a great value. The shine and finish are truly eye-catching. Will definitely be buying again.',
    author: 'Emma L.',
    avatar: IMAGES.avatar2.src,
  },
  {
    id: 'test-3',
    quote: "Exceeded all my expectations in every way. The design is timeless and incredibly refined. I've received so many compliments already.",
    author: 'Olivia R.',
    avatar: IMAGES.avatar3.src,
  },
];

export interface FaqItem {
  id: string;
  number: string;
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    number: '01',
    question: 'Are your jewellery pieces made with real materials?',
    answer: 'Our pieces are crafted from premium metals and carefully selected stones. Each product page lists its exact materials. This is demonstration copy.',
  },
  {
    id: 'faq-2',
    number: '02',
    question: 'Do you offer a warranty on your products?',
    answer: 'Warranty terms vary by piece and are shown on each product page. This demo does not define real warranty terms.',
  },
  {
    id: 'faq-3',
    number: '03',
    question: 'How long does shipping take?',
    answer: 'Delivery times depend on your location and are shown at checkout. This demo does not process orders.',
  },
  {
    id: 'faq-4',
    number: '04',
    question: 'Can I return or exchange my order?',
    answer: 'Return and exchange options are explained in our policy. In this demo, no real orders exist.',
  },
  {
    id: 'faq-5',
    number: '05',
    question: 'Is your jewellery suitable for sensitive skin?',
    answer: 'Materials differ by piece, so please check each product\'s details. If you have known sensitivities, speak with a medical professional before wearing new jewellery.',
  },
];
