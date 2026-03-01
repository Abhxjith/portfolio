import Image from "next/image";
import InteractiveAvatar from "../../components/ui/InteractiveAvatar";
import { BlurredStagger } from "../../components/ui/blurred-stagger-text";
import { client } from "../../sanity/lib/client";
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

export const dynamic = 'force-dynamic';

export default async function About() {
    const data = await client.fetch(`*[_type == "aboutPage"][0]{
        aboutDescription
    }`);
    return (
        <div className="about-page">
            <div className="hero-section">
                <div className="hero-name-curve who-am-i-curve">
                    <svg width="280" height="150" viewBox="0 0 280 150" className="curve-svg">
                        <path id="curve-about" d="M 60,140 A 80,80 0 0,1 220,140" fill="transparent" />
                        <text fill="var(--text-primary)" className="instrument-serif" fontSize="46" textAnchor="middle" letterSpacing="-0.07em">
                            <textPath href="#curve-about" startOffset="50%">
                                Who am i?
                            </textPath>
                        </text>
                    </svg>
                </div>

                <div className="hero-avatar about-avatar">
                    <InteractiveAvatar priority={true} />
                </div>

                <h1 className="about-title"><BlurredStagger text="about me" /></h1>

                <div className="about-content" style={{ width: "100%", maxWidth: "600px", marginInline: "auto", textAlign: "left" }}>
                    {data?.aboutDescription ? (
                        <PortableText value={data.aboutDescription} components={ptComponents} />
                    ) : (
                        <>
                            <p>
                                hey, my name is Abhijith and i make silly mobile apps, i have experience with frontend and backend development for web, app and chrome extensions. i like making things from scratch, whether it be branding to UI UX to coding, i like to do it all.
                            </p>
                            <p>
                                Fun Fact: i once made a character which has now crossed over 100 million views on Giphy
                            </p>
                            <p>
                                I also write stuff on medium whenever i can, i read books (add a book list), i run, leetcode, i also edit videos and make lil films sometimes :p
                            </p>
                            <p>
                                My expertise lies in my imagination and the way i make it happen, I have strong visions and i will always find ways to make it happen irrespective of my skills. (I am quite passion driven like that)
                                <br />
                                For eg:- I made this video on
                            </p>
                            <p>
                                My professional experiences include my internship at iit bombay after which i joined a startup while pursuing final semester and also cracked a campus placement, after which i've been working at Schapira CPA as a Full Stack Developer.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
