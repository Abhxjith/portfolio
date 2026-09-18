"use client";

import { forwardRef } from "react";

type SpinningGalleryCuboidProps = {
  className?: string;
  spinning?: boolean;
};

const SpinningGalleryCuboid = forwardRef<HTMLDivElement, SpinningGalleryCuboidProps>(
  function SpinningGalleryCuboid({ className = "", spinning = true }, ref) {
    return (
      <div
        className={`gallery-cuboid-scene ${className}`.trim()}
        aria-hidden
      >
        <div
          ref={ref}
          className={`gallery-cuboid ${spinning ? "gallery-cuboid--spinning" : ""}`}
        >
          <div className="gallery-cuboid-face gallery-cuboid-face--front" />
          <div className="gallery-cuboid-face gallery-cuboid-face--back" />
          <div className="gallery-cuboid-face gallery-cuboid-face--right" />
          <div className="gallery-cuboid-face gallery-cuboid-face--left" />
          <div className="gallery-cuboid-face gallery-cuboid-face--top" />
          <div className="gallery-cuboid-face gallery-cuboid-face--bottom" />
        </div>
      </div>
    );
  }
);

export default SpinningGalleryCuboid;
