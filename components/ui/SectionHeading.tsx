import { ElementType } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
  as?: ElementType;
}

export default function SectionHeading({
  title,
  subtitle,
  center = false,
  as: Tag = "h2",
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={cn(center && "text-center", className)}>
      <Tag className="mb-3 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
        {title}
      </Tag>
      {subtitle && (
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
