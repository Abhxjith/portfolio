"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type CoverImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

function isRemote(src: string) {
  return src.startsWith("https://") || src.startsWith("http://");
}

export default function CoverImage({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 768px) 72vw, 280px",
  className = "",
}: CoverImageProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const remote = isRemote(src);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  useEffect(() => {
    const el = imgRef.current;
    if (el?.complete && el.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const markLoaded = () => setLoaded(true);

  return (
    <div
      className={`cover-image ${loaded ? "cover-image--loaded" : ""} ${className}`.trim()}
    >
      <div className="cover-image__skeleton" aria-hidden />
      {remote ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className="cover-image__img"
          onLoad={markLoaded}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="cover-image__img"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={markLoaded}
          draggable={false}
        />
      )}
    </div>
  );
}
