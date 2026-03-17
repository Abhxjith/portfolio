import HeroSection from "../components/HeroSection";
import HighlightsSection from "../components/HighlightsSection";
import ExperienceSection from "../components/ExperienceSection";
import SkillStackSection from "../components/SkillStackSection";
import EducationSection from "../components/EducationSection";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <HeroSection />
      <HighlightsSection />
      <ExperienceSection />
      <SkillStackSection />
      <EducationSection />
    </>
  );
}
