import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 px-4">
      {/* Dynamic Animated Orbs */}
      <motion.div 
        animate={{ 
          y: [0, -50, 0],
          x: [0, 30, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity,
          ease: "linear" 
        }}
        className="absolute top-[15%] left-[20%] w-[350px] h-[350px] bg-accent/20 blur-[120px] rounded-full pointer-events-none z-0" 
      />
      <motion.div 
        animate={{ 
          y: [0, 60, 0],
          x: [0, -40, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 16, 
          repeat: Infinity,
          ease: "linear" 
        }}
        className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none z-0" 
      />
      
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 mt-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-5xl md:text-8xl font-black text-primary tracking-tight leading-[1.1]">
            Next generation <br className="hidden md:block"/>
            of <span className="text-gradient-blue bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">Campus Life.</span>
          </h1>
        </motion.div>

        <motion.p 
          className="text-xl md:text-2xl text-muted max-w-2xl mx-auto tracking-wide font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          Pro-grade operations. Seamless experiences. Unprecedented control over every asset, room, and resource.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link to="/app" className="px-8 py-4 rounded-xl bg-accent text-white font-bold text-lg hover:opacity-95 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-accent/20">
            Enter Dashboard
          </Link>
          <a href="#features" className="px-8 py-4 rounded-xl border border-subtle text-primary font-bold text-lg hover:bg-surface/30 transition-all duration-300">
            Explore Features
          </a>
        </motion.div>
      </div>
      
      {/* Dashboard Mockup Showcase */}
      <motion.div 
        className="w-full max-w-6xl mt-24 aspect-[16/9] relative overflow-hidden flex items-center justify-center group z-10"
        initial={{ opacity: 0, scale: 0.9, y: 60 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent z-10" />
        <div className="w-[90%] h-[95%] bg-surface/40 backdrop-blur-2xl border border-subtle rounded-t-3xl md:rounded-t-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden relative translate-y-[5%] group-hover:-translate-y-[2%] transition-transform duration-1000 ease-out">
            <div className="absolute top-0 inset-x-0 h-10 border-b border-subtle flex items-center px-4 space-x-2 bg-surface/50 backdrop-blur-md">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
            </div>
            <div className="absolute inset-x-0 bottom-0 top-10 flex p-6 gap-6">
                {/* Mock Sidebar */}
                <div className="w-1/4 h-full bg-surface/30 rounded-lg border border-subtle p-4 flex flex-col gap-3 hidden md:flex">
                  <div className="w-3/4 h-4 bg-muted-fill rounded mb-4" />
                  <div className="w-full h-8 bg-accent/20 rounded border border-accent/30" />
                  <div className="w-full h-8 bg-surface/10 rounded" />
                  <div className="w-full h-8 bg-surface/10 rounded" />
                </div>
                {/* Mock Main Content */}
                <div className="flex-1 flex flex-col gap-6">
                  <div className="w-1/3 h-8 bg-white/10 rounded-md" />
                  <div className="flex gap-4">
                    <div className="flex-1 h-32 bg-white/5 rounded-lg border border-white/5" />
                    <div className="flex-1 h-32 bg-white/5 rounded-lg border border-white/5" />
                    <div className="flex-1 h-32 bg-white/5 rounded-lg border border-white/5" />
                  </div>
                  <div className="w-full h-64 bg-white/5 rounded-lg border border-white/5" />
                </div>
            </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
