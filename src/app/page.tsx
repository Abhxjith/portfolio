import HeroSection from "../components/HeroSection";
import HighlightsSection from "../components/HighlightsSection";
import ExperienceSection from "../components/ExperienceSection";
import SkillStackSection from "../components/SkillStackSection";
import EducationSection from "../components/EducationSection";
import { client } from "../sanity/lib/client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [highlights, experiences, skills, education] = await Promise.all([
    client.fetch(`*[_type == "highlight"] | order(_createdAt desc){
      _id,
      title,
      mediaType,
      image,
      videoUrl,
      videoFile {
        asset->{
          url
        }
      },
      link
    }`).catch(() => []),
    client.fetch(`*[_type == "experience"] | order(order asc){
      _id, company, role, date, location, description, logo, link
    }`).catch(() => []),
    client.fetch(`*[_type == "skill"] | order(order asc){
      _id, category, skills
    }`).catch(() => []),
    client.fetch(`*[_type == "education"] | order(order asc){
      _id, institution, degree, date, cgpa, logo, link
    }`).catch(() => []),
  ]);

  return (
    <>
      <HeroSection />
      <HighlightsSection highlights={highlights} />
      <ExperienceSection experiences={experiences} />
      <SkillStackSection skillCategories={skills} />
      <EducationSection education={education} />
    </>
  );
}
