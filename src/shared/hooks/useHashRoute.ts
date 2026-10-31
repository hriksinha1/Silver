import { useEffect, useState } from 'react';

export type Route = { name: 'home' } | { name: 'product'; slug: string };

const PRODUCT_PREFIX = '#/product/';

export function parseRoute(hash: string): Route {
  if (hash.startsWith(PRODUCT_PREFIX)) {
    const slug = decodeURIComponent(hash.slice(PRODUCT_PREFIX.length)).replace(/[^a-z0-9-]/gi, '');
    if (slug) return { name: 'product', slug };
  }
  return { name: 'home' };
}

/**
 * Minimal hash router (no dependency, no server rewrites needed on Vercel).
 *   #/product/<slug>  → product page
 *   anything else     → home; "#collection" etc. are in-page section anchors
 */
export function useHashRoute(): Route {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return parseRoute(hash);
}
