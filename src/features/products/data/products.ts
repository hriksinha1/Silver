/**
 * THE product catalogue for the storefront — the one file to edit.
 *
 * Launch catalogue = exactly three records. Everything below is a PLACEHOLDER
 * until real details are supplied. See "Replacing the placeholder products"
 * in README.md for the full workflow (images, price, server seed).
 *
 * Rules:
 *  - `price` is in rupees (whole number). `null` means "price on request" and
 *    the product cannot be added to the bag until a price is set.
 *  - Optional fields (material, purity, weight …) are only rendered when set.
 *    Never enter a value you have not verified.
 *  - `images` are served from /public/images/products/… (or any https URL).
 *    With no images the UI shows a neutral "photograph coming soon" panel.
 *  - Set `isPlaceholder: false` once the record holds real information.
 *  - Keep `id` identical to the `_id` of the matching record on the server
 *    (server/src/scripts/seed-catalog.js) so cart items match orders.
 */

export interface ProductImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  isPlaceholder: boolean;
  /** Rupees, whole number. null = not yet priced. */
  price: number | null;
  shortDescription?: string;
  description?: string;
  images: ProductImage[];
  material?: string;
  /** e.g. the purity marking you have verified. */
  purity?: string;
  weight?: string;
  dimensions?: string;
  /** Available sizes / variants, if any. */
  sizes?: string[];
  care?: string[];
  deliveryInfo?: string;
  returnInfo?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'product-1',
    slug: 'piece-one',
    name: 'Piece One',
    isPlaceholder: true,
    price: null,
    images: [],
  },
  {
    id: 'product-2',
    slug: 'piece-two',
    name: 'Piece Two',
    isPlaceholder: true,
    price: null,
    images: [],
  },
  {
    id: 'product-3',
    slug: 'piece-three',
    name: 'Piece Three',
    isPlaceholder: true,
    price: null,
    images: [],
  },
];

export const getProductBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find((product) => product.slug === slug);

export const getProductById = (id: string): Product | undefined =>
  PRODUCTS.find((product) => product.id === id);

export const productPath = (product: Pick<Product, 'slug'>): string => `#/product/${product.slug}`;
