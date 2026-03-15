import Image from "next/image";
import InteractiveAvatar from "./ui/InteractiveAvatar";
import { BlurredStagger } from "./ui/blurred-stagger-text";
import MoreSection from "./MoreSection";
import { client } from "../sanity/lib/client";
import { PortableText } from "@portabletext/react";
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
    return builder.image(source);
}

const ptComponents = {
    types: {
        image: ({ value }: any) => {
            if (!value?.asset?._ref) {
                return null;
            }
            return (
                <img
                    alt={value.alt || ' '}
                    loading="lazy"
                    src={urlFor(value).width(800).fit('max').auto('format').url()}
                    style={{ width: '100%', borderRadius: '12px', marginTop: '16px', marginBottom: '16px' }}
                />
            );
        },
    },
};

export default async function HeroSection() {
    const settings = await client.fetch(`*[_type == "siteSettings"][0]{
        jobTitle, heroDescription
    }`);

    return (
        <div className="hero-section">
            <div className="hero-name-curve">
                <svg width="280" height="150" viewBox="0 0 280 150" className="curve-svg">
                    <path id="curve" d="M 40,140 A 100,100 0 0,1 240,140" fill="transparent" />
                    <text fill="var(--text-primary)" className="instrument-serif" fontSize="44" textAnchor="middle" letterSpacing="-0.07em">
                        <textPath href="#curve" startOffset="50%">
                            Abhijith Jinnu
                        </textPath>
                    </text>
                </svg>
            </div>

            <div className="hero-avatar">
                <InteractiveAvatar priority={true} />
            </div>

            <div className="hero-subtitle">
                <BlurredStagger text={settings?.jobTitle || "dev @ schapira"} />
            </div>

            <MoreSection />

            <div className="hero-description" style={{ width: "100%", maxWidth: "600px", textAlign: "center", margin: "32px auto 0 auto" }}>
                {settings?.heroDescription ? (
                    <PortableText value={settings.heroDescription} components={ptComponents} />
                ) : (
                    <p style={{ textAlign: "center" }}>
                        i make silly mobile apps, i have experience with frontend and backend development for web, app and chrome extensions. i like making things from scratch, whether it be branding to UI UX to coding, i like to do it all.
                    </p>
                )}
            </div>
        </div>
    );
}
