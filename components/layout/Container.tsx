import { ReactNode } from 'react';

type ContainerSize = 'content' | 'wide';

interface ContainerProps {
  children: ReactNode;
  size?: ContainerSize;
  className?: string;
}

export function Container({ children, size = 'wide', className = '' }: ContainerProps) {
  const maxWidth = size === 'content' ? 'max-w-content' : 'max-w-wide';

  return (
    <div className={`mx-auto px-6 ${maxWidth} ${className}`}>
      {children}
    </div>
  );
}
