import { formatINR } from '@/shared/lib/money';

export default function PriceLabel({ price, className = '' }: { price: number | null; className?: string }) {
  return price === null ? (
    <span className={`text-text-muted ${className}`}>Price on request</span>
  ) : (
    <span className={`tabular-nums ${className}`}>{formatINR(price)}</span>
  );
}
