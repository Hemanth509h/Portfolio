import React from 'react';
import {Navbar} from '../section/navbar';
import {HeroSection} from '../section/Hero';
import {Aboutme} from '../section/Aboutme';


function Home() {
  return (
    <div className="home">
      <Navbar />
     <div>
        <HeroSection />
        <Aboutme />

     </div>
    </div>
  );
}
export default Home;