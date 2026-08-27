import { type ReactNode } from "react";
export default function Badge({ children, variant = 'green', className = '' }: { children: ReactNode; variant?: 'green' | 'orange' | 'red' | 'gray' | 'blue'; className?: string }) {
  const variants = {
    green: 'bg-green/10 text-green border-green/20',
    orange: 'bg-orange/10 text-orange border-orange/20',
    red: 'bg-red/10 text-red border-red/20',
    gray: 'bg-charcoal-light/10 text-charcoal-light border-charcoal-light/20',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>{children}</span>;
}
