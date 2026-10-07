"use client";

import { useState } from "react";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Sin permiso de portapapeles: el número sigue visible para copiarlo a mano.
        }
      }}
      className="rounded-full border border-brand-ink/30 px-3 py-1 text-xs font-medium text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-cream"
    >
      {copied ? "¡Copiado!" : label}
    </button>
  );
}
