"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

const navItems = [
    { name: "dev", path: "/dev" },
    { name: "film", path: "/film" },
    { name: "ui/ux", path: "/uiux" },
    { name: "art", path: "/art" },
    { name: "blogs", path: "/blogs" },
];

export default function BottomNav() {
    const pathname = usePathname();
    const [hoveredPath, setHoveredPath] = useState<string | null>(null);

    return (
        <nav className="bottom-capsule" onMouseLeave={() => setHoveredPath(null)}>
            {navItems.map((item) => {
                const isActive = item.path === pathname || (item.path === "/blogs" && pathname.startsWith("/blogs"));
                const isHovered = hoveredPath === item.path;

                // Show indicator if hovered, OR if it's active and nothing is hovered
                const showIndicator = isHovered || (isActive && !hoveredPath);

                return (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`capsule-link ${isActive ? "active" : ""}`}
                        onMouseEnter={() => setHoveredPath(item.path)}
                    >
                        <span style={{ position: "relative", zIndex: 10 }}>{item.name}</span>

                        {showIndicator && (
                            <motion.div
                                layoutId="bottom-nav-indicator"
                                className="nav-indicator"
                                initial={false}
                                transition={{
                                    type: "spring",
                                    stiffness: 450,
                                    damping: 35,
                                    mass: 0.8,
                                }}
                            />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
