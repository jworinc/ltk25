import React from 'react';

/**
 * CardAnchor component
 * Serves as a dynamic anchor for card content, similar to Angular's card.directive.ts.
 * Use to render card content dynamically via children or render prop.
 */
export function CardAnchor({ children }: { children: React.ReactNode }) {
  return <div className="card-anchor">{children}</div>;
}

// Usage Example:
// <CardAnchor>
//   <CardContent />
// </CardAnchor>
