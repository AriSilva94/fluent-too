import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-2 text-sm font-bold text-brand-blue">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex min-h-8 items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="rounded-md text-brand-blue transition-colors hover:text-brand-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className="text-neutral-600">
                  {item.label}
                </span>
              )}
              {!isLast ? <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-orange" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
