
import type { SlateElementProps } from '@udecode/plate';

import { cn } from '@udecode/cn';
import { SlateElement } from '@udecode/plate';

export function HrElementStatic({
  children,
  className,
  ...props
}: SlateElementProps) {
  return (
    <SlateElement className={className} {...props}>
      <div className="cursor-text py-6" contentEditable={false}>
        <hr
          className={cn(
            'h-0.5 rounded-sm border-none bg-muted bg-clip-content'
          )}
        />
      </div>
      {children}
    </SlateElement>
  );
}
