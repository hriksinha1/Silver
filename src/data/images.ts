export interface ImageManifestItem {
  src: string;
  width: number;
  height: number;
  alt: string;
  type?: 'ring' | 'necklace' | 'bracelet' | 'earring' | 'portrait' | 'box' | 'craft';
}

export const IMAGES: Record<string, ImageManifestItem> = {
  heroModel: {
    src: '/images/hero-model.webp',
    width: 620,
    height: 760,
    alt: 'Smiling woman wearing lavender shirt holding a fine gold chain necklace',
    type: 'portrait',
  },
  heroRingBox: {
    src: '/images/hero-ring-box.webp',
    width: 260,
    height: 260,
    alt: 'White open ring box showcasing the Gold Statement Ring',
    type: 'box',
  },
  catRings: {
    src: '/images/cat-rings.webp',
    width: 280,
    height: 280,
    alt: 'Gold diamond band ring',
    type: 'ring',
  },
  catNecklaces: {
    src: '/images/cat-necklaces.webp',
    width: 280,
    height: 280,
    alt: 'Gold floral cluster pendant necklace',
    type: 'necklace',
  },
  catBracelets: {
    src: '/images/cat-bracelets.webp',
    width: 340,
    height: 280,
    alt: 'Layered gold cuff and charm bracelets',
    type: 'bracelet',
  },
  catEarrings: {
    src: '/images/cat-earrings.webp',
    width: 280,
    height: 280,
    alt: 'Polished gold hoop earrings',
    type: 'earring',
  },
  craft: {
    src: '/images/craft.webp',
    width: 790,
    height: 615,
    alt: 'Artisanal gold and pearl earring resting on textured beige ceramic surface',
    type: 'craft',
  },
  productRing: {
    src: '/images/product-ring.webp',
    width: 386,
    height: 386,
    alt: 'Celeste Diamond Ring worn on hand with bridal veil backdrop',
    type: 'ring',
  },
  productNecklace: {
    src: '/images/product-necklace.webp',
    width: 386,
    height: 386,
    alt: 'Minimal Diamond Necklace resting on collarbone with sage green garment',
    type: 'necklace',
  },
  productEarring: {
    src: '/images/product-earring.webp',
    width: 386,
    height: 386,
    alt: 'Floral Pattern Earring with colorful handcrafted enamel inlay',
    type: 'earring',
  },
  productBracelet: {
    src: '/images/product-bracelet.webp',
    width: 386,
    height: 386,
    alt: 'Solis Charm Bracelet in chunky gold links worn on wrist',
    type: 'bracelet',
  },
  whyPortrait: {
    src: '/images/why-portrait.webp',
    width: 790,
    height: 740,
    alt: 'Editorial portrait of woman wearing Aurelia statement earrings and bracelet',
    type: 'portrait',
  },
  avatar1: {
    src: '/images/avatar-1.webp',
    width: 96,
    height: 96,
    alt: 'Sophia M.',
    type: 'portrait',
  },
  avatar2: {
    src: '/images/avatar-2.webp',
    width: 96,
    height: 96,
    alt: 'Emma L.',
    type: 'portrait',
  },
  avatar3: {
    src: '/images/avatar-3.webp',
    width: 96,
    height: 96,
    alt: 'Olivia R.',
    type: 'portrait',
  },
};

export default IMAGES;
