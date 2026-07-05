"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  analyzeRefraction,
  buildConicGradient,
  defaultGlassStyle,
  generateSmoothConvexMap,
  LIGHT_SOURCE,
  type DisplacementMap,
} from "@/lib/liquid-glass";

function GlassSpecularLayers() {
  return (
    <>
      <span
        className="absolute inset-0 rounded-[inherit] pointer-events-none z-[1]"
        style={{
          background: "color-mix(in srgb, white 12%, transparent)",
          backgroundImage:
            "radial-gradient(circle at calc(50% - var(--cos) * 50%) calc(50% - var(--sin) * 50%), rgba(255,255,255,0.35) 0%, transparent 55%)",
          boxShadow: `
            inset 0 0 0 1px color-mix(in srgb, white calc(var(--rim-intensity) * 28%), transparent),
            inset calc(var(--cos) * 2px) calc(var(--sin) * 3.5px) 0px -2px color-mix(in srgb, white calc(var(--rim-intensity) * 95%), transparent),
            inset calc(var(--cos) * -2px) calc(var(--sin) * -2px) 0px -2px color-mix(in srgb, white calc(var(--rim-intensity) * 85%), transparent),
            inset calc(var(--cos) * -3px) calc(var(--sin) * -8px) 1px -6px color-mix(in srgb, white calc(var(--rim-intensity) * 65%), transparent),
            inset calc(var(--cos) * -0.3px) calc(var(--sin) * -1px) 4px 0px color-mix(in srgb, black 14%, transparent),
            inset calc(var(--cos) * -1.5px) calc(var(--sin) * 2.5px) 0px -2px color-mix(in srgb, black 22%, transparent),
            inset calc(var(--cos) * 0px) calc(var(--sin) * 3px) 4px -2px color-mix(in srgb, black 18%, transparent),
            inset calc(var(--cos) * 2px) calc(var(--sin) * -6.5px) 1px -4px color-mix(in srgb, black 12%, transparent),
            calc(var(--cos) * 4px) calc(var(--sin) * 4px) 12px 0px color-mix(in srgb, black 18%, transparent),
            calc(var(--cos) * 8px) calc(var(--sin) * 10px) 24px 0px color-mix(in srgb, black 12%, transparent)
          `,
        }}
      />
      <span
        className="absolute inset-0 z-[2] rounded-[inherit] p-px pointer-events-none"
        style={{
          background: "var(--rim-gradient)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
          opacity: "calc(0.65 + var(--rim-intensity) * 0.28)",
        }}
      />
    </>
  );
}

export type LiquidGlassBarProps = React.HTMLAttributes<HTMLDivElement>;

export function LiquidGlassBar({
  className,
  children,
  style,
  ...props
}: LiquidGlassBarProps) {
  const shellRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<DisplacementMap | null>(null);
  const lastKeyRef = React.useRef("");

  React.useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const rebuildMap = () => {
      const width = shell.offsetWidth;
      const height = shell.offsetHeight;
      if (width > 0 && height > 0) {
        mapRef.current = generateSmoothConvexMap(width, height);
      }
    };

    rebuildMap();
    const observer = new ResizeObserver(rebuildMap);
    observer.observe(shell);

    let frameId = 0;
    const tick = () => {
      const el = shellRef.current;
      const map = mapRef.current;

      if (el && map) {
        const rect = el.getBoundingClientRect();
        const cx = (rect.left + rect.width / 2) / window.innerWidth;
        const cy = (rect.top + rect.height / 2) / window.innerHeight;
        const lightAz = Math.atan2(LIGHT_SOURCE.y - cy, LIGHT_SOURCE.x - cx);
        const key = lightAz.toFixed(2);

        if (key !== lastKeyRef.current) {
          lastKeyRef.current = key;
          const analysis = analyzeRefraction(map, lightAz);

          if (analysis) {
            const intensity = 0.4 + analysis.magnitude * 0.6;
            const cosVal = -Math.cos(analysis.domAngle) * intensity;
            const sinVal = -Math.sin(analysis.domAngle) * intensity;
            const lightAngleDeg = (analysis.domAngle * 180) / Math.PI + 90;

            el.style.setProperty("--cos", cosVal.toString());
            el.style.setProperty("--sin", sinVal.toString());
            el.style.setProperty("--light-angle", `${lightAngleDeg}deg`);
            el.style.setProperty("--rim-intensity", analysis.magnitude.toString());
            el.style.setProperty(
              "--rim-gradient",
              buildConicGradient(analysis.profile, lightAngleDeg)
            );
          }
        }
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={shellRef}
      className={cn("liquid-glass-bar relative isolate overflow-hidden", className)}
      style={{ ...defaultGlassStyle, ...style }}
      {...props}
    >
      <span
        className="absolute inset-0 rounded-[inherit] pointer-events-none z-0"
        aria-hidden
        style={{
          backdropFilter: "blur(48px) saturate(200%) brightness(1.1)",
          WebkitBackdropFilter: "blur(48px) saturate(200%) brightness(1.1)",
          background: "color-mix(in srgb, white 6%, transparent)",
        }}
      />
      <GlassSpecularLayers />
      <div className="relative z-[3] w-full">{children}</div>
    </div>
  );
}
