import React from "react";

export default function BackgroundGrid({ className = "", children }) {
  return (
    <div className={`relative h-full w-full bg-black ${className}`}>
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#4441_1px,transparent_1px),linear-gradient(to_bottom,#4441_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"
        aria-hidden="true"
      />
      {children}
    </div>
  );
} 