import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Projects } from "@/components/Projects";
import { Skills } from "@/components/Skills";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <ScrollReveal>
        <About />
      </ScrollReveal>
      <ScrollReveal delay={200}>
        <Projects />
      </ScrollReveal>
      <ScrollReveal delay={300}>
        <Skills />
      </ScrollReveal>
      <ScrollReveal delay={100}>
        <ContactForm />
      </ScrollReveal>
      <Footer />
    </div>
  );
}