"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { motion } from "motion/react";

const TITLE_ANIMATION_PREFIX = "title-animation-seen:";

export const BlurredStagger = ({
    text = "we love hextaui.com ❤️",
    className = "",
    isSvg = false,
    animateOnce = false,
    onceKey,
}: {
    text: string;
    className?: string;
    isSvg?: boolean;
    /** Animate only the first time this page is visited in the session. */
    animateOnce?: boolean;
    /** Storage key override when animateOnce is true (defaults to pathname). */
    onceKey?: string;
}) => {
    const pathname = usePathname();
    const storageKey = animateOnce
        ? `${TITLE_ANIMATION_PREFIX}${onceKey ?? pathname}`
        : null;

    const [mode, setMode] = React.useState<"pending" | "animate" | "static">(() =>
        storageKey ? "pending" : "animate"
    );

    React.useLayoutEffect(() => {
        if (!storageKey) {
            setMode("animate");
            return;
        }

        if (sessionStorage.getItem(storageKey)) {
            setMode("static");
            return;
        }

        sessionStorage.setItem(storageKey, "1");
        setMode("animate");
    }, [storageKey]);

    const headingText = text;
    const StaticComponent = isSvg ? "tspan" : "span";
    const staticStyle = isSvg ? undefined : { display: "inline-block" as const };

    if (mode === "pending") {
        return (
            <StaticComponent
                className={className}
                style={{ ...staticStyle, visibility: "hidden" }}
                aria-hidden
            >
                {headingText}
            </StaticComponent>
        );
    }

    if (mode === "static") {
        return (
            <StaticComponent className={className} style={staticStyle}>
                {headingText}
            </StaticComponent>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04,
            },
        },
    };

    const letterAnimation = {
        hidden: {
            opacity: 0,
            filter: "blur(10px)",
        },
        show: {
            opacity: 1,
            filter: "blur(0px)",
        },
    };

    // We cast to any because motion.tspan exists but might not have perfect type definitions out of the box
    const MotionComponent = (isSvg ? motion.tspan : motion.span) as any;

    return (
        <MotionComponent
            variants={container}
            initial="hidden"
            animate="show"
            className={className}
            style={isSvg ? {} : { display: "inline-block" }}
        >
            {headingText.split("").map((char, index) => (
                <MotionComponent
                    key={index}
                    variants={letterAnimation}
                    transition={{ duration: 0.6 }}
                    style={isSvg ? {} : { display: "inline-block" }}
                >
                    {char === " " ? "\u00A0" : char}
                </MotionComponent>
            ))}
        </MotionComponent>
    );
};
