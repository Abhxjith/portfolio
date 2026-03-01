"use client";

import { useState } from "react";
import Image from "next/image";

interface InteractiveAvatarProps {
    width?: number;
    height?: number;
    priority?: boolean;
}

export default function InteractiveAvatar({ width = 122, height = 122, priority = false }: InteractiveAvatarProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="avatar-wrapper interactive-avatar"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ position: 'relative' }}
        >
            <Image
                src="/avatar.png"
                alt="Abhijith Jinnu Avatar"
                width={width}
                height={height}
                priority={priority}
                style={{
                    objectFit: "cover",
                }}
            />

            <Image
                src="/blush.png"
                alt="Abhijith Jinnu Blushing"
                width={width}
                height={height}
                priority={priority}
                style={{
                    objectFit: "cover",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    transition: "opacity 0.4s ease",
                    opacity: isHovered ? 1 : 0
                }}
            />
        </div>
    );
}
