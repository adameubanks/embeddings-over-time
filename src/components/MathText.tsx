import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathTextProps {
  children: string;
  block?: boolean;
}

const MathText: React.FC<MathTextProps> = ({ children, block = false }) => {
  if (block) {
    return <BlockMath math={children} />;
  }
  return <InlineMath math={children} />;
};

export default MathText;
