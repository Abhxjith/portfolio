"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface LiquidGlassViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  bgImage: string;
  fallbackMode?: "webgl" | "blur";
  children?: React.ReactNode;
}

export interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export interface LiquidGlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

interface LiquidGlassContextType {
  registerSurface: (id: string, element: HTMLElement) => void;
  unregisterSurface: (id: string) => void;
  mode: "svg" | "webgl" | "blur";
}

const LiquidGlassContext = React.createContext<LiquidGlassContextType | null>(null);

const BINS = 24;
const DISP_SCALE = 35;
const LIGHT_SOURCE = { x: 0.5, y: 0.0 };

function useMergedRef<T>(externalRef: React.ForwardedRef<T>, internalRef: React.RefObject<T | null>) {
  return React.useCallback(
    (node: T | null) => {
      internalRef.current = node;
      if (typeof externalRef === "function") {
        externalRef(node);
      } else if (externalRef) {
        externalRef.current = node;
      }
    },
    [externalRef, internalRef]
  );
}

function GlassLayers({ renderMode }: { renderMode: "svg" | "webgl" | "blur" }) {
  return (
    <>
      <span
        className="absolute inset-0 rounded-[inherit] pointer-events-none z-0"
        style={{
          background: renderMode === "webgl" ? "transparent" : "color-mix(in srgb, white 25%, transparent)",
          backdropFilter: renderMode === "webgl" ? "none" : "blur(2px) saturate(180%) brightness(1.05)",
          WebkitBackdropFilter: renderMode === "webgl" ? "none" : "blur(1px) saturate(180%) brightness(1.05)",
          backgroundImage:
            renderMode === "webgl"
              ? "none"
              : "radial-gradient(circle at calc(50% - var(--cos) * 50%) calc(50% - var(--sin) * 50%), rgba(255,255,255,0.2) 0%, transparent 60%)",
          boxShadow: `
              inset 0 0 0 1px color-mix(in srgb, white calc(var(--rim-intensity) * 20%), transparent),
              inset calc(var(--cos) * 1.8px) calc(var(--sin) * 3px) 0px -2px color-mix(in srgb, white calc(var(--rim-intensity) * 90%), transparent),
              inset calc(var(--cos) * -2px) calc(var(--sin) * -2px) 0px -2px color-mix(in srgb, white calc(var(--rim-intensity) * 80%), transparent),
              inset calc(var(--cos) * -3px) calc(var(--sin) * -8px) 1px -6px color-mix(in srgb, white calc(var(--rim-intensity) * 60%), transparent),
              inset calc(var(--cos) * -0.3px) calc(var(--sin) * -1px) 4px 0px color-mix(in srgb, black 12%, transparent),
              inset calc(var(--cos) * -1.5px) calc(var(--sin) * 2.5px) 0px -2px color-mix(in srgb, black 20%, transparent),
              inset calc(var(--cos) * 0px) calc(var(--sin) * 3px) 4px -2px color-mix(in srgb, black 20%, transparent),
              inset calc(var(--cos) * 2px) calc(var(--sin) * -6.5px) 1px -4px color-mix(in srgb, black 10%, transparent),
              calc(var(--cos) * 4px) calc(var(--sin) * 4px) 10px 0px color-mix(in srgb, black 15%, transparent),
              calc(var(--cos) * 9px) calc(var(--sin) * 9px) 18px 0px color-mix(in srgb, black 10%, transparent)
            `,
        }}
      />
      <span
        className="absolute inset-0 z-10 rounded-[inherit] p-px pointer-events-none"
        style={{
          background: "var(--rim-gradient)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
          opacity: "calc(0.62 + var(--rim-intensity) * 0.24)",
        }}
      />
    </>
  );
}

const defaultGlassStyle = {
  "--cos": "0",
  "--sin": "0",
  "--light-angle": "0deg",
  "--rim-intensity": "0.6",
  "--rim-gradient": "none",
} as React.CSSProperties;

