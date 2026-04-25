import React from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeatureBentoGrid from '../components/landing/FeatureBentoGrid';
import Footer from '../components/layout/Footer';

const LandingPage = () => {
  return (
    <div className="bg-canvas text-primary font-sans antialiased min-h-screen glossy-mesh selection:bg-accent/30 overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeatureBentoGrid />
      <Footer />
    </div>
  );
};

export default LandingPage;
