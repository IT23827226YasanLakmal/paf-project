import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 px-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tight leading-[1.1]">
            Next generation <br className="hidden md:block"/>
            of <span className="text-gradient-blue">Campus Life.</span>
          </h1>
        </motion.div>

        <motion.p 
          className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto tracking-wide font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Pro-grade operations. Seamless experiences. Unprecedented control over every asset, room, and resource.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link to="/app" className="px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:scale-105 active:scale-95 transition-transform duration-300">
            Enter Dashboard
          </Link>
          <a href="#features" className="px-8 py-4 rounded-full border border-gray-700 text-white font-semibold text-lg hover:bg-white/5 transition-colors duration-300">
            Explore Features
          </a>
        </motion.div>
      </div>
      
      {/* Dashboard Mockup Showcase */}
      <motion.div 
        className="w-full max-w-6xl mt-24 aspect-[16/9] glass-card relative overflow-hidden flex items-center justify-center group"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <div className="w-[90%] h-[95%] bg-[#0a0a0a] border border-white/10 rounded-t-lg md:rounded-t-2xl shadow-2xl overflow-hidden relative translate-y-[5%] group-hover:-translate-y-[2%] transition-transform duration-1000 ease-out">
            <div className="absolute top-0 inset-x-0 h-10 border-b border-white/10 flex items-center px-4 space-x-2 bg-white/5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
            </div>
            <div className="absolute inset-x-0 bottom-0 top-10 flex p-6 gap-6">
                {/* Mock Sidebar */}
                <div className="w-1/4 h-full bg-white/5 rounded-lg border border-white/5 p-4 flex flex-col gap-3 hidden md:flex">
                  <div className="w-3/4 h-4 bg-white/10 rounded mb-4" />
                  <div className="w-full h-8 bg-blue-500/20 rounded border border-blue-500/30" />
                  <div className="w-full h-8 bg-white/5 rounded" />
                  <div className="w-full h-8 bg-white/5 rounded" />
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
