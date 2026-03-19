import React from 'react';
import {Navbar} from '../section/navbar';
import {HeroSection} from '../section/Hero';
import {Aboutme} from '../section/Aboutme';
import {Skills} from '../section/skills';
import {Projects} from '../section/Projects';
import {Experience} from '../section/Experience';
import {ContactSection } from '../section/contact';
import {Footer} from '../section/Footer';



function Home() {
  return (
    <div className="home">
      <Navbar />
     <div>
        <HeroSection />
        <Aboutme />
        <Skills />
        <Projects />
        <Experience />
        <ContactSection />
        <Footer />
     </div>
    </div>
  );
}
export default Home;