/**
 * Agent 5: Skip to Content Component
 */

import * as React from 'react';

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only fixed top-4 left-4 z-[9999] bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary-400"
    >
      Skip to main content
    </a>
  );
}
