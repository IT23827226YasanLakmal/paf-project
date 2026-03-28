import React from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeatureBentoGrid from '../components/landing/FeatureBentoGrid';
import Footer from '../components/layout/Footer';

const LandingPage = () => {
  return (
    <div className="bg-black min-h-screen text-white selection:bg-blue-500/30">
      <Navbar />
      <HeroSection />
      <FeatureBentoGrid />
      <Footer />
    </div>
  );
};

export default LandingPage;
