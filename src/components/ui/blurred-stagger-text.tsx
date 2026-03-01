"use client"

import * as React from "react"
import { motion } from "motion/react";

export const BlurredStagger = ({
    text = "we love hextaui.com ❤️",
    className = "",
    isSvg = false,
}: {
    text: string;
    className?: string;
    isSvg?: boolean;
}) => {
    const headingText = text;

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
