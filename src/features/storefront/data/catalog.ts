import { IMAGES } from '@/shared/data/images';

export interface CategoryItem {
  id: string;
  name: string;
  count: string;
  description: string;
  image: string;
  type: 'ring' | 'necklace' | 'bracelet' | 'earring';
  targetProductId: string;
  targetProductName: string;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-rings',
    name: 'Rings',
    count: '648 Products',
    description: 'Elegant designs for every occasion',
    image: IMAGES.catRings.src,
    type: 'ring',
    targetProductId: 'product-celeste-diamond-ring',
    targetProductName: 'Celeste Diamond Ring',
  },
  {
    id: 'cat-necklaces',
    name: 'Necklaces',
    count: '543 Products',
    description: 'Timeless pieces that elevate your style',
    image: IMAGES.catNecklaces.src,
    type: 'necklace',
    targetProductId: 'product-minimal-diamond-necklace',
    targetProductName: 'Minimal Diamond Necklace',
  },
  {
    id: 'cat-bracelets',
    name: 'Bracelets',
    count: '823 Products',
    description: 'Crafted to complement your every move',
    image: IMAGES.catBracelets.src,
    type: 'bracelet',
    targetProductId: 'product-solis-charm-bracelet',
    targetProductName: 'Solis Charm Bracelet',
  },
  {
    id: 'cat-earrings',
    name: 'Earrings',
    count: '1,321 Products',
    description: 'Subtle shine or bold statements',
    image: IMAGES.catEarrings.src,
    type: 'earring',
    targetProductId: 'product-floral-pattern-earring',
    targetProductName: 'Floral Pattern Earring',
  },
];

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  image: string;
  imageFileId: string;
  type: 'ring' | 'necklace' | 'earring' | 'bracelet';
}

export const PRODUCTS: ProductItem[] = [
  {
    id: 'product-celeste-diamond-ring',
    name: 'Celeste Diamond Ring',
    price: 24900,
    image: IMAGES.productRing.src,
    imageFileId: 'product-ring',
    type: 'ring',
  },
  {
    id: 'product-minimal-diamond-necklace',
    name: 'Minimal Diamond Necklace',
    price: 19900,
    image: IMAGES.productNecklace.src,
    imageFileId: 'product-necklace',
    type: 'necklace',
  },
  {
    id: 'product-floral-pattern-earring',
    name: 'Floral Pattern Earring',
    price: 14900,
    image: IMAGES.productEarring.src,
    imageFileId: 'product-earring',
    type: 'earring',
  },
  {
    id: 'product-solis-charm-bracelet',
    name: 'Solis Charm Bracelet',
    price: 18900,
    image: IMAGES.productBracelet.src,
    imageFileId: 'product-bracelet',
    type: 'bracelet',
  },
  {
    id: 'gold-statement-ring',
    name: 'Gold Statement Ring',
    price: 29900,
    image: IMAGES.heroRingBox.src,
    imageFileId: 'product-gold-statement-ring',
    type: 'ring',
  },
];
