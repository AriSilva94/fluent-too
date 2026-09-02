import type { ReactNode } from 'react';

export const fieldControlClass =
  'w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 transition-colors placeholder:text-neutral-500 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40';

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-neutral-800">{label}</span>
      {hint && <span className="mt-1 block text-sm text-neutral-500">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export function FieldGroup({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <p id={id} className="text-sm font-semibold text-neutral-800">
        {label}
      </p>
      <div role="group" aria-labelledby={id} className="mt-2 space-y-2">
        {children}
      </div>
    </div>
  );
}
