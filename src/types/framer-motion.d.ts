declare module 'framer-motion' {
  import * as React from 'react';

  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    variants?: any;
    style?: React.CSSProperties;
    className?: string;
    [key: string]: any;
  }

  export type MotionComponent<P = {}> = React.ComponentType<P & MotionProps>;

  export const motion: {
    div: MotionComponent<React.HTMLAttributes<HTMLDivElement>>;
    span: MotionComponent<React.HTMLAttributes<HTMLSpanElement>>;
    svg: MotionComponent<React.SVGAttributes<SVGElement>>;
    path: MotionComponent<React.SVGAttributes<SVGPathElement>>;
    [key: string]: MotionComponent;
  };

  export const AnimatePresence: React.FC<{
    children?: React.ReactNode;
    exitBeforeEnter?: boolean;
    initial?: boolean;
    onExitComplete?: () => void;
  }>;
}
