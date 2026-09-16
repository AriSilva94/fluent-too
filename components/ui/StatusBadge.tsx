import { cn } from "@/lib/utils";

export default function StatusBadge({ published, publishedLabel, draftLabel }: {
  published: boolean;
  publishedLabel: string;
  draftLabel: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-lg px-3 py-1 text-xs font-bold",
        published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
      )}
    >
      {published ? publishedLabel : draftLabel}
    </span>
  );
}