export const LiquidGlassViewport = React.forwardRef<HTMLDivElement, LiquidGlassViewportProps>(
  ({ bgImage, fallbackMode = "webgl", className, children, ...props }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const targetRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const feImage0Ref = React.useRef<SVGFEImageElement>(null);
    const feImage1Ref = React.useRef<SVGFEImageElement>(null);

    const filterId0 = React.useId().replace(/:/g, "-") + "0";
    const filterId1 = React.useId().replace(/:/g, "-") + "1";

    const [mode, setMode] = React.useState<"svg" | "webgl" | "blur">("svg");
    const [displacementMapUrl, setDisplacementMapUrl] = React.useState<string | null>(null);
    const surfacesRef = React.useRef<Record<string, HTMLElement>>({});

    const activeFilter = React.useRef(0);
    const lastKeyRef = React.useRef("");
    const lastMapRef = React.useRef<{
      width: number;
      height: number;
      data: Uint8ClampedArray;
      url: string;
    } | null>(null);

    const glRef = React.useRef<WebGLRenderingContext | null>(null);
    const glProgRef = React.useRef<WebGLProgram | null>(null);
    const glTexRef = React.useRef<{ bg?: WebGLTexture; disp?: WebGLTexture }>({});
    const glLocRef = React.useRef<Record<string, WebGLUniformLocation | null>>({});
    const glReadyRef = React.useRef(false);
    const fallbackToBlurRef = React.useRef<() => void>(() => {});

    const generateSmoothConvexMap = React.useCallback((width: number, height: number, renderMode: string) => {
      const w = Math.max(1, Math.round(width) || 0);
      const h = Math.max(1, Math.round(height) || 0);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const imgData = ctx.createImageData(w, h);
      const data = imgData.data;
      const power = 3.5;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const nx = (x / w) * 2 - 1;
          const ny = (y / h) * 2 - 1;
          const d = Math.pow(Math.abs(nx), power) + Math.pow(Math.abs(ny), power);

          let r = 128;
          let g = 128;
          let a = 0;

          if (d <= 1) {
            const curveMagnitude = Math.sin(Math.pow(d, 0.8) * Math.PI);
            const dx = -nx * curveMagnitude;
            const dy = -ny * curveMagnitude;

            r = Math.round(128 + dx * 127);
            g = Math.round(128 + dy * 127);
            a = 255;
          }

          const index = (y * w + x) * 4;
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = 128;
          data[index + 3] = renderMode === "webgl" ? a : 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const url = canvas.toDataURL("image/png");
      lastMapRef.current = { width: w, height: h, data, url };
      return url;
    }, []);

    const analyzeRefraction = React.useCallback((lightAz: number) => {
      if (!lastMapRef.current) return null;
      const { width, height, data } = lastMapRef.current;
      const profile = new Array(BINS).fill(0);
      const counts = new Array(BINS).fill(0);
      let sumX = 0;
      let sumY = 0;
      let sumMag = 0;

      const step = 2;
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const i = (y * width + x) * 4;
          const bx = (data[i] - 128) / 127;
          const by = (data[i + 1] - 128) / 127;
          const mag = Math.hypot(bx, by);
          if (mag < 0.02) continue;

          const ang = Math.atan2(by, bx);
          const facing = Math.max(0, Math.cos(ang - lightAz));
          const bright = mag * (0.35 + 0.65 * facing);

          sumX += Math.cos(ang) * bright;
          sumY += Math.sin(ang) * bright;
          sumMag += bright;

          let bin = Math.floor(((ang + Math.PI) / (2 * Math.PI)) * BINS) % BINS;
          if (bin < 0) bin += BINS;
          profile[bin] += bright;
          counts[bin]++;
        }
      }

      let maxP = 0;
      for (let b = 0; b < BINS; b++) {
        if (counts[b]) profile[b] /= counts[b];
        if (profile[b] > maxP) maxP = profile[b];
      }
      if (maxP > 0) {
        for (let b = 0; b < BINS; b++) profile[b] /= maxP;
      }

      const domAngle = Math.atan2(sumY, sumX);
      const samples = Math.max(1, (width * height) / (step * step));
      const magnitude = Math.min(1, (sumMag / samples) * 6);

      return { profile, domAngle, magnitude };
    }, []);

    const buildConicGradient = React.useCallback((profile: number[], fromDeg: number) => {
      const stops: string[] = [];
      for (let b = 0; b <= BINS; b++) {
        const idx = b % BINS;
        const t = profile[idx];
        const deg = (b / BINS) * 360;
        const op = (0.07 + t * 0.63).toFixed(3);
        stops.push(`rgba(255,255,255,${op}) ${deg.toFixed(1)}deg`);
      }
      return `conic-gradient(from ${fromDeg.toFixed(1)}deg at 50% 50%, ${stops.join(", ")})`;
    }, []);

    const bindTex = React.useCallback(
      (gl: WebGLRenderingContext, tex: WebGLTexture, src: TexImageSource, unit: number) => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      },
      []
    );

    const fallbackToCSSBlur = React.useCallback(() => {
      setMode("blur");
    }, []);

    fallbackToBlurRef.current = fallbackToCSSBlur;

    const glSetDisplacement = React.useCallback(
      (url: string) => {
        const gl = glRef.current;
        const dispTex = glTexRef.current.disp;
        if (!gl || !dispTex) return;
        const img = new Image();
        img.onload = () => bindTex(gl, dispTex, img, 1);
        img.src = url;
      },
      [bindTex]
    );

    const initWebGL = React.useCallback(
      (canvas: HTMLCanvasElement) => {
        try {
          const gl =
            (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
            (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
          if (!gl) return false;

          const vs = `attribute vec2 p; varying vec2 uv; void main() { uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
          const fs = `
          precision highp float; varying vec2 uv; uniform sampler2D bg; uniform sampler2D disp;
          uniform vec2 res; uniform vec4 rect; uniform float scale;
          void main() {
            vec2 frag = vec2(uv.x * res.x, (1.0 - uv.y) * res.y);
            vec2 local = (frag - rect.xy) / rect.zw;
            vec3 outc = texture2D(bg, uv).rgb;
            if (local.x >= 0.0 && local.x <= 1.0 && local.y >= 0.0 && local.y <= 1.0) {
              vec4 dm = texture2D(disp, vec2(local.x, local.y));
              if (dm.a > 0.01) {
                vec2 d = (dm.rg - 0.5) * 2.0 * scale;
                vec2 s = (frag + d) / res;
                outc = texture2D(bg, vec2(s.x, 1.0 - s.y)).rgb;
              }
            }
            gl_FragColor = vec4(outc, 1.0);
          }
        `;
          const sh = (t: number, s: string) => {
            const o = gl.createShader(t);
            if (!o) throw new Error("Could not create shader");
            gl.shaderSource(o, s);
            gl.compileShader(o);
            return o;
          };
          const prog = gl.createProgram();
          if (!prog) return false;
          gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
          gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
          gl.linkProgram(prog);
          gl.useProgram(prog);

          const buf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
          const loc = gl.getAttribLocation(prog, "p");
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

          glRef.current = gl;
          glProgRef.current = prog;
          glLocRef.current = {
            bg: gl.getUniformLocation(prog, "bg"),
            disp: gl.getUniformLocation(prog, "disp"),
            res: gl.getUniformLocation(prog, "res"),
            rect: gl.getUniformLocation(prog, "rect"),
            scale: gl.getUniformLocation(prog, "scale"),
          };
          glTexRef.current = {
            bg: gl.createTexture() || undefined,
            disp: gl.createTexture() || undefined,
          };

          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            if (!glRef.current || !glTexRef.current.bg) return;
            bindTex(gl, glTexRef.current.bg, img, 0);
            glReadyRef.current = true;
          };
          img.onerror = () => {
            glReadyRef.current = false;
            fallbackToBlurRef.current();
          };
          img.src = bgImage;
          return true;
        } catch {
          return false;
        }
      },
      [bgImage, bindTex]
    );

    const registerSurface = React.useCallback(
      (id: string, element: HTMLElement) => {
        surfacesRef.current[id] = element;
        const surfaceW = element.offsetWidth || 180;
        const surfaceH = element.offsetHeight || 60;
        element.style.borderRadius = `${surfaceH / 2}px`;

        const mapData = generateSmoothConvexMap(surfaceW, surfaceH, mode);
        if (mapData) {
          if (mode === "svg") {
            setDisplacementMapUrl(mapData);
          } else if (mode === "webgl") {
            glSetDisplacement(mapData);
          }
        }
      },
      [mode, generateSmoothConvexMap, glSetDisplacement]
    );

    const unregisterSurface = React.useCallback((id: string) => {
      delete surfacesRef.current[id];
    }, []);

    React.useEffect(() => {
      if (!displacementMapUrl) return;
      feImage0Ref.current?.setAttribute("href", displacementMapUrl);
      feImage1Ref.current?.setAttribute("href", displacementMapUrl);
    }, [displacementMapUrl]);

    React.useEffect(() => {
      const container = containerRef.current;
      const target = targetRef.current;
      const canvas = canvasRef.current;
      if (!container) return;

      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const isSafariMac = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      let detectedMode: "svg" | "webgl" | "blur" = "svg";
      if (isIOS || isSafariMac) detectedMode = fallbackMode === "webgl" ? "webgl" : "blur";

      setMode(detectedMode);

      if (detectedMode === "webgl" && canvas) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        initWebGL(canvas);
      }

      let animationFrameId: number;

      const loop = () => {
        const surfaces = Object.values(surfacesRef.current);
        if (surfaces.length === 0) {
          animationFrameId = requestAnimationFrame(loop);
          return;
        }

        const surface = surfaces[0];
        const rect = surface.getBoundingClientRect();
        const pRect = container.getBoundingClientRect();

        const surfaceCenterX = rect.left + rect.width / 2;
        const surfaceCenterY = rect.top + rect.height / 2;

        if (pRect.width > 0 && pRect.height > 0) {
          const currentX = (surfaceCenterX - pRect.left) / pRect.width;
          const currentY = (surfaceCenterY - pRect.top) / pRect.height;

          const dx = LIGHT_SOURCE.x - currentX;
          const dy = LIGHT_SOURCE.y - currentY;
          const lightAz = Math.atan2(dy, dx);

          const key = lightAz.toFixed(2);
          if (key !== lastKeyRef.current) {
            lastKeyRef.current = key;
            const analysis = analyzeRefraction(lightAz);
            if (analysis) {
              const intensity = 0.4 + analysis.magnitude * 0.6;
              const cosVal = -Math.cos(analysis.domAngle) * intensity;
              const sinVal = -Math.sin(analysis.domAngle) * intensity;
              const lightAngleDeg = (analysis.domAngle * 180) / Math.PI + 90;
              const rimGradient = buildConicGradient(analysis.profile, lightAngleDeg);

              surface.style.setProperty("--cos", cosVal.toString());
              surface.style.setProperty("--sin", sinVal.toString());
              surface.style.setProperty("--light-angle", `${lightAngleDeg}deg`);
              surface.style.setProperty("--rim-intensity", analysis.magnitude.toString());
              surface.style.setProperty("--rim-gradient", rimGradient);
            }
          }
        }

        if (detectedMode === "svg" && target) {
          const localLeft = rect.left - pRect.left;
          const localTop = rect.top - pRect.top;

          const currentFeImage = activeFilter.current === 0 ? feImage0Ref.current : feImage1Ref.current;
          if (currentFeImage) {
            currentFeImage.setAttribute("x", localLeft.toString());
            currentFeImage.setAttribute("y", localTop.toString());
            currentFeImage.setAttribute("width", rect.width.toString());
            currentFeImage.setAttribute("height", rect.height.toString());
          }
          target.style.filter = `url(#${activeFilter.current === 0 ? filterId0 : filterId1})`;
          activeFilter.current = 1 - activeFilter.current;
        } else if (detectedMode === "webgl" && glReadyRef.current && canvas) {
          const gl = glRef.current;
          const prog = glProgRef.current;
          if (gl && prog) {
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.useProgram(prog);
            gl.uniform1i(glLocRef.current.bg, 0);
            gl.uniform1i(glLocRef.current.disp, 1);
            gl.uniform2f(glLocRef.current.res, canvas.width, canvas.height);

            const localLeft = rect.left - pRect.left;
            const localTop = rect.top - pRect.top;

            gl.uniform4f(glLocRef.current.rect, localLeft, localTop, rect.width, rect.height);
            gl.uniform1f(glLocRef.current.scale, DISP_SCALE);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          }
        }
        animationFrameId = requestAnimationFrame(loop);
      };

      animationFrameId = requestAnimationFrame(loop);

      const handleResize = () => {
        if (!containerRef.current) return;
        if (canvas) {
          canvas.width = containerRef.current.clientWidth;
          canvas.height = containerRef.current.clientHeight;
        }
      };
      window.addEventListener("resize", handleResize);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", handleResize);
        const gl = glRef.current;
        if (gl) {
          if (glTexRef.current.bg) gl.deleteTexture(glTexRef.current.bg);
          if (glTexRef.current.disp) gl.deleteTexture(glTexRef.current.disp);
          if (glProgRef.current) gl.deleteProgram(glProgRef.current);
        }
      };
    }, [
      analyzeRefraction,
      buildConicGradient,
      initWebGL,
      glSetDisplacement,
      fallbackMode,
      filterId0,
      filterId1,
    ]);

    const contextValue = React.useMemo(
      () => ({
        registerSurface,
        unregisterSurface,
        mode,
      }),
      [registerSurface, unregisterSurface, mode]
    );

    const setContainerRef = useMergedRef(ref, containerRef);

    return (
      <LiquidGlassContext.Provider value={contextValue}>
        <div
          ref={setContainerRef}
          className={cn("relative w-full h-full overflow-hidden bg-transparent select-none", className)}
          {...props}
        >
          <canvas
            ref={canvasRef}
            className={cn(
              "absolute inset-0 w-full h-full pointer-events-none z-0",
              mode === "webgl" ? "block" : "hidden"
            )}
          />

          <div
            ref={targetRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden will-change-[filter] [transform:translateZ(0)]"
            style={{ filter: mode === "svg" ? `url(#${filterId0})` : "none" }}
          >
            <div
              className="absolute inset-0 w-[102%] h-[102%] -left-[1%] -top-[1%] bg-cover bg-center"
              style={{ backgroundImage: `url(${bgImage})` }}
            />
          </div>

          <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter
                id={filterId0}
                x="0"
                y="0"
                width="100%"
                height="100%"
                filterUnits="userSpaceOnUse"
                primitiveUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feImage
                  ref={feImage0Ref}
                  {...(displacementMapUrl ? { href: displacementMapUrl } : {})}
                  x="0"
                  y="0"
                  width="200"
                  height="80"
                  result="lens"
                  preserveAspectRatio="none"
                />
                <feFlood floodColor="rgb(128,128,128)" result="neutral" />
                <feComposite in="lens" in2="neutral" operator="over" result="dispMap" />
                <feDisplacementMap in="SourceGraphic" in2="dispMap" scale={DISP_SCALE.toString()} xChannelSelector="R" yChannelSelector="G" />
              </filter>
              <filter
                id={filterId1}
                x="0"
                y="0"
                width="100%"
                height="100%"
                filterUnits="userSpaceOnUse"
                primitiveUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feImage
                  ref={feImage1Ref}
                  {...(displacementMapUrl ? { href: displacementMapUrl } : {})}
                  x="0"
                  y="0"
                  width="200"
                  height="80"
                  result="lens"
                  preserveAspectRatio="none"
                />
                <feFlood floodColor="rgb(128,128,128)" result="neutral" />
                <feComposite in="lens" in2="neutral" operator="over" result="dispMap" />
                <feDisplacementMap in="SourceGraphic" in2="dispMap" scale={DISP_SCALE.toString()} xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>

          {children}
        </div>
      </LiquidGlassContext.Provider>
    );
  }
);
LiquidGlassViewport.displayName = "LiquidGlassViewport";

