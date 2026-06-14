'use client';

import { useEffect } from 'react';

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    // Fire-and-forget — don't block rendering
    fetch(`/api/views/${slug}`, { method: 'POST' }).catch(() => {});
  }, [slug]);

  return null; // invisible component — renders nothing
}
