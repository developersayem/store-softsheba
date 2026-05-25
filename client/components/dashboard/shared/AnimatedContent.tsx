import React, { ReactNode } from "react";

interface AnimatedContentProps {
  children: ReactNode;
}

const AnimatedContent: React.FC<AnimatedContentProps> = ({ children }) => {
  return <div className="tab tab-enter">{children}</div>;
};

export default AnimatedContent;