export const LiquidGlassSurface = React.forwardRef<HTMLDivElement, LiquidGlassSurfaceProps>(
  ({ className, children, style, ...props }, ref) => {
    const context = React.useContext(LiquidGlassContext);
    const internalRef = React.useRef<HTMLDivElement>(null);
    const setRef = useMergedRef(ref, internalRef);
    const surfaceId = React.useId();

    React.useEffect(() => {
      if (context && internalRef.current) {
        context.registerSurface(surfaceId, internalRef.current);
      }
      return () => {
        if (context) {
          context.unregisterSurface(surfaceId);
        }
      };
    }, [context, surfaceId]);

    const renderMode = context ? context.mode : "svg";

    return (
      <div
        ref={setRef}
        className={cn("relative select-none pointer-events-auto w-full h-full overflow-hidden", className)}
        style={{ ...defaultGlassStyle, ...style }}
        {...props}
      >
        <GlassLayers renderMode={renderMode} />
        <div className="relative z-20 w-full h-full">{children}</div>
      </div>
    );
  }
);
LiquidGlassSurface.displayName = "LiquidGlassSurface";

export const LiquidGlassButton = React.forwardRef<HTMLButtonElement, LiquidGlassButtonProps>(
  ({ className, children, style, ...props }, ref) => {
    const context = React.useContext(LiquidGlassContext);
    const internalRef = React.useRef<HTMLButtonElement>(null);
    const setRef = useMergedRef(ref, internalRef);
    const buttonId = React.useId();

    React.useEffect(() => {
      if (context && internalRef.current) {
        context.registerSurface(buttonId, internalRef.current);
      }
      return () => {
        if (context) {
          context.unregisterSurface(buttonId);
        }
      };
    }, [context, buttonId]);

    const renderMode = context ? context.mode : "svg";

    return (
      <button
        ref={setRef}
        className={cn(
          "relative select-none pointer-events-auto inline-flex items-center justify-center px-12 py-5 border-0 bg-transparent cursor-pointer outline-none origin-center transition-transform duration-[400ms] ease-[cubic-bezier(0.4,1.5,0.3,1)] active:scale-[0.96]",
          className
        )}
        style={{ ...defaultGlassStyle, ...style }}
        {...props}
      >
        <GlassLayers renderMode={renderMode} />
        <span className="relative z-20 text-sm font-semibold tracking-wide text-black/85 select-none pointer-events-none flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);
LiquidGlassButton.displayName = "LiquidGlassButton";
