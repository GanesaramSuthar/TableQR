import type { ReactNode } from "react";

export default function Card({ children, className = '', onClick, hover }: { children: ReactNode; className?: string; onClick?: () => void; hover?: boolean }) {
  return (
    <div className={`bg-white rounded-2xl shadow-md border border-cream-dark/50 ${hover ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer transition-all duration-200' : ''} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
