import React from 'react';
import {Navbar} from '../section/navbar';
import {HeroSection} from '../section/Hero';
import {Aboutme} from '../section/Aboutme';
import {Skills} from '../section/skills';



function Home() {
  return (
    <div className="home">
      <Navbar />
     <div>
        <HeroSection />
        <Aboutme />
        <Skills />
   

     </div>
    </div>
  );
}
export default Home;