import React from 'react';

/**
 * TestAnchor component
 * Serves as a dynamic anchor for test-step content, similar to Angular's test.directive.ts.
 * Use to render test-step content dynamically via children or render prop.
 */
export function TestAnchor({ children }: { children: React.ReactNode }) {
  return <div className="test-anchor">{children}</div>;
}

// Usage Example:
// <TestAnchor>
//   <TestStepContent />
// </TestAnchor>
